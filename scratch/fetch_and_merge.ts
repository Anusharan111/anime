import { CHARACTERS } from "../src/data/characters";
import * as fs from "fs";
import * as path from "path";

const ANILIST_URL = "https://graphql.anilist.co";

const query = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      hasNextPage
    }
    characters(sort: FAVOURITES_DESC) {
      id
      name {
        full
      }
      image {
        large
      }
      description
      media(type: ANIME, perPage: 1) {
        nodes {
          title {
            english
            romaji
            userPreferred
          }
        }
      }
    }
  }
}
`;

function cleanDescription(desc: string): string {
  if (!desc) return "A legendary combatant summoned from the outer reaches of the multiverse.";
  let clean = desc
    .replace(/~![\s\S]*?!~/g, "") // remove spoiler text
    .replace(/<[^>]*>/g, "") // remove HTML tags
    .replace(/[_*`~]/g, "") // remove markdown formats
    .replace(/\s+/g, " ") // normalize whitespace
    .trim();
    
  if (clean.length > 150) {
    const index = clean.lastIndexOf(" ", 147);
    if (index > 80) {
      clean = clean.substring(0, index) + "...";
    } else {
      clean = clean.substring(0, 147) + "...";
    }
  }
  return clean;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function getThemeColor(description: string): string {
  const desc = description.toLowerCase();
  if (desc.includes("fire") || desc.includes("flame") || desc.includes("burn") || desc.includes("heat") || desc.includes("sun") || desc.includes("pyro") || desc.includes("blaze")) {
    return "#ef4444"; // Red
  }
  if (desc.includes("water") || desc.includes("ice") || desc.includes("ocean") || desc.includes("sea") || desc.includes("freeze") || desc.includes("rain") || desc.includes("snow") || desc.includes("frost")) {
    return "#3b82f6"; // Blue
  }
  if (desc.includes("lightning") || desc.includes("thunder") || desc.includes("electric") || desc.includes("electricity") || desc.includes("spark") || desc.includes("shock")) {
    return "#eab308"; // Gold/Yellow
  }
  if (desc.includes("grass") || desc.includes("wood") || desc.includes("green") || desc.includes("nature") || desc.includes("leaf") || desc.includes("earth") || desc.includes("forest")) {
    return "#10b981"; // Emerald
  }
  if (desc.includes("dark") || desc.includes("shadow") || desc.includes("blood") || desc.includes("evil") || desc.includes("demon") || desc.includes("curse") || desc.includes("void") || desc.includes("death")) {
    return "#a855f7"; // Purple
  }
  if (desc.includes("sword") || desc.includes("blade") || desc.includes("katana") || desc.includes("slash") || desc.includes("steel") || desc.includes("iron") || desc.includes("weapon")) {
    return "#475569"; // Slate
  }
  
  const fallbacks = ["#06b6d4", "#ec4899", "#f43f5e", "#f97316", "#8b5cf6", "#14b8a6"];
  const index = Math.abs(hashCode(description)) % fallbacks.length;
  return fallbacks[index];
}

function getSignatureEmoji(description: string): string {
  const desc = description.toLowerCase();
  if (desc.includes("fire") || desc.includes("flame") || desc.includes("burn") || desc.includes("heat") || desc.includes("sun") || desc.includes("blaze")) return "🔥";
  if (desc.includes("water") || desc.includes("ocean") || desc.includes("sea") || desc.includes("rain")) return "🌊";
  if (desc.includes("ice") || desc.includes("freeze") || desc.includes("cold") || desc.includes("snow") || desc.includes("frost")) return "❄️";
  if (desc.includes("lightning") || desc.includes("thunder") || desc.includes("electric")) return "⚡";
  if (desc.includes("sword") || desc.includes("blade") || desc.includes("katana") || desc.includes("slash")) return "⚔️";
  if (desc.includes("shield") || desc.includes("defense") || desc.includes("armor") || desc.includes("protect")) return "🛡️";
  if (desc.includes("demon") || desc.includes("evil") || desc.includes("devil") || desc.includes("blood") || desc.includes("skull") || desc.includes("death")) return "💀";
  if (desc.includes("book") || desc.includes("read") || desc.includes("smart") || desc.includes("detective") || desc.includes("genius") || desc.includes("iq")) return "📖";
  if (desc.includes("crown") || desc.includes("king") || desc.includes("queen") || desc.includes("lord") || desc.includes("emperor")) return "👑";
  if (desc.includes("dragon")) return "🐲";
  if (desc.includes("cat") || desc.includes("neko")) return "🐱";
  if (desc.includes("fist") || desc.includes("punch") || desc.includes("strike") || desc.includes("martial")) return "👊";
  if (desc.includes("magic") || desc.includes("wizard") || desc.includes("witch") || desc.includes("spell") || desc.includes("god") || desc.includes("divine")) return "🔮";
  return "🌟";
}

