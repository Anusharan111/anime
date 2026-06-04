import { CHARACTERS } from "../src/data/characters";
import * as fs from "fs";
import * as path from "path";

// Jikan API character search helper
async function fetchJikanImage(name: string, id: string, retries = 3, delay = 2000): Promise<string | null> {
  // Use optimal search terms for specific character names
  let searchTerm = name;
  if (name.includes("Mob")) searchTerm = "Shigeo Kageyama";
  if (name === "Power") searchTerm = "Power Chainsaw Man";
  if (name === "L Lawliet") searchTerm = "L ";
  if (name === "Levi Ackerman") searchTerm = "Levi";

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(searchTerm)}&limit=1`);
      
      if (response.status === 429) {
        console.warn(`  [429 Rate Limit] Jikan rate limited. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }

      if (!response.ok) {
        throw new Error(`Jikan returned status ${response.status}`);
      }

      const json: any = await response.json();
      const character = json?.data?.[0];
      return character?.images?.jpg?.image_url || character?.images?.webp?.image_url || null;
    } catch (err: any) {
      console.error(`  Error on attempt ${attempt} for Jikan search "${searchTerm}":`, err.message);
      if (attempt === retries) return null;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return null;
}

async function fixWithJikan() {
  console.log("Starting Jikan API repair phase 2...");
  const updatedCharacters = [...CHARACTERS];
  let fixedCount = 0;

  // The 13 characters that were identified as broken in the final check
  const brokenIds = [
    "mob", "levi", "tanjiro", "chopper", "l_lawliet", "zenitsu", "kurapika", "tsunade", "king", "anya", "escanor", "denji", "power_csm"
  ];

  for (let i = 0; i < updatedCharacters.length; i++) {
    const char = updatedCharacters[i];
    
    if (brokenIds.includes(char.id)) {
      console.log(`Searching Jikan API for "${char.name}" (ID: ${char.id})...`);
      
      const newImageUrl = await fetchJikanImage(char.name, char.id);
      if (newImageUrl) {
        console.log(`  [JIKAN UPDATED] -> ${newImageUrl}`);
        char.image = newImageUrl;
        fixedCount++;
      } else {
        console.log(`  [FAILED] Could not retrieve Jikan image for ${char.name}`);
      }

      // Safe 2.0s delay to respect Jikan's standard rate limits completely
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\nFixed ${fixedCount} characters using Jikan.`);

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

fixWithJikan().catch(console.error);
