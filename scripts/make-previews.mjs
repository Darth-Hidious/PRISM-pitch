/**
 * Draws the pictures that messengers and social sites show when someone shares a link to the site
 * (og:image in each page's head): 1200 × 630, our own photographs, the site's own words.
 *
 *   node scripts/make-previews.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const file = (path) => pathToFileURL(resolve(ROOT, path)).href;

const CARDS = [
    {
        out: 'public/og/prism.jpg',
        title: 'Materials built for the&nbsp;extreme.',
        lead: 'Designed with AI. Made and tested in Europe.',
        photo: 'public/img/spark-melt.webp',
        focus: '50% 50%',
    },
    {
        out: 'public/og/investor-room.jpg',
        title: 'Investor room',
        lead: 'The PRISM deck, for investors.',
        photo: 'public/img/spark-hearth-charge.webp',
        focus: '40% 50%',
    },
];

const mark = readFileSync(resolve(ROOT, 'public/brand/prism-logo-dark-mode.svg'), 'utf8').replace(/<title>.*?<\/title>/, '');

const html = ({ title, lead, photo, focus }) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Manrope; src: url(${file('node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2')}) format('woff2'); font-weight: 200 800; }
@font-face { font-family: 'Geist Mono'; src: url(${file('node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2')}) format('woff2'); font-weight: 100 900; }
html, body { margin: 0; }
.card { position: relative; width: 1200px; height: 630px; overflow: hidden; background: #061832; color: #fff; font-family: Manrope, sans-serif; }
.photo { position: absolute; top: 0; right: 0; width: 540px; height: 630px; background: url(${file(photo)}) ${focus} / cover no-repeat; }
.photo::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, #061832 0%, rgba(6, 24, 50, 0.55) 18%, rgba(6, 24, 50, 0) 42%); }
.text { position: absolute; left: 72px; top: 64px; bottom: 60px; width: 600px; display: flex; flex-direction: column; }
.brand { display: flex; align-items: center; gap: 12px; }
.brand svg { width: 46px; height: 46px; margin: -5px -2px -5px -5px; }
.brand b { font-size: 22px; font-weight: 800; letter-spacing: 0.1em; }
.brand span { font-size: 19px; color: #c2cbd7; }
h1 { margin: auto 0 0; font-size: 68px; line-height: 1.02; font-weight: 700; letter-spacing: -0.028em; }
p { margin: 22px 0 0; font-size: 28px; line-height: 1.3; color: #c2cbd7; }
.url { margin-top: auto; padding-top: 34px; font-family: 'Geist Mono', monospace; font-size: 22px; color: #8d9cae; }
.band { position: absolute; left: 0; right: 0; bottom: 0; height: 8px;
  background: linear-gradient(90deg, #6b4c9e 0%, #5f55ad 20%, #2f7ecf 38%, #86a23a 56%, #f6a21f 76%, #ec3f37 100%); }
</style></head><body><div class="card">
  <div class="photo"></div>
  <div class="text">
    <div class="brand">${mark}<b>PRISM</b><span>by Mirdyne</span></div>
    <h1>${title}</h1>
    <p>${lead}</p>
    <div class="url">mirdyne.com</div>
  </div>
  <div class="band"></div>
</div></body></html>`;

async function main() {
    mkdirSync(resolve(ROOT, 'public/og'), { recursive: true });
    // Each card is opened from a file on disk, so it may read the fonts and photographs from disk too.
    const tmp = mkdtempSync(join(tmpdir(), 'prism-og-'));
    // PW_CHROMIUM points at a Chromium already on the machine, where Playwright's own is not installed.
    const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    try {
        for (const card of CARDS) {
            const at = join(tmp, 'card.html');
            writeFileSync(at, html(card));
            await page.goto(pathToFileURL(at).href);
            await page.evaluate(() => document.fonts.ready);
            await page.waitForTimeout(300);
            await page.screenshot({ path: resolve(ROOT, card.out), type: 'jpeg', quality: 86 });
            console.log(`Saved ${card.out}`);
        }
    } finally {
        await browser.close();
        rmSync(tmp, { recursive: true, force: true });
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
