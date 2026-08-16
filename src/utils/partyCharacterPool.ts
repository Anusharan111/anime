import { Character } from "../types";
import { CHARACTERS } from "../data/characters";
import {
  ratingDataset,
  RATING_ANIME_NAMES,
  RATING_ANIME_SET,
  getCharactersByAnime,
  cleanAnimeString,
} from "./ratingDataset";
import { adaptRatingCharacters } from "./ratingAdapter";
import { dedupeCharacters, getAnimeKey } from "./draftPool";

/**
 * Normalizes an anime name for matching.
 */
export function normalizeAnimeName(anime: string): string {
  return cleanAnimeString(anime);
}

/**
 * Checks if a character's anime matches a selected anime.
 */
export function matchesAnimeCategory(characterAnime: string, selectedAnime: string): boolean {
  if (!characterAnime || !selectedAnime) return false;
  const c = cleanAnimeString(characterAnime);
  const s = cleanAnimeString(selectedAnime);

  if (c === s) return true;
  if (c.includes(s) || s.includes(c)) return true;

  return false;
}

/**
 * Builds the complete base pool combining:
 * 1. All adapted characters from the rating dataset (4,285+ characters across 100 anime)
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
    // 1. Primary: load all characters from the local rating dataset for this anime
    const rawChars = getCharactersByAnime(animeName);
    if (rawChars && rawChars.length > 0) {
      const adapted = adaptRatingCharacters(rawChars);
      for (const c of adapted) {
        if (!seenIds.has(c.id)) {
          seenIds.add(c.id);
          result.push(c);
        }
      }
    }

    // 2. Also check basePool for matching anime characters (e.g. from built-in characters.ts or API)
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

  // Add all dataset anime
  for (const name of RATING_ANIME_NAMES) {
    animeSet.add(name);
  }

  // Add all other anime from pool
  for (const c of pool) {
    if (c.anime && c.anime.trim()) {
      animeSet.add(c.anime.trim());
    }
  }

  return Array.from(animeSet).sort((a, b) => a.localeCompare(b));
}
