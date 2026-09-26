/**
 * In a real browser (Chromium, through Playwright), against the build in dist/: with JavaScript the plain
 * copy never shows and React draws the page as before; without it, the copy is the page. Skipped where no
 * Chromium is installed; set PW_CHROMIUM to its path to point at one.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve } from 'node:path';
import { after, before, test } from 'node:test';
import { chromium } from 'playwright';
import { ROOT } from './load.mjs';

const DIST = resolve(ROOT, 'dist');
const CHROMIUM = process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const skip = !existsSync(CHROMIUM) && `no Chromium at ${CHROMIUM}`;

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
let server;
let base;
let browser;

before(async () => {
    if (skip) return;
    // A static server for dist/: /company/ serves company/index.html, as on Vercel.
    server = createServer((req, res) => {
        let file = resolve(DIST, decodeURIComponent(new URL(req.url, 'http://x').pathname).slice(1));
        if (existsSync(file) && statSync(file).isDirectory()) file = resolve(file, 'index.html');
        if (!file.startsWith(DIST) || !existsSync(file)) {
            res.writeHead(404).end();
            return;
        }
        res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
    });
    await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
    base = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
    await browser?.close();
    server?.close();
});

const PAGES = ['/', '/platform/', '/method/', '/company/', '/news/', '/interest/', '/contact/', '/impressum/', '/privacy/', '/404.html'];

test('with JavaScript: the copy is hidden from the first paint, then gone, and React draws the page', { skip }, async () => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    for (const path of PAGES) {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        // The copy's display at the moment the parser inserts it, long before the page's script runs.
        await page.addInitScript(() => {
            new MutationObserver((records, observer) => {
                for (const r of records) {
                    for (const node of r.addedNodes) {
                        if (node.nodeType === 1 && node.hasAttribute('data-prerender')) {
                            window.__copyDisplay = getComputedStyle(node).display;
                            observer.disconnect();
                        }
                    }
                }
            }).observe(document, { childList: true, subtree: true });
        });
        await page.goto(base + path, { waitUntil: 'networkidle' });
        const state = await page.evaluate(() => ({
            display: window.__copyDisplay,
            left: document.querySelectorAll('[data-prerender]').length,
            h1: document.querySelectorAll('#root main h1').length,
            ids: [...document.querySelectorAll('[id]')].map((e) => e.id),
        }));
        assert.equal(state.display, 'none', `${path}: the copy was not hidden when it arrived (${state.display})`);
        assert.equal(state.left, 0, `${path}: the copy is still in the page`);
        assert.equal(state.h1, 1, `${path}: React did not draw the page`);
        assert.equal(new Set(state.ids).size, state.ids.length, `${path}: duplicate ids`);
        assert.deepEqual(errors, [], `${path}: page errors`);
        await page.close();
    }
    await context.close();
});

test('without JavaScript: the copy is the page, with its title and text on screen', { skip }, async () => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    for (const path of PAGES) {
        const page = await context.newPage();
        await page.goto(base + path, { waitUntil: 'load' });
        const state = await page.evaluate(() => {
            const h1 = document.querySelector('[data-prerender] h1');
            const r = h1?.getBoundingClientRect();
            return {
                display: getComputedStyle(document.querySelector('[data-prerender]')).display,
                h1: h1 ? { text: h1.textContent.trim(), w: r.width, h: r.height } : null,
                chars: document.body.innerText.replace(/\s+/g, ' ').length,
            };
        });
        assert.notEqual(state.display, 'none', `${path}: the copy is hidden without JavaScript`);
        assert.ok(state.h1 && state.h1.w > 0 && state.h1.h > 0, `${path}: no visible <h1>`);
        assert.ok(state.chars >= 500, `${path}: only ${state.chars} characters on screen`);
        await page.close();
    }
    await context.close();
});
