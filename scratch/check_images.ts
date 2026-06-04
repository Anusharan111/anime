import { CHARACTERS } from "../src/data/characters";

async function checkImages() {
  console.log(`Checking ${CHARACTERS.length} characters...`);
  const broken: { id: string; name: string; url: string; status: number | string }[] = [];

  // Limit concurrency to not get rate limited or block
  for (let i = 0; i < CHARACTERS.length; i++) {
    const char = CHARACTERS[i];
    const url = char.image;

    if (!url) {
      console.log(`[MISSING] ${char.name} (${char.id}) has no image URL`);
      broken.push({ id: char.id, name: char.name, url: "", status: "MISSING" });
      continue;
    }

    try {
      const response = await fetch(url, {
        method: "HEAD",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        }
      });

      if (!response.ok) {
        console.log(`[BROKEN] ${char.name} (${char.id}): ${response.status} - ${url}`);
        broken.push({ id: char.id, name: char.name, url, status: response.status });
      } else {
        // console.log(`[OK] ${char.name} (${char.id})`);
      }
    } catch (err: any) {
      console.log(`[ERROR] ${char.name} (${char.id}): ${err.message} - ${url}`);
      broken.push({ id: char.id, name: char.name, url, status: err.message });
    }

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log("\n=== Diagnostic Summary ===");
  console.log(`Total characters checked: ${CHARACTERS.length}`);
  console.log(`Total broken images: ${broken.length}`);
  console.log(JSON.stringify(broken, null, 2));
}

checkImages().catch(console.error);
