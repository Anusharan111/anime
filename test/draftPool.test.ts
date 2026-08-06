import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Character } from "../src/types";
import {
  MIN_RECOMMENDED_POOL,
  ABSOLUTE_MIN,
  getDraftQuality,
  getDraftQualityLabel,
  getAnimeKey,
  fisherYatesShuffle,
  buildAnimeCatalog,
  dedupeCharacters,
  filterCharactersByAnimes,
  DraftQueue,
  getSuggestions,
} from "../src/utils/draftPool.ts";

const makeCharacter = (id: string, anime: string, props: Partial<Character> = {}): Character => ({
  id,
  name: id,
  anime,
  image: "",
  themeColor: "#fff",
  stats: { strength: 1, speed: 1, iq: 1, defense: 1, magic: 1 },
  overallPower: 5,
  rarity: "Common",
  ...props,
});

describe("validation thresholds", () => {
  const cases: Array<[number, string]> = [
    [0, "blocked"],
    [7, "blocked"],
    [8, "very-small"],
    [19, "very-small"],
    [20, "limited"],
    [49, "limited"],
    [50, "recommended"],
    [69, "recommended"],
    [70, "good"],
    [99, "good"],
    [100, "excellent"],
    [500, "excellent"],
  ];

  it(`uses ABSOLUTE_MIN=${ABSOLUTE_MIN} and MIN_RECOMMENDED_POOL=${MIN_RECOMMENDED_POOL}`, () => {
    assert.equal(ABSOLUTE_MIN, 8);
    assert.equal(MIN_RECOMMENDED_POOL, 50);
  });

  for (const [total, quality] of cases) {
    it(`getDraftQuality(${total}) === "${quality}"`, () => {
      assert.equal(getDraftQuality(total), quality);
    });
  }

  it("quality labels are unique and defined for every quality", () => {
    const labels = ["excellent", "good", "recommended", "limited", "very-small", "blocked"].map(getDraftQualityLabel);
    assert.equal(new Set(labels).size, labels.length);
    labels.forEach((label) => assert.ok(label.length > 0));
  });
});

describe("getAnimeKey", () => {
  it("normalizes case and trims whitespace", () => {
    assert.equal(getAnimeKey(" One Piece "), "one piece");
    assert.equal(getAnimeKey("one piece"), getAnimeKey("ONE PIECE"));
  });
});

describe("buildAnimeCatalog", () => {
  it("builds sorted unique anime list with counts", () => {
    const { animeList, animeCounts } = buildAnimeCatalog([
      makeCharacter("a1", "Naruto"),
      makeCharacter("a2", "Naruto"),
      makeCharacter("a3", "Bleach"),
      makeCharacter("a4", "One Piece"),
    ]);
    assert.deepEqual(animeList, ["Bleach", "Naruto", "One Piece"]);
    assert.deepEqual(animeCounts, { Bleach: 1, Naruto: 2, "One Piece": 1 });
  });

  it("groups by canonical key, preserving first-seen label casing", () => {
    const { animeList, animeCounts } = buildAnimeCatalog([
      makeCharacter("a1", "naruto"),
      makeCharacter("a2", "NARUTO"),
    ]);
    assert.deepEqual(animeList, ["naruto"]);
    assert.equal(animeCounts["naruto"], 2);
  });

  it("skips characters without an anime", () => {
    const { animeList, animeCounts } = buildAnimeCatalog([
      makeCharacter("a1", ""),
      makeCharacter("a2", "   "),
      makeCharacter("a3", "Bleach"),
    ]);
    assert.deepEqual(animeList, ["Bleach"]);
    assert.deepEqual(animeCounts, { Bleach: 1 });
  });
});

describe("fisherYatesShuffle", () => {
  it("returns a permutation of the same length without losing elements", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = fisherYatesShuffle(input);
    assert.deepEqual([...shuffled].sort((a, b) => a - b), input);
    assert.equal(shuffled.length, input.length);
  });

  it("does not mutate the input array", () => {
    const input = [1, 2, 3, 4, 5];
    fisherYatesShuffle(input);
    assert.deepEqual(input, [1, 2, 3, 4, 5]);
  });

  it("deterministic shuffle matches given random source", () => {
    // A fake shuffle that reverses input, to prove the injected shuffle is used.
    const fakeShuffle = <T,>(arr: T[]) => [...arr].reverse();
    const queue = new DraftQueue([makeCharacter("x", "X"), makeCharacter("y", "Y")], fakeShuffle);
    const first = queue.draw();
    assert.ok(first);
    assert.equal(first.id, "y");
  });
});

