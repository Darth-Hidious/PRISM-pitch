// Renders every slide to renders/NN.png at 1920 × 1080, plus renders/phone.png (the upright-phone reader).
// Run from the repo root after `npm ci`: node briefings/transformer-core-de/render.mjs
// Set CHROME to a Chromium binary if Playwright's own browser is not installed.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const dir = dirname(fileURLToPath(import.meta.url))
const page_url = pathToFileURL(join(dir, 'index.html')).href + '?still'
mkdirSync(join(dir, 'renders'), { recursive: true })

const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined })
const stage = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
await stage.goto(page_url)
await stage.evaluate(() => document.fonts.ready)
const n = await stage.locator('section.slide').count()
for (let i = 1; i <= n; i++) {
  await stage.goto(`${page_url}#${i}`)
  await stage.evaluate(() => document.fonts.ready)
  await stage.waitForTimeout(i === 4 ? 1500 : 300) // slide 4 waits for the video frame
  await stage.screenshot({ path: join(dir, 'renders', `${String(i).padStart(2, '0')}.png`) })
}
const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
await phone.goto(page_url)
await phone.evaluate(() => document.fonts.ready)
await phone.waitForTimeout(800)
await phone.screenshot({ path: join(dir, 'renders', 'phone.png'), fullPage: true })
await browser.close()
console.log(`rendered ${n} slides and the phone view`)
