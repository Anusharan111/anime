export interface Character {
  id: string;
  name: string;
  anime: string;
  image: string; // fallback image URL
  themeColor: string; // HEX color for glowing effects
  stats: {
    strength: number;  // 1-100
    speed: number;     // 1-100
    iq: number;        // 1-100
    defense: number;   // 1-100
    magic: number;     // 1-100
  };
  overallPower: number; // sum of stats
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  description: string;
  quote?: string;
  signatureEmoji: string;
  skills?: string[];
  malFallbackUrl?: string; // Original MAL URL fallback if AI image fails
}

export function getProxyImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("https://cdn.myanimelist.net/")) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export type RoleId = "captain" | "vice_captain" | "tank" | "healer" | "support_1" | "support_2";

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
