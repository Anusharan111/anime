import rawRatingData from "../../characters_with_rating.json";

export interface RawRatingCharacter {
  name: string;
  anime_category: string;
  favorites: number;
  image_url: string;
  rating: number;
}

export const ratingDataset: RawRatingCharacter[] = rawRatingData.flatMap(
  (anime: any) =>
    (anime.characters || []).map((c: any) => ({
      name: c.name,
      anime_category: c.anime_category || anime.anime_name || "Anime",
      favorites: c.favorites || 0,
      image_url: c.image_url || "",
      rating: typeof c.rating === "number" ? c.rating : 300,
    }))
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
).sort();

export const RATING_ANIME_SET: Set<string> = new Set(RATING_ANIME_NAMES);

/**
 * Normalizes an anime title for fuzzy matching (removes punctuation, subtitles, and symbols).
 */
export function cleanAnimeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[:\-–—_'"’!?.,/\\()\[\]{}×*+~`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Common franchise abbreviations and aliases mapping to dataset anime names
const FRANCHISE_ALIASES: Record<string, string[]> = {
  "naruto": ["naruto", "naruto shippuden", "shippuden", "boruto"],
  "dragon ball": ["dragon ball", "dragon ball z", "dragon ball super", "dragon ball gt", "dbz", "dbs"],
  "demon slayer: kimetsu no yaiba": ["demon slayer", "kimetsu no yaiba", "demon slayer kimetsu no yaiba"],
  "attack on titan": ["attack on titan", "shingeki no kyojin", "aot"],
  "fullmetal alchemist: brotherhood": ["fullmetal alchemist", "fullmetal alchemist brotherhood", "fma", "fmab"],
  "bleach": ["bleach", "bleach thousand year blood war", "tybw"],
  "one piece": ["one piece", "op"],
  "jujutsu kaisen": ["jujutsu kaisen", "jjk"],
  "chainsaw man": ["chainsaw man", "csm"],
  "my hero academia": ["my hero academia", "boku no hero academia", "mha", "bnha"],
  "hunter × hunter": ["hunter x hunter", "hunter hunter", "hxh"],
  "that time i got reincarnated as a slime": ["slime", "tensura", "that time i got reincarnated as a slime"],
  "jojo's bizarre adventure": ["jojo", "jojo s bizarre adventure", "jjba", "jojos bizarre adventure"],
  "sword art online": ["sao", "sword art online"],
  "solo leveling": ["solo leveling"],
  "one punch man": ["one punch man", "opm"],
  "code geass: lelouch of the rebellion": ["code geass", "lelouch of the rebellion"],
  "mob psycho 100": ["mob psycho", "mob psycho 100"],
  "tokyo ghoul": ["tokyo ghoul"],
  "fate/zero": ["fate", "fate zero", "fate stay night"],
  "fairy tail": ["fairy tail"],
  "black clover": ["black clover"],
  "re:zero -starting life in another world-": ["re zero", "rezero", "re zero starting life in another world"],
  "dr. stone": ["dr stone", "doctor stone"],
  "vinland saga": ["vinland saga"],
  "cyberpunk: edgerunners": ["cyberpunk", "cyberpunk edgerunners", "edgerunners"],
  "neon genesis evangelion": ["evangelion", "eva", "neon genesis evangelion"],
  "spy × family": ["spy x family", "spy family"],
};

// Pre-index characters by cleaned anime category and direct anime name for fast lookups
const charactersByCleanCategory = new Map<string, RawRatingCharacter[]>();
for (const anime of rawRatingData) {
  const animeNameClean = anime.anime_name ? cleanAnimeString(anime.anime_name) : "";
  const chars: RawRatingCharacter[] = (anime.characters || []).map((c: any) => ({
    name: c.name,
    anime_category: c.anime_category || anime.anime_name || "Anime",
    favorites: c.favorites || 0,
    image_url: c.image_url || "",
    rating: typeof c.rating === "number" ? c.rating : 300,
  }));

  if (animeNameClean) {
    if (!charactersByCleanCategory.has(animeNameClean)) {
      charactersByCleanCategory.set(animeNameClean, []);
    }
    charactersByCleanCategory.get(animeNameClean)!.push(...chars);
  }

  // Also index by character's own anime_category
  for (const c of chars) {
    const catClean = cleanAnimeString(c.anime_category);
    if (catClean && catClean !== animeNameClean) {
      if (!charactersByCleanCategory.has(catClean)) {
        charactersByCleanCategory.set(catClean, []);
      }
      charactersByCleanCategory.get(catClean)!.push(c);
    }
  }
}

/**
 * Gets characters for an anime from the local dataset.
 * Checks exact match, cleaned string match, franchise aliases, and substring containment.
 */
export function getCharactersByAnime(animeName: string): RawRatingCharacter[] {
  if (!animeName || !animeName.trim()) return [];
  const cleanQuery = cleanAnimeString(animeName);
  const normalizedRaw = animeName.trim().toLowerCase();

  // 1. Direct match on clean category index
  if (charactersByCleanCategory.has(cleanQuery)) {
    return charactersByCleanCategory.get(cleanQuery)!;
  }

  // 2. Direct match on raw category
  const directMatches = ratingDataset.filter(
    (c) => c.anime_category.trim().toLowerCase() === normalizedRaw
  );
  if (directMatches.length > 0) return directMatches;

  // 3. Check franchise aliases
  for (const [canonicalName, aliasList] of Object.entries(FRANCHISE_ALIASES)) {
    const isAliasMatch =
      aliasList.some((alias) => cleanQuery === alias || cleanQuery.includes(alias) || alias.includes(cleanQuery)) ||
      canonicalName.toLowerCase() === normalizedRaw ||
      cleanAnimeString(canonicalName) === cleanQuery;

    if (isAliasMatch) {
      const chars = getCharactersByAnime(canonicalName);
      if (chars.length > 0) return chars;
    }
  }

  // 4. Substring containment match on dataset anime names
  for (const anime of RATING_ANIME_NAMES) {
    const cleanDatasetAnime = cleanAnimeString(anime);
    if (
      cleanDatasetAnime.includes(cleanQuery) ||
      cleanQuery.includes(cleanDatasetAnime)
    ) {
      const chars = charactersByCleanCategory.get(cleanDatasetAnime);
      if (chars && chars.length > 0) return chars;
    }
  }

  // 5. Fallback character-level search
  return ratingDataset.filter((c) => {
    const catClean = cleanAnimeString(c.anime_category);
    return catClean.includes(cleanQuery) || cleanQuery.includes(catClean);
  });
}

/**
 * Returns whether the local dataset has characters for the given anime name.
 */
export function hasLocalDatasetForAnime(animeName: string): boolean {
  return getCharactersByAnime(animeName).length > 0;
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