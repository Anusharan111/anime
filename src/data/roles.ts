import { RoleCategory } from "../types";

export const ROLE_CATEGORIES: RoleCategory[] = [
  {
    id: "captain",
    name: "Captain",
    emoji: "C",
    icon: "crown",
    color: "#eab308", // Yellow / Gold
    description: "Team leader. Commands tactical power coordinates."
  },
  {
    id: "vice_captain",
    name: "Vice Captain",
    emoji: "VC",
    icon: "award",
    color: "#a855f7", // Purple
    description: "Co-leader. Anchors active battle plans if leader falters."
  },
  {
    id: "tank",
    name: "Defender",
    emoji: "D",
    icon: "shield",
    color: "#10b981", // Emerald / Green
    description: "Heavy vanguard. Absorbs and deflects opposing strike vectors."
  },
  {
    id: "healer",
    name: "Healer",
    emoji: "H",
    icon: "heart",
    color: "#ec4899", // Pink
    description: "Vitality master. Restores spiritual force fields and power pools."
  },
  {
    id: "support_1",
    name: "Speed Support",
    emoji: "S",
    icon: "zap",
    color: "#06b6d4", // Cyan
    description: "Utility buff. Accelerates spatial movement speeds."
  },
  {
    id: "support_2",
    name: "Power Support",
    emoji: "P",
    icon: "sparkles",
    color: "#f97316", // Orange
    description: "Catalyst force. Elevates magic intensity and cosmic fields."
  }
];
