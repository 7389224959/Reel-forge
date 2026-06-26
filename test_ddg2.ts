async function searchDDG(query: string) {
  try {
    const res = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const text = await res.text();
    const vqdMatch = text.match(/vqd="([^"]+)"/) || text.match(/vqd=([\w-]+)/);
    console.log(vqdMatch ? vqdMatch[1] : 'no vqd');
  } catch(e) {}
}
searchDDG("Moon satellite launch");
