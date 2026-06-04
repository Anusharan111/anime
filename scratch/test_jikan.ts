async function test() {
  const name = "Ryomen Sukuna";
  try {
    const res = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(name)}&limit=1`);
    const data: any = await res.json();
    const character = data?.data?.[0];
    const image = character?.images?.jpg?.image_url || character?.images?.webp?.image_url || null;
    console.log(`Successfully found image for Ryomen Sukuna: ${image}`);
  } catch (err: any) {
    console.error("Jikan API error:", err.message);
  }
}
test();
