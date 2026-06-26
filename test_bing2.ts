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
  
  const mimgElements = await page.locator('img.mimg').all();
  console.log("Found .mimg elements:", mimgElements.length);
  
  for (const img of mimgElements.slice(0, 5)) {
     const src = await img.getAttribute('src');
     console.log("src:", src);
  }

  await browser.close();
}

run().catch(console.error);