describe("dedupeCharacters", () => {
  it("keeps the first occurrence of a duplicate id", () => {
    const first = makeCharacter("a", "Naruto");
    const dup = makeCharacter("a", "Bleach");
    const result = dedupeCharacters([first, dup]);
    assert.equal(result.length, 1);
    assert.equal(result[0].anime, "Naruto");
  });
});

describe("filterCharactersByAnimes", () => {
  const roster = [
    makeCharacter("a", "Naruto"),
    makeCharacter("b", "Bleach"),
    makeCharacter("c", "One Piece"),
  ];

  it("returns all characters when no animes are selected", () => {
    assert.equal(filterCharactersByAnimes(roster, []).length, 3);
  });

  it("matches animes case-insensitively", () => {
    const result = filterCharactersByAnimes(roster, ["naruto", "one piece"]);
    assert.deepEqual(result.map((c) => c.id), ["a", "c"]);
  });
});

describe("DraftQueue", () => {
  const crew = (n: number, prefix = "c") =>
    Array.from({ length: n }, (_, i) => makeCharacter(`${prefix}${i}`, "Naruto"));

  it("draws every character exactly once (no replacement, no duplicates)", () => {
    const queue = new DraftQueue(crew(50));
    const drawn: string[] = [];
    let next = queue.draw();
    while (next) {
      drawn.push(next.id);
      next = queue.draw();
    }
    assert.equal(drawn.length, 50);
    assert.equal(new Set(drawn).size, 50);
    assert.equal(queue.exhausted, true);
    assert.equal(queue.remaining, 0);
    assert.equal(queue.draws, 50);
  });

  it("returns null once exhausted and stays exhausted", () => {
    const queue = new DraftQueue(crew(1));
    assert.ok(queue.draw());
    assert.equal(queue.draw(), null);
    assert.equal(queue.draw(), null);
    assert.equal(queue.exhausted, true);
  });

  it("dedupes input on construction", () => {
    const queue = new DraftQueue([makeCharacter("a", "N"), makeCharacter("a", "N")]);
    assert.equal(queue.poolSize, 1);
  });

  it("skipToEnd sends the character to the back of the line", () => {
    const identity = <T,>(arr: T[]) => arr;
    const queue = new DraftQueue([makeCharacter("x", "N"), makeCharacter("y", "N"), makeCharacter("z", "N")], identity);
    queue.skipToEnd(queue.draw()!); // x to the end -> order y, z, x
    const order = [queue.draw()!.id, queue.draw()!.id, queue.draw()!.id];
    assert.deepEqual(order, ["y", "z", "x"]);
  });

  it("skipToEnd followed by draw never loses a character", () => {
    const identity = <T,>(arr: T[]) => arr;
    const queue = new DraftQueue(crew(5), identity);
    queue.skipToEnd(queue.draw()!); // c0 skipped to the back
    const drawn: string[] = [];
    let next = queue.draw();
    while (next) {
      drawn.push(next.id);
      next = queue.draw();
    }
    assert.equal(drawn.length, 5);
    assert.deepEqual(new Set(drawn), new Set(["c0", "c1", "c2", "c3", "c4"]));
  });

  it("reshuffle restarts the queue with a fresh shuffled pool", () => {
    const queue = new DraftQueue(crew(5));
    queue.draw();
    queue.draw();
    assert.equal(queue.draws, 2);
    queue.reshuffle(crew(3));
    assert.equal(queue.poolSize, 3);
    assert.equal(queue.draws, 0);
    assert.equal(queue.exhausted, false);
    assert.equal(queue.remaining, 3);
  });

  it("reshuffle keeps uniqueness during subsequent draws", () => {
    const queue = new DraftQueue(crew(4));
    queue.reshuffle(crew(4));
    const ids = [queue.draw()!.id, queue.draw()!.id, queue.draw()!.id, queue.draw()!.id];
    assert.equal(new Set(ids).size, 4);
  });

  it("empty pool is immediately exhausted", () => {
    const queue = new DraftQueue([]);
    assert.equal(queue.exhausted, true);
    assert.equal(queue.draw(), null);
  });
});

describe("getSuggestions", () => {
  const counts = { Naruto: 40, Bleach: 30, "One Piece": 20, "Dragon Ball": 10, AoT: 5 };

  it("excludes already selected animes", () => {
    const result = getSuggestions(counts, ["Naruto"]);
    assert.ok(!result.some((s) => s.anime === "Naruto"));
  });

  it("returns top entries by count, descending, respecting the limit", () => {
    const result = getSuggestions(counts, [], 3);
    assert.deepEqual(result, [
      { anime: "Naruto", count: 40 },
      { anime: "Bleach", count: 30 },
      { anime: "One Piece", count: 20 },
    ]);
  });

  it("honors the limit default", () => {
    assert.equal(getSuggestions(counts, [], 3).length, 3);
  });
});