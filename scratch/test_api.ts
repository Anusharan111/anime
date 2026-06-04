import fetch from "node-fetch";

async function test() {
  try {
    const res = await fetch("http://localhost:6000/api/characters/random?animes=Jujutsu%20Kaisen,Naruto%20Shippuden");
    if (res.ok) {
      const data = await res.json();
      console.log("SUCCESS:", data.name, "from", data.anime);
    } else {
      console.log("FAILED:", res.status, await res.text());
    }
  } catch (e) {
    console.error("ERROR:", e);
  }
}

test();
