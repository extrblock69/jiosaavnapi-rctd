const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Navigating to frontend...");
  await page.goto('http://localhost:5173/search');

  console.log("Typing 'Arijit' into search...");
  await page.fill('input[placeholder="Search songs on JioSaavn..."]', 'Arijit');
  await page.keyboard.press('Enter');

  console.log("Waiting for All category results...");
  await page.waitForSelector('h2:has-text("Results for \\"Arijit\\"")');

  console.log("Clicking 'Albums' tab...");
  await page.click('button:has-text("albums")');
  await page.waitForTimeout(1000); // short wait for results to re-fetch

  console.log("Capturing screenshot of Search Tabs...");
  await page.screenshot({ path: 'spotify_tabs.png' });

  console.log("Clicking an Album...");
  // First item should be an album now
  await page.locator('.group.relative.bg-\\[\\#111\\]').first().click();

  console.log("Waiting for Album page...");
  await page.waitForSelector('span:has-text("Album")');

  console.log("Capturing screenshot of Album page...");
  await page.screenshot({ path: 'spotify_album.png' });

  console.log("Done.");
  await browser.close();
})();
