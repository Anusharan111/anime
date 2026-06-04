import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { CHARACTERS } from "./src/data/characters.js";
import { Character, MatchHistory } from "./src/types.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "5174", 10);

// Express JSON middleware
app.use(express.json());

// In-Memory Databases
const matchHistory: MatchHistory[] = [];
let activeCharactersPool = [...CHARACTERS];

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

type RoleId = "captain" | "vice_captain" | "tank" | "healer" | "support_1" | "support_2";
type BattleSide = "p1" | "p2" | "draw";
type BattleSlots = Partial<Record<RoleId, Character | null>>;

const ROLE_ORDER: Array<{ id: RoleId; label: string }> = [
  { id: "captain", label: "Captain" },
  { id: "vice_captain", label: "Vice Captain" },
  { id: "tank", label: "Defender" },
  { id: "healer", label: "Healer" },
  { id: "support_1", label: "Speed Support" },
  { id: "support_2", label: "Power Support" },
];

const RARITY_BONUS: Record<Character["rarity"], number> = {
  Common: 0,
  Rare: 8,
  Epic: 16,
  Legendary: 28,
};

function getRoleCombatScore(character: Character, role: RoleId): number {
  const { strength, speed, iq, defense, magic } = character.stats;
  const roleScore = {
    captain: strength * 0.25 + speed * 0.1 + iq * 0.35 + defense * 0.1 + magic * 0.2,
    vice_captain: strength * 0.15 + speed * 0.2 + iq * 0.35 + defense * 0.1 + magic * 0.2,
    tank: strength * 0.25 + speed * 0.05 + iq * 0.1 + defense * 0.45 + magic * 0.15,
    healer: strength * 0.05 + speed * 0.1 + iq * 0.25 + defense * 0.2 + magic * 0.4,
    support_1: strength * 0.15 + speed * 0.4 + iq * 0.25 + defense * 0.1 + magic * 0.1,
    support_2: strength * 0.2 + speed * 0.1 + iq * 0.2 + defense * 0.1 + magic * 0.4,
  }[role];

  return Math.round(roleScore + character.overallPower * 0.18 + RARITY_BONUS[character.rarity]);
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

function buildBattleReport(
  player1Team: Character[],
  player2Team: Character[],
  player1Slots?: BattleSlots,
  player2Slots?: BattleSlots
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
    const p1Score = p1Character ? getRoleCombatScore(p1Character, role.id) : 0;
    const p2Score = p2Character ? getRoleCombatScore(p2Character, role.id) : 0;
    let winner: BattleSide = "draw";

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

    return {
      role: role.id,
      label: role.label,
      p1Name: p1Character?.name || "Empty Slot",
      p2Name: p2Character?.name || "Empty Slot",
      p1Score,
      p2Score,
      winner,
      detail: winner === "draw"
        ? "Even clash"
        : `${winner === "p1" ? p1Character?.name : p2Character?.name} wins the ${role.label} duel`,
    };
  });

  const p1Bonuses = {
    teamPower: Math.round(p1Stats.overall * 0.35),
    duelControl: p1DuelWins * 18,
    rarityEdge: calculateRarityBonus(player1Team),
    balance: calculateBalanceBonus(p1Stats),
    completeTeam: player1Team.length >= 6 ? 30 : 0,
  };
  const p2Bonuses = {
    teamPower: Math.round(p2Stats.overall * 0.35),
    duelControl: p2DuelWins * 18,
    rarityEdge: calculateRarityBonus(player2Team),
    balance: calculateBalanceBonus(p2Stats),
    completeTeam: player2Team.length >= 6 ? 30 : 0,
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
      "Role score uses the stats that matter for that role, plus rarity.",
      "Teams gain bonuses for duel wins, total power, rarity edge, balance, and filling all 6 roles.",
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

function findMVP(
  team1: Character[],
  team2: Character[],
  winnerTeam: "p1" | "p2" | "draw"
): Character {
  const activeTeam = winnerTeam === "p2" ? team2 : team1;
  if (activeTeam.length === 0) return activeCharactersPool[0] || CHARACTERS[0];
  return activeTeam.reduce((highest, current) =>
    current.overallPower > highest.overallPower ? current : highest
    , activeTeam[0]);
}

// ---------------- API ENDPOINTS ----------------

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

// Get Random Character (with exclude filter and optional anime filter)
app.get("/api/characters/random", (req, res) => {
  try {
    const excludeParam = req.query.exclude as string || "";
    const excludeIds = excludeParam ? excludeParam.split(",") : [];
    const animeParam = req.query.anime as string || "";
    const animesParam = req.query.animes as string || "";
    const rarityParam = req.query.rarity as Character["rarity"] | undefined;

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

    // Filter out names that are duplicates of already excluded character IDs to avoid duplicates with different ID prefixes (e.g. mal- vs anilist-)
    const excludedCharacters = activeCharactersPool.filter(char => excludeIds.includes(char.id));
    const normalizeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const excludedNames = new Set(excludedCharacters.map(char => normalizeName(char.name)));
    available = available.filter(char => !excludedNames.has(normalizeName(char.name)));

    if (available.length === 0) {
      return res.status(404).json({ error: "No unpicked characters remain." });
    }

    const picked = available[Math.floor(Math.random() * available.length)];
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

app.post("/api/anime/import-cast", async (req, res) => {
  try {
    const { animeTitle, limit = 40 } = req.body as { animeTitle?: string; limit?: number };
    const title = animeTitle?.trim();
    if (!title) {
      return res.status(400).json({ error: "Missing anime title." });
    }

    const safeLimit = Math.min(75, Math.max(10, Number(limit) || 40));

    const graphQLQuery = `
      query ($search: String, $perPage: Int) {
        Media (search: $search, type: ANIME) {
          id
          title {
            english
            romaji
            userPreferred
          }
          characters (perPage: $perPage, sort: [ROLE, RELEVANCE]) {
            edges {
              role
              node {
                id
                name {
                  full
                }
                image {
                  large
                }
                description
                favourites
              }
            }
          }
        }
      }
    `;

    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        query: graphQLQuery,
        variables: { search: title, perPage: safeLimit }
      })
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `AniList request failed with status ${response.status}.` });
    }

    const json = await response.json() as any;
    const media = json.data?.Media;
    if (!media) {
      return res.status(404).json({ error: `No anime found for "${title}".` });
    }

    const animeTitleString = media.title?.english || media.title?.userPreferred || media.title?.romaji || title;
    const edges = media.characters?.edges || [];

    const characters = edges
      .map((edge: any, index: number) => buildAniListCastCharacter(edge, animeTitleString, index))
      .filter(Boolean) as Character[];

    let imported = 0;
    let updated = 0;

    for (const character of characters) {
      const existingIndex = activeCharactersPool.findIndex(c => c.id === character.id);
      if (existingIndex > -1) {
        activeCharactersPool[existingIndex] = character;
        updated += 1;
      } else {
        activeCharactersPool.push(character);
        imported += 1;
      }
    }

    res.json({
      success: true,
      anime: animeTitleString,
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
const generatedImages = new Map<string, Buffer>();

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

    // Generate text details using gemini-2.5-flash
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

    // Validate stats & calculate overall power
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

    // Generate image using Imagen via Gemini
    let imageBuffer: Buffer | null = null;
    try {
      const imagePrompt = `Stunning profile card avatar of the anime character named ${charData.name} from the anime ${charData.anime}. Style: clean high-resolution anime illustration, vibrant colors, detailed lighting, epic battle pose, glowing effects. Single character only, no text.`;

      const imageResponse = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a base64-encoded JPEG image description for: ${imagePrompt}. Return ONLY a valid JSON with key "imageDescription" containing a detailed text description suitable for image generation.`,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      // Note: Actual image generation would require Imagen API access
      // For now, we use the text description as a placeholder
      console.log("Image generation placeholder - using fallback image");
    } catch (imgError: any) {
      console.error("Image generation failed, using fallback:", imgError);
    }

    // Cache the generated image buffer or use fallback
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

// Reset Character Roster to defaults
app.post("/api/characters/reset", (req, res) => {
  try {
    activeCharactersPool = [...CHARACTERS];
    res.json({ success: true, count: activeCharactersPool.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate Match Battle
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

    const battleReport = buildBattleReport(player1Team, player2Team, player1Slots, player2Slots);
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

    const mvpChar = findBattleMVP(player1Slots, player2Slots, player1Team, player2Team, winnerId);

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
        console.error("Gemini commentary generation error:", gemIniError);
        commentary = `**Battle commentary offline.**
        
The tactical engine resolved every role duel and team bonus. **${winnerName}** ${winnerId === "draw" ? "forced a complete draw" : "won through stronger role control, better stat fit, and cleaner team synergy"}.
        
Final battle score: **${battleReport.p1BattleScore}** vs **${battleReport.p2BattleScore}**. MVP: **${mvpChar.name}**.`;
      }
    } else {
      commentary = `### Final Battle Resolved
      
The draft moved into a six-role tactical battle: Captain, Vice Captain, Defender, Healer, Speed Support, and Power Support each fought their matching role.
      
Final battle score: **${battleReport.p1BattleScore}** vs **${battleReport.p2BattleScore}**. ${winnerName === "Draw" ? "Both teams ended perfectly even." : `**${winnerName}** wins by controlling ${winnerId === "p1" ? battleReport.p1DuelWins : battleReport.p2DuelWins} role duels and stacking better battle bonuses.`}

MVP: **${mvpChar.name}**.`;
    }

    res.json({
      player1Power: battleReport.p1BattleScore,
      player2Power: battleReport.p2BattleScore,
      p1SubStats: p1Stats,
      p2SubStats: p2Stats,
      winner: winnerName,
      winnerId,
      mvp: mvpChar,
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

// ---------------- MAIN SERVER KICKOFF ----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Anime Battle server listening on port ${PORT}`);
  });
}

startServer();
