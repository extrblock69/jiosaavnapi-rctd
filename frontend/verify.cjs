const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Navigating to frontend...");
  await page.goto('http://localhost:5173');

  console.log("Waiting for test mode button...");
  const btn = page.locator('button[title="Test Mode Diagnostic"]');
  await btn.waitFor();

  console.log("Clicking Test Mode button...");
  await btn.click();

  console.log("Waiting for the input field to be visible...");
  const input = page.locator('input[placeholder="e.g. Arijit Singh"]');
  await input.waitFor();

  console.log("Typing 'Khatta flow'...");
  await input.fill('Khatta flow');

  console.log("Clicking 'Run Diagnostics'...");
  await page.getByRole('button', { name: 'Run Diagnostics' }).click();

  console.log("Waiting for logs to finish...");
  await page.waitForFunction(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Diagnostics'));
    return btn && btn.textContent === 'Run Diagnostics' && !btn.disabled;
  }, { timeout: 15000 }).catch(e => console.log('Timeout waiting for diagnostic to finish'));

  console.log("Capturing screenshot of Diagnostic Center...");
  await page.screenshot({ path: 'diagnostic.png' });

  console.log("Done.");
  await browser.close();
})();
