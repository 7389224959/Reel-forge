import { chromium } from 'playwright';

async function run() {
  const query = "Moon satellite launch";
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC3`, { 
    timeout: 30000, 
    waitUntil: 'domcontentloaded' 
  });
  
  try {
    await page.waitForSelector('.iusc', { timeout: 5000 });
  } catch(e) {
    console.log("no .iusc found");
  }
  
  const iuscElements = await page.locator('.iusc').all();
  console.log("Found .iusc elements:", iuscElements.length);
  
  for (const iusc of iuscElements.slice(0, 5)) {
     const mAttr = await iusc.getAttribute('m');
     if (mAttr) {
        try {
           const mData = JSON.parse(mAttr);
           console.log("murl:", mData.murl);
           console.log("turl:", mData.turl);
        } catch(e) {}
     }
  }

  await browser.close();
}

run().catch(console.error);
