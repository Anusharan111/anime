import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import Pusher from "pusher";
import { CHARACTERS } from "../src/data/characters.js";
import { Character, MatchHistory } from "../src/types.js";
import { resolveKitsuAnimeId, fetchKitsuCharacters } from "../src/utils/kitsu.js";
import { fetchJikanCharacters } from "../src/utils/jikan.js";
import { getMalIdFromAniList } from "../src/utils/malMapper.js";

// Load environment variables
dotenv.config();

const app = express();

// Express JSON and urlencoded middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS – allow front-end to call the API
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// In-Memory Databases (Vercel serverless keeps these warm across requests in the same container instance)
const matchHistory: MatchHistory[] = [];
let activeCharactersPool = [...CHARACTERS];
const generatedImages = new Map<string, Buffer>();

// Initialize Pusher lazily
let pusherInstance: Pusher | null = null;
function getPusher(): Pusher | null {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    return null;
  }
  if (!pusherInstance) {
    pusherInstance = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });
  }
  return pusherInstance;
}

// Initialize GoogleGenAI lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ---------------- STAT UTILS ----------------
function calculateStats(team: Character[]) {
  return team.reduce(
    (acc, char) => {
      acc.strength += char.stats.strength;
      acc.speed += char.stats.speed;
      acc.iq += char.stats.iq;
      acc.defense += char.stats.defense;
      acc.magic += char.stats.magic;
      acc.overall += char.overallPower;
      return acc;
    },
    { strength: 0, speed: 0, iq: 0, defense: 0, magic: 0, overall: 0 }
  );
}

