import rawRatingData from "../../characters_with_rating.json";

export interface RawRatingCharacter {
  name: string;
  anime_category: string;
  favorites: number;
  image_url: string;
  rating: number;
}

export const ratingDataset: RawRatingCharacter[] = rawRatingData.flatMap(
  (anime: any) => anime.characters || []
);

export const RATING_ANIME_NAMES: readonly string[] = Array.from(
  new Set(
    rawRatingData
      .map(
        (anime: any) =>
          anime.anime_name ||
          (anime.characters && anime.characters[0]?.anime_category)
      )
      .filter(Boolean) as string[]
  )
);

export const RATING_ANIME_SET: Set<string> = new Set(RATING_ANIME_NAMES);

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