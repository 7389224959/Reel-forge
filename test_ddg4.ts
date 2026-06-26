async function searchDDG(query: string) {
  try {
    const res = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const text = await res.text();
    const vqdMatch = text.match(/vqd="([^"]+)"/) || text.match(/vqd=([\w-]+)/);
    const vqd = vqdMatch ? vqdMatch[1] : null;
    
    if (vqd) {
      const imgRes = await fetch(`https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,,,&p=1`, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const imgData = await imgRes.json();
      console.log("Images:", imgData.results.slice(0, 3).map((r:any) => r.image));
    }
  } catch(e) { console.error(e) }
}
searchDDG("India map Chhattisgarh pride");