function generateStats(name: string, description: string) {
  const desc = description.toLowerCase();
  const n = name.toLowerCase();
  
  let strength = 60 + Math.floor(Math.random() * 25);
  let speed = 60 + Math.floor(Math.random() * 25);
  let iq = 60 + Math.floor(Math.random() * 25);
  let defense = 60 + Math.floor(Math.random() * 25);
  let magic = 60 + Math.floor(Math.random() * 25);
  
  if (desc.includes("strong") || desc.includes("physically") || desc.includes("power") || desc.includes("titan") || desc.includes("giant") || desc.includes("brute") || desc.includes("force") || desc.includes("muscle") || desc.includes("strength")) {
    strength = 90 + Math.floor(Math.random() * 11);
  }
  if (desc.includes("speed") || desc.includes("fast") || desc.includes("quick") || desc.includes("teleport") || desc.includes("swift") || desc.includes("velocity") || desc.includes("dash")) {
    speed = 90 + Math.floor(Math.random() * 11);
  }
  if (desc.includes("smart") || desc.includes("genius") || desc.includes("intellect") || desc.includes("iq") || desc.includes("brain") || desc.includes("detective") || desc.includes("mastermind") || desc.includes("tactical") || desc.includes("cunning") || n.includes("lelouch") || n.includes("light") || n.includes("l ")) {
    iq = 92 + Math.floor(Math.random() * 9);
  }
  if (desc.includes("shield") || desc.includes("defense") || desc.includes("armor") || desc.includes("defend") || desc.includes("protect") || desc.includes("unbreakable") || desc.includes("immortal")) {
    defense = 90 + Math.floor(Math.random() * 11);
  }
  if (desc.includes("magic") || desc.includes("spell") || desc.includes("sorcerer") || desc.includes("wizard") || desc.includes("god") || desc.includes("divine") || desc.includes("mana") || desc.includes("chakra") || desc.includes("devil") || desc.includes("demon") || desc.includes("curse") || desc.includes("alchemy")) {
    magic = 90 + Math.floor(Math.random() * 11);
  }
  
  return { strength, speed, iq, defense, magic };
}

async function fetchPage(page: number, perPage: number) {
  const response = await fetch(ANILIST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { page, perPage },
    }),
  });

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.statusText} (${response.status})`);
  }

  const json: any = await response.json();
  return json.data.Page;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log("Initial Handcrafted Characters count:", CHARACTERS.length);
  
  // Set up checking sets to prevent duplicates
  const existingNames = new Set(CHARACTERS.map(c => c.name.toLowerCase()));
  const existingIds = new Set(CHARACTERS.map(c => c.id.toLowerCase()));
  
  const mergedList = [...CHARACTERS];
  const targetCount = 200;
  
  let page = 1;
  const perPage = 50;
  
  console.log(`Starting to fetch popular characters from AniList...`);
  
  while (mergedList.length < targetCount) {
    console.log(`Fetching page ${page}...`);
    try {
      const pageData = await fetchPage(page, perPage);
      const characters = pageData.characters;
      
      if (!characters || characters.length === 0) {
        console.log("No more characters found on AniList.");
        break;
      }
      
      for (const char of characters) {
        if (mergedList.length >= targetCount) break;
        
        const fullName = char.name.full;
        const normalizedName = fullName.toLowerCase();
        
        // Skip if name is already present
        if (existingNames.has(normalizedName)) {
          continue;
        }
        
        // Skip characters with no associated anime titles
        const animeNodes = char.media?.nodes || [];
        if (animeNodes.length === 0) {
          continue;
        }
        
        const animeTitle = animeNodes[0].title.english || animeNodes[0].title.romaji || animeNodes[0].title.userPreferred || "Unknown Anime";
        
        // Sanitize name to form a clean ID
        let id = "ani_" + fullName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
        // Trim double underscores
        id = id.replace(/__+/g, "_").replace(/_$/, "");
        
        if (existingIds.has(id)) {
          id = `${id}_${char.id}`;
        }
        
        existingNames.add(normalizedName);
        existingIds.add(id);
        
        const desc = cleanDescription(char.description);
        const themeColor = getThemeColor(char.description || "");
        const signatureEmoji = getSignatureEmoji(char.description || "");
        const stats = generateStats(fullName, char.description || "");
        const overallPower = stats.strength + stats.speed + stats.iq + stats.defense + stats.magic;
        
        const rarity = overallPower >= 450 ? "Legendary" : overallPower >= 400 ? "Epic" : overallPower >= 350 ? "Rare" : "Common";
        
        mergedList.push({
          id,
          name: fullName,
          anime: animeTitle,
          image: char.image.large,
          themeColor,
          stats,
          overallPower,
          rarity,
          description: desc,
          signatureEmoji,
        });
      }
      
      console.log(`Current merged library count: ${mergedList.length}/${targetCount}`);
      
      if (!pageData.pageInfo.hasNextPage) {
        console.log("Reached last page of AniList.");
        break;
      }
      
      page++;
      // Sleep to avoid rate limiting
      await sleep(1000);
      
    } catch (e) {
      console.error(`Error fetching page ${page}:`, e);
      break;
    }
  }
  
  console.log(`Finished merging. Total characters in final list: ${mergedList.length}`);
  
  // Write the output TS file
  const outPath = path.join(process.cwd(), "src/data/characters.ts");
  const fileContent = `import { Character } from "../types";

export const CHARACTERS: Character[] = ${JSON.stringify(mergedList, null, 2)};
`;

  fs.writeFileSync(outPath, fileContent, "utf8");
  console.log(`Successfully updated database at: ${outPath}`);
}

main().catch(console.error);