function seededNumber(seed: string, salt: number): number {
  let hash = 2166136261;
  const text = `${seed}:${salt}`;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function buildImportedStats(seed: string, favorites: number, role: string) {
  const base = (salt: number) => 45 + (seededNumber(seed, salt) % 31);
  const popularityBoost = Math.min(20, Math.floor(Math.log10(Math.max(1, favorites)) * 4));
  const mainBoost = role === "Main" ? 8 : 0;

  return {
    strength: Math.min(100, base(1) + popularityBoost + mainBoost),
    speed: Math.min(100, base(2) + popularityBoost + mainBoost),
    iq: Math.min(100, base(3) + Math.floor(popularityBoost / 2) + mainBoost),
    defense: Math.min(100, base(4) + Math.floor(popularityBoost / 2)),
    magic: Math.min(100, base(5) + popularityBoost),
  };
}

function rarityFromFavorites(favorites: number): Character["rarity"] {
  if (favorites >= 50000) return "Legendary";
  if (favorites >= 15000) return "Epic";
  if (favorites >= 4000) return "Rare";
  return "Common";
}

function colorFromFavorites(favorites: number): string {
  if (favorites >= 50000) return "#facc15";
  if (favorites >= 15000) return "#a855f7";
  if (favorites >= 4000) return "#38bdf8";
  return "#94a3b8";
}

function rarityFromCastPosition(index: number, favorites: number): Character["rarity"] {
  const favoriteRarity = rarityFromFavorites(favorites);
  if (favoriteRarity !== "Common") return favoriteRarity;
  if (index < 2) return "Legendary";
  if (index < 6) return "Epic";
  if (index < 16) return "Rare";
  return "Common";
}

function buildAniListCastCharacter(edge: any, animeTitle: string, index = 0): Character | null {
  const node = edge?.node;
  if (!node?.id || !node?.name?.full) return null;

  const favorites = Number(node.favourites || 0);
  const role = edge.role === "MAIN" ? "Main" : "Supporting";
  const stats = buildImportedStats(`${node.id}-${node.name.full}`, favorites, role);
  const overallPower = stats.strength + stats.speed + stats.iq + stats.defense + stats.magic;
  const rarity = rarityFromCastPosition(index, favorites);

  return {
    id: `anilist-${node.id}`,
    name: node.name.full,
    anime: animeTitle,
    image: node.image?.large || "",
    themeColor: colorFromFavorites(favorites),
    stats,
    overallPower,
    rarity,
    description: node.description
      ? node.description.replace(/__|_|~|!|<[^>]*>/g, "").replace(/\r?\n|\r/g, " ").slice(0, 180) + "…"
      : `${role} character from ${animeTitle}, recruited from the AniList database.`,
    signatureEmoji: rarity === "Legendary" ? "⭐" : rarity === "Epic" ? "💫" : rarity === "Rare" ? "✨" : "⚡",
    skills: role === "Main" ? ["Main Character Drive", "Signature Strike"] : ["Support Tactic", "Combo Assist"],
  };
}

type RoleId = "captain" | "vice_captain" | "strategist" | "defender" | "healer" | "support_speed" | "support_power" | "traitor";
type BattleSide = "p1" | "p2" | "draw";
type BattleSlots = Partial<Record<RoleId, Character | null>>;

const ROLE_ORDER: Array<{ id: RoleId; label: string }> = [
  { id: "captain", label: "Captain" },
  { id: "vice_captain", label: "Vice Captain" },
  { id: "strategist", label: "Strategist" },
  { id: "defender", label: "Defender" },
  { id: "healer", label: "Healer" },
  { id: "support_speed", label: "Speed Support" },
  { id: "support_power", label: "Power Support" },
  { id: "traitor", label: "Traitor" },
];

const RARITY_BONUS: Record<Character["rarity"], number> = {
  Common: 0,
  Rare: 8,
  Epic: 16,
  Legendary: 28,
};

function getRoleFitScore(character: Character, role: RoleId): number {
  const { strength, speed, iq, defense, magic } = character.stats;
  const fitScore = {
    captain: (iq + strength + magic) / 3,
    vice_captain: (iq + speed + magic) / 3,
    strategist: iq * 1.2 + (iq >= 80 ? 10 : iq <= 40 ? -20 : 0),
    defender: defense,
    healer: (magic + iq + defense) / 3,
    support_speed: (speed + iq) / 2,
    support_power: (magic + strength) / 2,
    traitor: (strength + speed + magic) / 3,
  }[role];

  return Math.round(fitScore);
}

function getRoleSuitabilityLabel(fitScore: number) {
  if (fitScore >= 92) return "Perfect Fit";
  if (fitScore >= 82) return "Strong Fit";
  if (fitScore >= 70) return "Stable Fit";
  if (fitScore >= 58) return "Weak Fit";
  return "Bad Fit";
}

function getRoleFitMultiplier(fitScore: number) {
  if (fitScore >= 94) return 1.24;
  if (fitScore >= 86) return 1.14;
  if (fitScore >= 76) return 1.04;
  if (fitScore >= 66) return 0.94;
  if (fitScore >= 56) return 0.82;
  if (fitScore >= 46) return 0.68;
  return 0.52;
}

function getRoleCombatBreakdown(character: Character, role: RoleId) {
  const { strength, speed, iq, defense, magic } = character.stats;
  const roleScore = {
    captain: strength * 0.25 + speed * 0.08 + iq * 0.36 + defense * 0.08 + magic * 0.23,
    vice_captain: strength * 0.14 + speed * 0.22 + iq * 0.36 + defense * 0.08 + magic * 0.2,
    strategist: strength * 0.10 + speed * 0.10 + iq * 0.55 + defense * 0.10 + magic * 0.15,
    defender: strength * 0.20 + speed * 0.04 + iq * 0.08 + defense * 0.58 + magic * 0.10,
    healer: strength * 0.03 + speed * 0.07 + iq * 0.28 + defense * 0.16 + magic * 0.46,
    support_speed: strength * 0.11 + speed * 0.50 + iq * 0.28 + defense * 0.06 + magic * 0.05,
    support_power: strength * 0.24 + speed * 0.06 + iq * 0.16 + defense * 0.06 + magic * 0.48,
    traitor: strength * 0.25 + speed * 0.20 + iq * 0.15 + defense * 0.15 + magic * 0.25,
  }[role];
  const fitScore = getRoleFitScore(character, role);
  const fitMultiplier = getRoleFitMultiplier(fitScore);
  const fitAdjustment = Math.round((fitMultiplier - 1) * 100);
  const rawPowerBonus = Math.round(character.overallPower * 0.065);
  const rarityBonus = RARITY_BONUS[character.rarity];
  const baseScore = Math.round(roleScore * 1.35 + rawPowerBonus + rarityBonus);
  const score = Math.max(1, Math.round(baseScore * fitMultiplier));

  return {
    score,
    baseScore,
    fitScore,
    fitMultiplier,
    fitAdjustment,
    suitability: getRoleSuitabilityLabel(fitScore),
  };
}

function getRoleCombatScore(character: Character, role: RoleId): number {
  return getRoleCombatBreakdown(character, role).score;
}

function getSlotsFromTeam(slots: BattleSlots | undefined, team: Character[]): Record<RoleId, Character | null> {
  const fallback = {} as Record<RoleId, Character | null>;
  ROLE_ORDER.forEach((role, index) => {
    fallback[role.id] = slots?.[role.id] || team[index] || null;
  });
  return fallback;
}

function calculateBalanceBonus(stats: ReturnType<typeof calculateStats>) {
  const statValues = [stats.strength, stats.speed, stats.iq, stats.defense, stats.magic];
  const weakestStat = Math.min(...statValues);
  const averageStat = statValues.reduce((total, value) => total + value, 0) / statValues.length;
  return Math.round(weakestStat * 0.08 + averageStat * 0.04);
}

function calculateRarityBonus(team: Character[]) {
  return team.reduce((total, character) => total + RARITY_BONUS[character.rarity], 0);
}

function calculateRoleSynergyBonuses(roster: Record<RoleId, Character | null>) {
  const captain = roster.captain;
  const viceCaptain = roster.vice_captain;
  const strategist = roster.strategist;
  const defender = roster.defender;
  const healer = roster.healer;
  const speedSupport = roster.support_speed;
  const powerSupport = roster.support_power;
  const traitor = roster.traitor;

  const captainCommand = captain && viceCaptain
    ? Math.round(Math.min(30, Math.max(0, (captain.stats.iq + viceCaptain.stats.iq - 130) * 0.22)))
    : 0;
  const masterPlan = captain && strategist
    ? Math.round(Math.min(28, Math.max(0, (captain.stats.iq + strategist.stats.iq - 140) * 0.25)))
    : 0;
  const guardCore = defender && healer
    ? Math.round(Math.min(32, Math.max(0, (defender.stats.defense + healer.stats.magic - 125) * 0.24)))
    : 0;
  const tempoCombo = speedSupport && captain
    ? Math.round(Math.min(24, Math.max(0, (speedSupport.stats.speed + captain.stats.iq - 130) * 0.18)))
    : 0;
  const powerChain = powerSupport && viceCaptain
    ? Math.round(Math.min(24, Math.max(0, (powerSupport.stats.magic + viceCaptain.stats.magic - 130) * 0.18)))
    : 0;
  const backstab = viceCaptain && roster.traitor
    ? Math.round(Math.min(20, Math.max(0, (roster.traitor!.stats.speed + viceCaptain.stats.iq - 120) * 0.15)))
    : 0;

  return {
    captainCommand,
    masterPlan,
    guardCore,
    tempoCombo,
    powerChain,
    backstab,
  };
}

function normalizeCharacterName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeAnimeName(anime: string) {
  return anime.trim().toLowerCase();
}

function pickVariedCharacter(availableCharacters: Character[], alreadySeenCharacters: Character[]) {
  const seenAnimeCounts = new Map<string, number>();
  const seenNames = new Set(alreadySeenCharacters.map((character) => normalizeCharacterName(character.name)));

  for (const character of alreadySeenCharacters) {
    if (!character.anime) continue;
    const animeKey = normalizeAnimeName(character.anime);
    seenAnimeCounts.set(animeKey, (seenAnimeCounts.get(animeKey) || 0) + 1);
  }

  const uniqueCharacters = availableCharacters.filter(
    (character) => !seenNames.has(normalizeCharacterName(character.name))
  );
  const pool = uniqueCharacters.length > 0 ? uniqueCharacters : availableCharacters;

  const rarityWeight: Record<Character["rarity"], number> = {
    Common: 1.15,
    Rare: 1.85,
    Epic: 1.45,
    Legendary: 1.05,
  };

  const weightedPool = pool.map((character) => {
    const animeKey = character.anime ? normalizeAnimeName(character.anime) : "";
    const animeRepeatCount = animeKey ? seenAnimeCounts.get(animeKey) || 0 : 0;
    const animeWeight = 1 / (1 + animeRepeatCount * 1.6);
    return {
      character,
      weight: rarityWeight[character.rarity] * animeWeight,
    };
  });

  const totalWeight = weightedPool.reduce((total, item) => total + item.weight, 0);
  let pickPoint = Math.random() * totalWeight;

  for (const item of weightedPool) {
    pickPoint -= item.weight;
    if (pickPoint <= 0) return item.character;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

function getBalancedCharacterPool(
  availableCharacters: Character[],
  activePower: number,
  opponentPower: number,
  activePickCount: number,
  opponentPickCount: number
) {
  if (activePickCount === 0 || opponentPickCount === 0) return availableCharacters;
  if (activePower <= opponentPower + 90) return availableCharacters;

  const opponentAveragePower = opponentPower / opponentPickCount;
  const maxAllowedPower = Math.max(330, Math.round(opponentAveragePower + 115));
  const balancedPool = availableCharacters.filter((character) => character.overallPower <= maxAllowedPower);

  return balancedPool.length >= 8 ? balancedPool : availableCharacters;
}

function buildBattleReport(
  player1Team: Character[],
  player2Team: Character[],
  player1Slots?: BattleSlots,
  player2Slots?: BattleSlots,
  player1Name?: string,
  player2Name?: string
) {
  const p1Stats = calculateStats(player1Team);
  const p2Stats = calculateStats(player2Team);
  const p1Roster = getSlotsFromTeam(player1Slots, player1Team);
  const p2Roster = getSlotsFromTeam(player2Slots, player2Team);

  let p1DuelWins = 0;
  let p2DuelWins = 0;
  let drawDuels = 0;
  let p1DuelTotal = 0;
  let p2DuelTotal = 0;

  const duels = ROLE_ORDER.map((role) => {
    const p1Character = p1Roster[role.id];
    const p2Character = p2Roster[role.id];
    const p1Breakdown = p1Character ? getRoleCombatBreakdown(p1Character, role.id) : null;
    const p2Breakdown = p2Character ? getRoleCombatBreakdown(p2Character, role.id) : null;
    const p1Score = p1Breakdown?.score || 0;
    const p2Score = p2Breakdown?.score || 0;
    let winner: BattleSide = "draw";

    const isTraitor = role.id === "traitor";

    if (isTraitor) {
      // Traitor: score goes to ENEMY, winner is INVERTED
      if (p1Score > p2Score) {
        winner = "p2";
        p2DuelWins += 1;
        p2DuelTotal += p1Score;
      } else if (p2Score > p1Score) {
        winner = "p1";
        p1DuelWins += 1;
        p1DuelTotal += p2Score;
      } else {
        drawDuels += 1;
      }
    } else {
      // Normal logic
      if (p1Score > p2Score) {
        winner = "p1";
        p1DuelWins += 1;
      } else if (p2Score > p1Score) {
        winner = "p2";
        p2DuelWins += 1;
      } else {
        drawDuels += 1;
      }
      p1DuelTotal += p1Score;
      p2DuelTotal += p2Score;
    }

    return {
      role: role.id,
      label: role.label,
      p1Name: p1Character?.name || "Empty Slot",
      p2Name: p2Character?.name || "Empty Slot",
      p1Score,
      p2Score,
      p1FitScore: p1Breakdown?.fitScore || 0,
      p2FitScore: p2Breakdown?.fitScore || 0,
      p1BaseScore: p1Breakdown?.baseScore || 0,
      p2BaseScore: p2Breakdown?.baseScore || 0,
      p1FitMultiplier: p1Breakdown?.fitMultiplier || 0,
      p2FitMultiplier: p2Breakdown?.fitMultiplier || 0,
      p1Suitability: p1Breakdown?.suitability || "Empty",
      p2Suitability: p2Breakdown?.suitability || "Empty",
      p1FitAdjustment: p1Breakdown?.fitAdjustment || 0,
      p2FitAdjustment: p2Breakdown?.fitAdjustment || 0,
      winner,
      detail: isTraitor
        ? (winner === "draw"
            ? `Traitor Draw! Both traitors contributed equal power to the opposing teams.`
            : `Traitor Betrayal! ${p1Character?.name || "P1"} (${p1Score} pts) betrayed P1 to give points to P2, while ${p2Character?.name || "P2"} (${p2Score} pts) betrayed P2 to give points to P1. ${winner === "p1" ? player1Name || "P1" : player2Name || "P2"} gained more points (${winner === "p1" ? p2Score : p1Score} vs ${winner === "p1" ? p1Score : p2Score}) and wins!`)
        : (winner === "draw"
            ? `Even clash. ${p1Character?.name || "P1"} was a ${p1Breakdown?.suitability || "Empty"} (${p1Breakdown?.fitScore || 0}), ${p2Character?.name || "P2"} was a ${p2Breakdown?.suitability || "Empty"} (${p2Breakdown?.fitScore || 0}).`
            : `${winner === "p1" ? p1Character?.name : p2Character?.name} wins the ${role.label} duel. Role fit changed the score: ${p1Character?.name || "P1"} ${p1Breakdown?.suitability || "Empty"} x${(p1Breakdown?.fitMultiplier || 0).toFixed(2)}, ${p2Character?.name || "P2"} ${p2Breakdown?.suitability || "Empty"} x${(p2Breakdown?.fitMultiplier || 0).toFixed(2)}.`),
    };
  });

  const p1Synergy = calculateRoleSynergyBonuses(p1Roster);
  const p1Bonuses = {
    teamPower: Math.round(p1Stats.overall * 0.35),
    duelControl: p1DuelWins * 18,
    rarityEdge: calculateRarityBonus(player1Team),
    balance: calculateBalanceBonus(p1Stats),
    completeTeam: player1Team.length >= 8 ? 30 : 0,
    ...Object.fromEntries(Object.entries(p1Synergy).filter(([, value]) => value > 0)),
  };
  
  const p2Synergy = calculateRoleSynergyBonuses(p2Roster);
  const p2Bonuses = {
    teamPower: Math.round(p2Stats.overall * 0.35),
    duelControl: p2DuelWins * 18,
    rarityEdge: calculateRarityBonus(player2Team),
    balance: calculateBalanceBonus(p2Stats),
    completeTeam: player2Team.length >= 8 ? 30 : 0,
    ...Object.fromEntries(Object.entries(p2Synergy).filter(([, value]) => value > 0)),
  };

  const p1BattleScore = Math.round(
    p1DuelTotal + Object.values(p1Bonuses).reduce((total, value) => total + value, 0)
  );
  const p2BattleScore = Math.round(
    p2DuelTotal + Object.values(p2Bonuses).reduce((total, value) => total + value, 0)
  );

  return {
    p1Stats,
    p2Stats,
    p1BattleScore,
    p2BattleScore,
    p1DuelWins,
    p2DuelWins,
    drawDuels,
    duels,
    bonuses: {
      p1: p1Bonuses,
      p2: p2Bonuses,
    },
    rules: [
      "Each role duels the matching enemy role.",
      "Role suitability now multiplies each card's duel score. Great fits gain extra value, weak fits lose a real chunk of their power.",
      "Raw power and rarity still help, but a powerful card in the wrong slot can score less than a weaker card placed correctly.",
      "Teams gain synergy bonuses for smart pairings: Captain + Vice Captain IQ, Strategist + Captain master plan, Defender + Healer guard core, Captain + Speed Support tempo, Vice Captain + Power Support chain, and Traitor + Vice Captain sabotage.",
      "The Traitor role is a double agent: their duel score feeds the enemy team.",
      "Teams also gain bonuses for duel wins, total power, rarity edge, balance, and filling all 8 roles.",
      "Highest final battle score wins. Exact ties become a draw.",
    ],
  };
}

function findBattleMVP(
  player1Slots: BattleSlots | undefined,
  player2Slots: BattleSlots | undefined,
  team1: Character[],
  team2: Character[],
  winnerTeam: BattleSide
): Character {
  const activeTeam = winnerTeam === "p2" ? team2 : team1;
  const activeSlots = winnerTeam === "p2" ? player2Slots : player1Slots;
  if (activeTeam.length === 0) return activeCharactersPool[0] || CHARACTERS[0];

  return activeTeam.reduce((highest, current) => {
    const currentRole = ROLE_ORDER.find((role) => activeSlots?.[role.id]?.id === current.id)?.id || "captain";
    const highestRole = ROLE_ORDER.find((role) => activeSlots?.[role.id]?.id === highest.id)?.id || "captain";
    return getRoleCombatScore(current, currentRole) > getRoleCombatScore(highest, highestRole) ? current : highest;
  }, activeTeam[0]);
}

function getBattleMVPAnalysis(
  player1Slots: BattleSlots | undefined,
  player2Slots: BattleSlots | undefined,
  team1: Character[],
  team2: Character[],
  winnerTeam: BattleSide
) {
  const p1Roster = getSlotsFromTeam(player1Slots, team1);
  const p2Roster = getSlotsFromTeam(player2Slots, team2);
  const candidates = ROLE_ORDER.flatMap((role) => {
    const entries: Array<{ side: Exclude<BattleSide, "draw">; character: Character; role: RoleId; label: string }> = [];
    const p1Character = p1Roster[role.id];
    const p2Character = p2Roster[role.id];

    if ((winnerTeam === "p1" || winnerTeam === "draw") && p1Character) {
      entries.push({ side: "p1", character: p1Character, role: role.id, label: role.label });
    }
    if ((winnerTeam === "p2" || winnerTeam === "draw") && p2Character) {
      entries.push({ side: "p2", character: p2Character, role: role.id, label: role.label });
    }

    return entries;
  });

  const fallback = findBattleMVP(player1Slots, player2Slots, team1, team2, winnerTeam);
  const best = candidates.reduce((highest, current) => {
    const currentBreakdown = getRoleCombatBreakdown(current.character, current.role);
    const highestBreakdown = getRoleCombatBreakdown(highest.character, highest.role);
    const currentValue = currentBreakdown.score + currentBreakdown.fitScore * 0.35;
    const highestValue = highestBreakdown.score + highestBreakdown.fitScore * 0.35;
    return currentValue > highestValue ? current : highest;
  }, candidates[0] || { side: "p1" as const, character: fallback, role: "captain" as RoleId, label: "Captain" });

  const breakdown = getRoleCombatBreakdown(best.character, best.role);

  return {
    character: best.character,
    side: best.side,
    role: best.role,
    roleLabel: best.label,
    score: breakdown.score,
    baseScore: breakdown.baseScore,
    fitScore: breakdown.fitScore,
    fitMultiplier: breakdown.fitMultiplier,
    suitability: breakdown.suitability,
    reason: `${best.character.name} earned MVP as ${best.label}: ${breakdown.suitability} (${breakdown.fitScore} fit), ${breakdown.baseScore} base -> ${breakdown.score} final duel score.`,
  };
}

// ---------------- API ENDPOINTS ----------------

// Pusher config credentials delivery
app.get("/api/pusher/config", (req, res) => {
  res.json({
    key: process.env.PUSHER_KEY || "",
    cluster: process.env.PUSHER_CLUSTER || "",
  });
});

// Pusher Presence and Private Channel Authorization
app.post("/api/pusher/auth", (req, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  const username = req.body.username || "Player";

  const pusher = getPusher();
  if (!pusher) {
    console.warn("Pusher authorization skipped: server env vars not configured");
    return res.status(500).json({ error: "Pusher is not configured on the server." });
  }

  const presenceData = {
    user_id: socketId,
    user_info: {
      name: username,
    },
  };

  try {
    const authResponse = pusher.authorizeChannel(socketId, channel, presenceData);
    res.json(authResponse);
  } catch (error: any) {
    console.error("Pusher auth error:", error);
    res.status(500).send(error.message || "Pusher auth failed");
  }
});

// Image Proxy to bypass MyAnimeList hotlink protection
app.get("/api/image-proxy", async (req, res) => {
  try {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).send("Missing target image URL");
    }

    const isAllowedDomain =
      imageUrl.startsWith("https://cdn.myanimelist.net/") ||
      imageUrl.startsWith("https://s4.anilist.co/");

    if (!isAllowedDomain) {
      return res.status(403).send("Domain not permitted");
    }

    const imageResponse = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://myanimelist.net/",
        "Sec-Fetch-Dest": "image",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      }
    });

    if (!imageResponse.ok) {
      return res.status(imageResponse.status).send(`Failed to fetch image: status ${imageResponse.status}`);
    }

    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error: any) {
    console.error("Image proxy error:", error);
    res.status(500).send("Internal image proxy error");
  }
});

