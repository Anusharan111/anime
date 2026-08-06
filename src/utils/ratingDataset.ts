import rawRatingData from "../../characters_with_rating.json";

export interface RawRatingCharacter {
  name: string;
  anime_category: string;
  favorites: number;
  image_url: string;
  rating: number;
}

export const RATING_ANIME_NAMES = [
  "One Piece",
  "Naruto",
  "Dragon Ball",
  "Bleach",
  "Demon Slayer",
  "Jujutsu Kaisen",
  "Attack on Titan",
  "Fullmetal Alchemist",
  "Chainsaw Man",
] as const;

export const RATING_ANIME_SET: Set<string> = new Set(RATING_ANIME_NAMES);

export const ratingDataset: RawRatingCharacter[] = rawRatingData.flatMap(
  (anime) => anime.characters
);

export function getCharactersByAnime(animeName: string): RawRatingCharacter[] {
  const normalized = animeName.trim().toLowerCase();
  return ratingDataset.filter(
    (c) => c.anime_category.trim().toLowerCase() === normalized
  );
}

export function searchCharacters(query: string, limit = 10): RawRatingCharacter[] {
  if (!query.trim()) return [];
  const q = query.trim().toLowerCase();
  return ratingDataset
    .filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.anime_category.toLowerCase().includes(q)
    )
    .slice(0, limit);
}