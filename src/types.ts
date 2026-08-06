export interface Character {
  id: string;
  name: string;
  anime: string;
  image: string;
  themeColor: string;
  stats: {
    strength: number;
    speed: number;
    iq: number;
    defense: number;
    magic: number;
  };
  overallPower: number;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  description: string;
  quote?: string;
  signatureEmoji: string;
  skills?: string[];
  malFallbackUrl?: string;
  rating?: number;
  source?: "builtin" | "anilist" | "rating-dataset";
}

import { API_BASE } from "./config";

export function getProxyImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("https://cdn.myanimelist.net/")) {
    return `${API_BASE}/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export type RoleId = "captain" | "vice_captain" | "strategist" | "defender" | "healer" | "support_speed" | "support_power" | "traitor";

export interface RoleCategory {
  id: RoleId;
  name: string;
  emoji: string;
  icon: string;
  color: string;
  description: string;
}

export type SlottedTeam = Record<RoleId, Character | null>;

export interface Player {
  name: string;
  team: Character[];
  slots: SlottedTeam;
  skipUsed: boolean;
  score: number;
}

export interface MatchHistory {
  id: string;
  player1Name: string;
  player2Name: string;
  player1Team: Character[];
  player2Team: Character[];
  player1Slots?: SlottedTeam; // Optional backward-compatible slots
  player2Slots?: SlottedTeam;
  player1Power: number;
  player2Power: number;
  winner: string;
  mvp: Character;
  commentary: string;
  createdAt: string;
}

export interface BattleReport {
  p1Stats: { strength: number; speed: number; iq: number; defense: number; magic: number; overall: number };
  p2Stats: { strength: number; speed: number; iq: number; defense: number; magic: number; overall: number };
  p1BattleScore: number;
  p2BattleScore: number;
  p1DuelWins: number;
  p2DuelWins: number;
  drawDuels: number;
  duels: Array<{
    role: string;
    label: string;
    p1Name: string;
    p2Name: string;
    p1Score: number;
    p2Score: number;
    p1FitScore: number;
    p2FitScore: number;
    p1BaseScore: number;
    p2BaseScore: number;
    p1FitMultiplier: number;
    p2FitMultiplier: number;
    p1Suitability: string;
    p2Suitability: string;
    p1FitAdjustment: number;
    p2FitAdjustment: number;
    winner: "p1" | "p2" | "draw";
    detail: string;
    p1IsRating?: boolean;
    p2IsRating?: boolean;
    p1Rating?: number;
    p2Rating?: number;
  }>;
  bonuses: {
    p1: Record<string, number>;
    p2: Record<string, number>;
  };
  rules: string[];
}
