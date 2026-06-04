import { CHARACTERS } from "../src/data/characters";
import * as fs from "fs";
import * as path from "path";

const ANILIST_URL = "https://graphql.anilist.co";

const query = `
query ($search: String) {
  Character(search: $search) {
    id
    name {
      full
    }
    image {
      large
    }
  }
}
`;

// Map of handcrafted character IDs to optimal AniList search queries
const searchRefinements: Record<string, string> = {
  "sukuna": "Ryoumen Sukuna",
  "aizen": "Sousuke Aizen",
  "mob": "Shigeo Kageyama",
  "levi": "Levi",
  "tanjiro": "Tanjirou Kamado",
  "chopper": "Tony Tony Chopper",
  "l_lawliet": "L",
  "okabe": "Rintarou Okabe",
  "power_csm": "Power",
  "yusuke": "Yuusuke Urameshi",
  "hiei": "Hiei",
  "guts": "Guts",
  "griffith": "Griffith",
  "maki": "Maki Zenin",
  "erza": "Erza Scarlet",
  "natsu": "Natsu Dragneel",
  "shinra": "Shinra Kusakabe",
  "denji": "Denji",
  "escanor": "Escanor",
  "anya": "Anya Forger",
  "king": "King",
  "tsunade": "Tsunade",
  "kurapika": "Kurapika",
  "zenitsu": "Zenitsu Agatsuma",
};

async function fetchCharacterImageWithRetry(name: string, id: string, retries = 3, delay = 2000): Promise<string | null> {
  const searchTerm = searchRefinements[id] || name;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(ANILIST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          query,
          variables: { search: searchTerm },
        }),
      });

      if (response.status === 429) {
        console.warn(`  [429 Rate Limit] Attempt ${attempt}/${retries} for "${searchTerm}". Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        // Double the delay for the next attempt
        delay *= 2;
        continue;
      }

      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }

      const json: any = await response.json();
      return json?.data?.Character?.image?.large || null;
    } catch (err: any) {
      console.error(`  Error on attempt ${attempt} for "${searchTerm}":`, err.message);
      if (attempt === retries) return null;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return null;
}

async function fixImages() {
  console.log("Starting second phase of handcrafted character image repairs...");
  const updatedCharacters = [...CHARACTERS];
  let fixedCount = 0;

  for (let i = 0; i < updatedCharacters.length; i++) {
    const char = updatedCharacters[i];
    
    // Handcrafted characters do not start with "ani_"
    // Only target those that STILL have "cdn.myanimelist.net" in their image field (the broken ones)
    if (!char.id.startsWith("ani_") && char.image.includes("cdn.myanimelist.net")) {
      console.log(`Searching AniList for "${char.name}" (ID: ${char.id})...`);
      
      const newImageUrl = await fetchCharacterImageWithRetry(char.name, char.id);
      if (newImageUrl) {
        console.log(`  [UPDATED] -> ${newImageUrl}`);
        char.image = newImageUrl;
        fixedCount++;
      } else {
        console.log(`  [FAILED] Could not retrieve new image for ${char.name}`);
      }

      // Respect standard rate limits with a safe 1.5s delay
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  console.log(`\nFixed ${fixedCount} additional handcrafted character images.`);

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

fixImages().catch(console.error);
