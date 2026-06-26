async function searchDDG(query: string) {
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`);
    const text = await res.text();
    // In the HTML DDG version, there are no images directly? Let's check.
    const vqdMatch = text.match(/vqd='([^']+)'/);
    if (!vqdMatch) {
       console.log("No VQD found");
       return;
    }
    const vqd = vqdMatch[1];
    
    const imgRes = await fetch(`https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,,,&p=1`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
    });
    const imgData = await imgRes.json();
    console.log(imgData.results.slice(0, 2).map((r: any) => r.image));
  } catch(e) {
    console.error(e);
  }
}
searchDDG("Moon satellite launch");