// Get All Characters
app.get("/api/characters", (req, res) => {
  res.json(activeCharactersPool);
});

// Get Random Character
app.get("/api/characters/random", (req, res) => {
  try {
    const excludeParam = req.query.exclude as string || "";
    const excludeIds = excludeParam ? excludeParam.split(",") : [];
    const animeParam = req.query.anime as string || "";
    const animesParam = req.query.animes as string || "";
    const rarityParam = req.query.rarity as Character["rarity"] | undefined;
    const activePower = Number(req.query.activePower || 0);
    const opponentPower = Number(req.query.opponentPower || 0);
    const activePickCount = Number(req.query.activePickCount || 0);
    const opponentPickCount = Number(req.query.opponentPickCount || 0);

    const animeFilters: string[] = [];
    if (animesParam) {
      animeFilters.push(...animesParam.split(",").map(a => a.trim().toLowerCase()).filter(Boolean));
    } else if (animeParam) {
      animeFilters.push(animeParam.trim().toLowerCase());
    }

    const remainingCharacters = activeCharactersPool.filter(char => !excludeIds.includes(char.id));
    let available = remainingCharacters;

    if (animeFilters.length > 0) {
      const animeMatches = remainingCharacters.filter(char =>
        char.anime && animeFilters.some(filter =>
          char.anime.toLowerCase().includes(filter)
        )
      );
      available = animeMatches;
    }

    if (rarityParam) {
      const rarityMatches = available.filter(char => char.rarity === rarityParam);
      if (rarityMatches.length > 0) {
        available = rarityMatches;
      }
    }

    available = getBalancedCharacterPool(
      available,
      Number.isFinite(activePower) ? activePower : 0,
      Number.isFinite(opponentPower) ? opponentPower : 0,
      Number.isFinite(activePickCount) ? activePickCount : 0,
      Number.isFinite(opponentPickCount) ? opponentPickCount : 0
    );

    const excludedCharacters = activeCharactersPool.filter(char => excludeIds.includes(char.id));
    const excludedNames = new Set(excludedCharacters.map(char => normalizeCharacterName(char.name)));
    available = available.filter(char => !excludedNames.has(normalizeCharacterName(char.name)));

    if (available.length === 0) {
      return res.status(404).json({ error: "No unpicked characters remain." });
    }

    const picked = pickVariedCharacter(available, excludedCharacters);
    res.json(picked);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Import Custom Character
app.post("/api/characters/import", (req, res) => {
  try {
    const { character } = req.body as { character: Character };
    if (!character || !character.id || !character.name) {
      return res.status(400).json({ error: "Missing character specifications." });
    }

    const existingIndex = activeCharactersPool.findIndex(c => c.id === character.id);
    if (existingIndex > -1) {
      activeCharactersPool[existingIndex] = character;
    } else {
      activeCharactersPool.push(character);
    }

    res.json({ success: true, count: activeCharactersPool.length, character });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Import Cast – primary Kitsu, fallback Jikan (MAL)
app.post("/api/anime/import-cast", async (req, res) => {
  try {
    const { animeTitle, limit = 40 } = req.body as { animeTitle?: string; limit?: number };
    const title = animeTitle?.trim();
    if (!title) {
      return res.status(400).json({ error: "Missing anime title." });
    }

    // Allow up to 250 characters per request (higher than the old 75 cap)
    const safeLimit = Math.min(250, Math.max(10, Number(limit) || 40));

    // ---------- 1️⃣ AniList (fallback source) ----------
    const anilistQuery = `
      query ($search: String, $perPage: Int) {
        Media(search: $search, type: ANIME) {
          id
          title { english romaji userPreferred }
          characters(perPage: $perPage, sort: [ROLE, RELEVANCE]) {
            edges {
              role
              node {
                id
                name { full }
                image { large }
                description
                favourites
              }
            }
          }
        }
      }
    `;
    const anilistRes = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: anilistQuery, variables: { search: title, perPage: safeLimit } })
    });

    let allChars: Character[] = [];
    if (anilistRes.ok) {
      const json = await anilistRes.json() as any;
      const media = json?.data?.Media;
      if (media) {
        const animeTitleString = media.title?.english || media.title?.userPreferred || media.title?.romaji || title;
        const edges = media.characters?.edges || [];
        const anilistChars = edges
          .map((edge: any, i: number) => buildAniListCastCharacter(edge, animeTitleString, i))
          .filter(Boolean) as Character[];
        allChars = anilistChars;
      }
    }

    // ---------- 2️⃣ Kitsu (primary source) ----------
    const kitsuId = await resolveKitsuAnimeId(title);
    if (kitsuId) {
      const kitsuChars = await fetchKitsuCharacters(kitsuId);
      const existingIds = new Set(allChars.map(c => c.id));
      for (const c of kitsuChars) {
        if (!existingIds.has(c.id)) {
          allChars.push(c);
        }
      }
    }

    // ---------- 3️⃣ Jikan (MAL) – fallback when everything else fails ----------
    if (allChars.length === 0) {
      const malId = await getMalIdFromAniList(title);
      if (malId) {
        const jikanChars = await fetchJikanCharacters(malId);
        allChars = jikanChars;
      }
    }

    // Insert / update the global pool
    let imported = 0;
    let updated = 0;
    for (const character of allChars) {
      const idx = activeCharactersPool.findIndex(c => c.id === character.id);
      if (idx > -1) {
        activeCharactersPool[idx] = character;
        updated++;
      } else {
        activeCharactersPool.push(character);
        imported++;
      }
    }

    // Respond with a summary
    res.json({
      success: true,
      anime: title,
      imported,
      updated,
      totalImported: imported + updated,
      poolCount: activeCharactersPool.length,
    });
  } catch (error: any) {
    console.error("Anime cast import error:", error);
    res.status(500).json({ error: error.message || "Failed to import anime cast." });
  }
});

// Serve Generated Character Images
app.get("/api/characters/image/:id", (req, res) => {
  const { id } = req.params;
  const buffer = generatedImages.get(id);
  if (!buffer) {
    return res.status(404).send("AI Character Image not found or expired.");
  }
  res.setHeader("Content-Type", "image/jpeg");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(buffer);
});

// JSON schema for Gemini structured output
const characterSchema = {
  type: "OBJECT",
  properties: {
    name: { type: "STRING" },
    anime: { type: "STRING" },
    description: { type: "STRING" },
    themeColor: { type: "STRING", description: "HEX color matching their character theme/element" },
    stats: {
      type: "OBJECT",
      properties: {
        strength: { type: "INTEGER", description: "1 to 100 power score" },
        speed: { type: "INTEGER", description: "1 to 100 speed score" },
        iq: { type: "INTEGER", description: "1 to 100 intelligence/battle IQ score" },
        defense: { type: "INTEGER", description: "1 to 100 defense/durability score" },
        magic: { type: "INTEGER", description: "1 to 100 magic/energy score" }
      },
      required: ["strength", "speed", "iq", "defense", "magic"]
    },
    quote: { type: "STRING", description: "Signature quote/dialogue of this character" },
    signatureEmoji: { type: "STRING", description: "A single representative emoji" },
    skills: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Exactly two signature special attacks or abilities"
    }
  },
  required: ["name", "anime", "description", "themeColor", "stats", "signatureEmoji", "skills"]
};

// Generate AI Character and Image
app.post("/api/characters/generate-ai", async (req, res) => {
  try {
    const gemini = getGeminiClient();
    if (!gemini) {
      return res.status(400).json({
        error: "Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file."
      });
    }

    const { prompt, malCharacter } = req.body;
    let textPrompt = "";

    if (malCharacter) {
      const name = malCharacter.name || "Unknown Hero";
      const anime = malCharacter.anime || "Classified Universe";
      const about = malCharacter.description || "A mysterious combatant.";
      textPrompt = `You are an anime character designer. We are importing the character "${name}" from the anime "${anime}" into a fighting card game. 
      Based on their lore/background: "${about.slice(0, 500)}", generate a premium card configuration.
      Generate a stylized, epic title variant of their name, a combat-oriented description, an appropriate energy theme color (Hex), combat stats (1-100), a single fitting emoji, a battle quote, and 2 signature special skills.`;
    } else if (prompt) {
      textPrompt = `Create a completely new, original anime character based on this prompt: "${prompt}".
      Generate their name, a fictional anime title they are from, a detailed battle description, theme color (Hex), combat stats (1-100), signature emoji, battle quote, and exactly 2 special skills.`;
    } else {
      return res.status(400).json({ error: "Missing prompt or malCharacter specifications." });
    }

    const textResponse = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: textPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: characterSchema as any,
        temperature: 1.0,
      },
    });

    if (!textResponse.text) {
      throw new Error("Empty response returned from Gemini text generator.");
    }

    const charData = JSON.parse(textResponse.text);

    const stats = {
      strength: Math.min(100, Math.max(1, parseInt(charData.stats?.strength) || 50)),
      speed: Math.min(100, Math.max(1, parseInt(charData.stats?.speed) || 50)),
      iq: Math.min(100, Math.max(1, parseInt(charData.stats?.iq) || 50)),
      defense: Math.min(100, Math.max(1, parseInt(charData.stats?.defense) || 50)),
      magic: Math.min(100, Math.max(1, parseInt(charData.stats?.magic) || 50)),
    };
    const overallPower = stats.strength + stats.speed + stats.defense + stats.iq + stats.magic;
    const rarity = overallPower > 450 ? "Legendary" : overallPower > 400 ? "Epic" : overallPower > 350 ? "Rare" : "Common";

    const charId = `ai-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    let imageBuffer: Buffer | null = null;

    if (imageBuffer) {
      generatedImages.set(charId, imageBuffer);
      charData.image = `/api/characters/image/${charId}`;
    } else {
      if (malCharacter && malCharacter.image) {
        charData.image = malCharacter.image;
      } else {
        charData.image = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop";
      }
    }

    const character: Character = {
      id: charId,
      name: charData.name || "AI Combatant",
      anime: charData.anime || "Gemini Multiverse",
      image: charData.image,
      themeColor: charData.themeColor || "#00e5ff",
      stats,
      overallPower,
      rarity,
      description: charData.description || "A mysterious fighter summoned by AI.",
      quote: charData.quote || "My power is absolute.",
      signatureEmoji: charData.signatureEmoji || "💫",
      skills: charData.skills || ["Dimensional Shift", "Aura Burst"]
    };

    res.json({ success: true, character });
  } catch (error: any) {
    console.error("AI character generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate character using Gemini." });
  }
});

// Reset Roster
app.post("/api/characters/reset", (req, res) => {
  try {
    activeCharactersPool = [...CHARACTERS];
    res.json({ success: true, count: activeCharactersPool.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate Battle
app.post("/api/draft/calculate", async (req, res) => {
  try {
    const { player1Name, player2Name, player1Team, player2Team, player1Slots, player2Slots } = req.body as {
      player1Name: string;
      player2Name: string;
      player1Team: Character[];
      player2Team: Character[];
      player1Slots?: any;
      player2Slots?: any;
    };

    if (!player1Team || !player2Team || player1Team.length === 0 || player2Team.length === 0) {
      return res.status(400).json({ error: "Teams must contain characters." });
    }

    const battleReport = buildBattleReport(player1Team, player2Team, player1Slots, player2Slots, player1Name, player2Name);
    const p1Stats = battleReport.p1Stats;
    const p2Stats = battleReport.p2Stats;

    let winnerName = "Draw";
    let winnerId: "p1" | "p2" | "draw" = "draw";

    if (battleReport.p1BattleScore > battleReport.p2BattleScore) {
      winnerName = player1Name || "Player 1";
      winnerId = "p1";
    } else if (battleReport.p2BattleScore > battleReport.p1BattleScore) {
      winnerName = player2Name || "Player 2";
      winnerId = "p2";
    }

    const mvpAnalysis = getBattleMVPAnalysis(player1Slots, player2Slots, player1Team, player2Team, winnerId);
    const mvpChar = mvpAnalysis.character;

    // Call Gemini API for Commentaries
    let commentary = "";
    const gemini = getGeminiClient();

    if (gemini) {
      try {
        const getTeamSummaryWithRoles = (slots: any) => {
          if (!slots) return "";
          return Object.entries(slots)
            .map(([role, character]: any) => {
              if (!character) return "";
              return `${role.replace("_", " ").toUpperCase()}: ${character.name} (${character.anime})`;
            })
            .filter(Boolean)
            .join(", ");
        };

        const p1RolesSummary = getTeamSummaryWithRoles(player1Slots) || player1Team.map(c => `${c.name} (${c.anime})`).join(", ");
        const p2RolesSummary = getTeamSummaryWithRoles(player2Slots) || player2Team.map(c => `${c.name} (${c.anime})`).join(", ");

        const duelSummary = battleReport.duels
          .map(duel => `${duel.label}: ${duel.p1Name} ${duel.p1Score} vs ${duel.p2Name} ${duel.p2Score} (${duel.winner})`)
          .join("; ");

        const prompt = `You are a legendary, hyper-hype anime battle commentator in the style of esports announcers.
        A battle occurred between:
        Player 1 (${player1Name || "Player 1"}) Team Role Composition: [${p1RolesSummary}] with Battle Score: ${battleReport.p1BattleScore}
        Player 2 (${player2Name || "Player 2"}) Team Role Composition: [${p2RolesSummary}] with Battle Score: ${battleReport.p2BattleScore}
 
        The overall stats of the clash:
        Player 1 - Strength: ${p1Stats.strength}, Speed: ${p1Stats.speed}, IQ: ${p1Stats.iq}, Defense: ${p1Stats.defense}, Energy/Magic: ${p1Stats.magic}
        Player 2 - Strength: ${p2Stats.strength}, Speed: ${p2Stats.speed}, IQ: ${p2Stats.iq}, Defense: ${p2Stats.defense}, Energy/Magic: ${p2Stats.magic}

        Role duel results: ${duelSummary}
        
        The ultimate winner is: ${winnerName}!
        
        Write an intense but clear 3-paragraph live-clash recap explaining why the winner won. Use Markdown format.`;

        const response = await gemini.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            temperature: 1.0,
          },
        });

        commentary = response.text || "The fight was too intense for the senses to catalog!";
      } catch (gemIniError: any) {
        console.error("Gemini commentary error:", gemIniError);
        commentary = `**Battle commentary offline.**
        
The tactical engine resolved every role duel and team bonus. **${winnerName}** ${winnerId === "draw" ? "forced a complete draw" : "won through stronger role control, better stat fit, and cleaner team synergy"}.
        
Final battle score: **${battleReport.p1BattleScore}** vs **${battleReport.p2BattleScore}**. MVP: **${mvpChar.name}** - ${mvpAnalysis.reason}.`;
      }
    } else {
      commentary = `### Final Battle Resolved
      
The draft moved into a six-role tactical battle: Captain, Vice Captain, Defender, Healer, Speed Support, and Power Support each fought their matching role.
      
Final battle score: **${battleReport.p1BattleScore}** vs **${battleReport.p2BattleScore}**. ${winnerName === "Draw" ? "Both teams ended perfectly even." : `**${winnerName}** wins by controlling ${winnerId === "p1" ? battleReport.p1DuelWins : battleReport.p2DuelWins} role duels and stacking better battle bonuses.`}

MVP: **${mvpChar.name}** - ${mvpAnalysis.reason}.`;
    }

    res.json({
      player1Power: battleReport.p1BattleScore,
      player2Power: battleReport.p2BattleScore,
      p1SubStats: p1Stats,
      p2SubStats: p2Stats,
      winner: winnerName,
      winnerId,
      mvp: mvpChar,
      mvpReason: mvpAnalysis.reason,
      mvpAnalysis,
      commentary,
      battleReport,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Save completed match to history
app.post("/api/draft/save", (req, res) => {
  try {
    const historyItem = req.body as MatchHistory;
    if (!historyItem.id) {
      historyItem.id = `match_${Date.now()}`;
    }
    matchHistory.unshift(historyItem);

    if (matchHistory.length > 50) {
      matchHistory.pop();
    }
    res.json({ success: true, matchHistory });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get match history
app.get("/api/draft/history", (req, res) => {
  res.json(matchHistory);
});

export default app;
