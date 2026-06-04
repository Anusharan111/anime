import { CHARACTERS } from "../src/data/characters";
import * as fs from "fs";
import * as path from "path";

const ANILIST_URL = "https://graphql.anilist.co";

const query = `
query ($search: String) {
  Character(search: $search) {
    image {
      large
    }
  }
}
`;

async function fetchFromAniList(searchName: string): Promise<string | null> {
  try {
    const response = await fetch(ANILIST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { search: searchName },
      }),
    });

    if (!response.ok) {
      throw new Error(`AniList returned status ${response.status}`);
    }

    const json: any = await response.json();
    return json?.data?.Character?.image?.large || null;
  } catch (err: any) {
    console.error(`Error querying AniList for "${searchName}":`, err.message);
    return null;
  }
}

async function fixTsunadeDenji() {
  console.log("Fixing Tsunade and Denji image URLs using AniList...");
  const updatedCharacters = [...CHARACTERS];
  let fixedCount = 0;

  const tsunadeIndex = updatedCharacters.findIndex(c => c.id === "tsunade");
  if (tsunadeIndex > -1) {
    const url = await fetchFromAniList("Tsunade");
    if (url) {
      console.log(`Tsunade: ${updatedCharacters[tsunadeIndex].image} -> ${url}`);
      updatedCharacters[tsunadeIndex].image = url;
      fixedCount++;
    }
  }

  const denjiIndex = updatedCharacters.findIndex(c => c.id === "denji");
  if (denjiIndex > -1) {
    const url = await fetchFromAniList("Denji");
    if (url) {
      console.log(`Denji: ${updatedCharacters[denjiIndex].image} -> ${url}`);
      updatedCharacters[denjiIndex].image = url;
      fixedCount++;
    }
  }

  if (fixedCount > 0) {
    const outPath = path.join(process.cwd(), "src/data/characters.ts");
    const fileContent = `import { Character } from "../types";

export const CHARACTERS: Character[] = ${JSON.stringify(updatedCharacters, null, 2)};
`;

    fs.writeFileSync(outPath, fileContent, "utf8");
    console.log(`Successfully saved updated character database to: ${outPath}`);
  } else {
    console.log("No characters were modified.");
  }
}

fixTsunadeDenji().catch(console.error);
