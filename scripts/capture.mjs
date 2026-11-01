import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
await fs.mkdir('qa/screenshots', { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
for (const route of ['login', 'home', 'profile', 'garage', 'map', 'qr', 'simulation', 'configure', 'summary', 'charging', 'success', 'signup', 'recovery']) {
  await page.goto(`http://localhost:8081/${route}`);
  await page.waitForFunction(() => document.fonts.check('15px Inter_400Regular'));
  await page.locator('[data-testid^="asset:"]').first().waitFor();
  await page.waitForFunction(() => [...document.querySelectorAll('[data-testid^="asset:"] img')].every(img => img.complete && img.naturalWidth > 0));
  const assets = await page.locator('[data-testid^="asset:"]').evaluateAll(nodes => nodes.map(n => {
    const img = n.querySelector('img'); const rect = n.getBoundingClientRect();
    return { asset: n.getAttribute('data-testid'), loaded: !!img && img.complete && img.naturalWidth > 0, width: rect.width, height: rect.height };
  }));
  await fs.writeFile(`qa/screenshots/${route}.assets.json`, JSON.stringify(assets, null, 2));
  await page.screenshot({ path: `qa/screenshots/${route}.png` });
  console.log(route, 'assets:', assets.length, 'failed:', assets.filter(a => !a.loaded).map(a => a.asset));
}
await fs.writeFile('qa/browser-errors.json', JSON.stringify(errors, null, 2));
console.log('Browser errors:', errors);
await browser.close();
