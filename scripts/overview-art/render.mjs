/**
 * Regenerates the /overview page's images. They are drawn procedurally, so
 * there are no stock or third-party assets to license.
 *
 *   src/overview/art/{design,make,qualify}.jpg  story-card backgrounds (2400x1200)
 *   public/og/prism-overview.png                link-preview image (1200x630)
 *
 * Usage: node scripts/overview-art/render.mjs
 * Set CHROMIUM_PATH to use a specific Chromium binary.
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

const page = await browser.newPage({ viewport: { width: 2400, height: 1200 } });
mkdirSync(here('../../src/overview/art'), { recursive: true });
for (const art of ['design', 'make', 'qualify']) {
    await page.goto(`file://${here('./art.html')}?art=${art}`);
    await page.waitForFunction(() => document.title === 'done', null, { timeout: 60000 });
    await page.locator('canvas').screenshot({ path: here(`../../src/overview/art/${art}.jpg`), type: 'jpeg', quality: 80 });
    console.log(`src/overview/art/${art}.jpg`);
}

await page.setViewportSize({ width: 1200, height: 630 });
mkdirSync(here('../../public/og'), { recursive: true });
await page.goto(`file://${here('./og.html')}`);
await page.waitForFunction(() => document.title === 'done', null, { timeout: 60000 });
await page.locator('#card').screenshot({ path: here('../../public/og/prism-overview.png') });
console.log('public/og/prism-overview.png');

await browser.close();
