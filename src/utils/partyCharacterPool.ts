import { Character } from "../types";
import { CHARACTERS } from "../data/characters";
import {
  ratingDataset,
  RATING_ANIME_NAMES,
  RATING_ANIME_SET,
  getCharactersByAnime,
} from "./ratingDataset";
import { adaptRatingCharacters } from "./ratingAdapter";
import { dedupeCharacters, getAnimeKey } from "./draftPool";

/**
 * Normalizes an anime name and checks for franchise / alias matches.
 */
export function normalizeAnimeName(anime: string): string {
  return anime.trim().toLowerCase();
}

/**
 * Checks if a character's anime matches a selected anime (with alias & sub-franchise support).
 */
export function matchesAnimeCategory(characterAnime: string, selectedAnime: string): boolean {
  if (!characterAnime || !selectedAnime) return false;
  const c = normalizeAnimeName(characterAnime);
  const s = normalizeAnimeName(selectedAnime);

  if (c === s) return true;
  if (c.includes(s) || s.includes(c)) return true;

  // Franchise aliases
  const aliases: Record<string, string[]> = {
    "naruto": ["naruto", "naruto shippuden", "boruto"],
    "dragon ball": ["dragon ball", "dragon ball z", "dragon ball super", "dragon ball gt", "dbz", "dbs"],
    "demon slayer": ["demon slayer", "demon slayer: kimetsu no yaiba", "kimetsu no yaiba"],
    "attack on titan": ["attack on titan", "shingeki no kyojin", "aot"],
    "fullmetal alchemist": ["fullmetal alchemist", "fullmetal alchemist: brotherhood", "fmab", "fma"],
    "bleach": ["bleach", "bleach: thousand-year blood war"],
    "one piece": ["one piece", "op"],
    "jujutsu kaisen": ["jujutsu kaisen", "jjk"],
    "chainsaw man": ["chainsaw man", "csm"],
    "hunter x hunter": ["hunter x hunter", "hunterxhunter", "hxh"],
    "death note": ["death note"],
    "my hero academia": ["my hero academia", "boku no hero academia", "mha", "bnha"],
    "black clover": ["black clover"],
    "tokyo ghoul": ["tokyo ghoul"],
    "solo leveling": ["solo leveling"],
    "sword art online": ["sword art online", "sao"],
    "jojo": ["jojo's bizarre adventure", "jojos bizarre adventure", "jojo"],
    "haikyuu": ["haikyuu!!", "haikyuu", "haikyu"],
    "fairy tail": ["fairy tail"],
    "spy x family": ["spy x family", "spyxfamily", "spy family"],
    "one punch man": ["one punch man", "opm"],
    "mob psycho": ["mob psycho 100", "mob psycho"],
    "blue lock": ["blue lock"],
    "vinland saga": ["vinland saga"],
    "fate": ["fate/zero", "fate/stay night", "fate"],
  };

  for (const [key, aliasList] of Object.entries(aliases)) {
    const sMatches = s.includes(key) || aliasList.some(a => s.includes(a));
    const cMatches = c.includes(key) || aliasList.some(a => c.includes(a));
    if (sMatches && cMatches) return true;
  }

  return false;
}

/**
 * Builds the complete base pool combining:
 * 1. All adapted characters from the rating dataset (hundreds of characters across top 9 anime)
 * 2. All built-in characters from characters.ts
 */
export function getAllInitialCharacters(): Character[] {
  const ratingChars = adaptRatingCharacters(ratingDataset);
  const combined = [...ratingChars, ...CHARACTERS];
  return dedupeCharacters(combined);
}

/**
 * Builds a fast ID -> Character lookup map for all known characters.
 */
export function buildAllCharactersMap(extraCharacters: Character[] = []): Map<string, Character> {
  const all = [...getAllInitialCharacters(), ...extraCharacters];
  const map = new Map<string, Character>();
  for (const c of all) {
    if (c?.id) {
      map.set(c.id, c);
    }
  }
  return map;
}

/**
 * Filters characters for a selected anime list with deep rating-dataset integration.
 */
export function getCharactersForAnimeSelection(
  selectedAnimes: string[],
  basePool: Character[] = getAllInitialCharacters()
): Character[] {
  if (!selectedAnimes || selectedAnimes.length === 0) {
    return basePool;
  }

  const result: Character[] = [];
  const seenIds = new Set<string>();

  for (const animeName of selectedAnimes) {
    const norm = normalizeAnimeName(animeName);

    // 1. If it's one of the rating dataset anime or matches one, add all its rating characters
    for (const ratingAnime of RATING_ANIME_NAMES) {
      if (matchesAnimeCategory(ratingAnime, animeName) || matchesAnimeCategory(animeName, ratingAnime)) {
        const rawChars = getCharactersByAnime(ratingAnime);
        const adapted = adaptRatingCharacters(rawChars);
        for (const c of adapted) {
          if (!seenIds.has(c.id)) {
            seenIds.add(c.id);
            result.push(c);
          }
        }
      }
    }

    // 2. Also search through the base pool for matching characters
    for (const c of basePool) {
      if (c.anime && matchesAnimeCategory(c.anime, animeName)) {
        if (!seenIds.has(c.id)) {
          seenIds.add(c.id);
          result.push(c);
        }
      }
    }
  }

  return result;
}

/**
 * Returns all distinct anime names present across the rating dataset and character pool.
 */
export function getAllAvailableAnimeNames(pool: Character[] = getAllInitialCharacters()): string[] {
  const animeSet = new Set<string>();

  // Add the 9 top rating anime
  for (const name of RATING_ANIME_NAMES) {
    animeSet.add(name);
  }

  // Add all other anime from pool
  for (const c of pool) {
    if (c.anime && c.anime.trim()) {
      animeSet.add(c.anime.trim());
    }
  }

  return Array.from(animeSet).sort();
}
