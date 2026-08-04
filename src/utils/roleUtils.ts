import { Character, RoleId } from "../types";

export const getRoleFitScore = (character: Character, role: RoleId): number => {
  const { strength, speed, iq, defense, magic } = character.stats;
  const fitScore = {
    captain: (iq + strength + magic) / 3,
    vice_captain: (iq + speed + magic) / 3,
    tank: defense,
    healer: (magic + iq + defense) / 3,
    support_1: (speed + iq) / 2,
    support_2: (magic + strength) / 2,
  }[role];

  return Math.round(fitScore);
};

export const getRoleSuitabilityLabel = (fitScore: number): string => {
  if (fitScore >= 92) return "Perfect Fit";
  if (fitScore >= 82) return "Strong Fit";
  if (fitScore >= 70) return "Stable Fit";
  if (fitScore >= 58) return "Weak Fit";
  return "Bad Fit";
};

export const getRoleFitMultiplier = (fitScore: number): number => {
  if (fitScore >= 94) return 1.24;
  if (fitScore >= 86) return 1.14;
  if (fitScore >= 76) return 1.04;
  if (fitScore >= 66) return 0.94;
  if (fitScore >= 56) return 0.82;
  if (fitScore >= 46) return 0.68;
  return 0.52;
};