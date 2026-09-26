/**
 * In a real browser (Chromium, through Playwright), against the build in dist/: with JavaScript the plain
 * copy never shows and React draws the page as before; without it, the copy is the page. German pages
 * stay German whatever a visitor does on them. Skipped where no Chromium is installed; set PW_CHROMIUM to
 * its path to point at one.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve } from 'node:path';
import { after, before, test } from 'node:test';
import { chromium } from 'playwright';
import { ROOT, load } from './load.mjs';

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

const ENGLISH = ['/', '/platform/', '/method/', '/company/', '/news/', '/interest/', '/contact/', '/impressum/', '/privacy/'];
const PAGES = [...ENGLISH, '/404.html', ...ENGLISH.map((p) => `/de${p}`)];

const { DE } = await load('src/site/i18n-de.ts');
/** German text the dictionary keeps as it is in English: names, and words that are the same in German. */
const KEPT = new Set(Object.values(DE));
/** Text a German page shows exactly as its English twin, with words in it, that is not German from the dictionary. */
const leftInEnglish = (english, german) => [...german].filter((t) => english.has(t) && /\p{L}{3}/u.test(t) && !KEPT.has(t));

/** Records what the page's canvases write, which is not in the DOM. */
function recordCanvasText() {
    window.__drawn = new Set();
    for (const proto of [window.CanvasRenderingContext2D?.prototype, window.OffscreenCanvasRenderingContext2D?.prototype]) {
        if (!proto) continue;
        for (const name of ['fillText', 'strokeText']) {
            const draw = proto[name];
            proto[name] = function (text, ...rest) {
                window.__drawn.add(String(text).replace(/\s+/g, ' ').trim());
                return draw.call(this, text, ...rest);
            };
        }
    }
}

/**
 * Every piece of text on the page as a reader meets it: text, labels, tooltips, placeholders, the tab's
 * title and what the canvases wrote. Parts marked with a language of their own (the legal pages' two
 * versions, the language switch) are left out; they are meant to be in that language.
 */
function textsOnPage() {
    const out = new Set(window.__drawn ?? []);
    const add = (s) => {
        const t = (s ?? '').replace(/\s+/g, ' ').trim();
        if (t) out.add(t);
    };
    add(document.title);
    const walk = (node) => {
        for (const child of node.childNodes) {
            if (child.nodeType === 3) add(child.textContent);
            else if (child.nodeType === 1 && !['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(child.tagName) && !child.hasAttribute('lang')) {
                for (const a of ['alt', 'aria-label', 'title', 'placeholder', 'value']) {
                    if (a !== 'value' || child.matches('input[type="submit"], input[type="button"]')) add(child.getAttribute(a));
                }
                walk(child);
            }
        }
    };
    walk(document.body);
    out.delete('');
    return [...out];
}

/**
 * Opens a page and does what a visitor might: scrolls through it, so everything that waits to be seen
 * shows, then opens every tab, menu and fold. Returns every text met on the way.
 */
async function visit(context, path) {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(base + path, { waitUntil: 'networkidle' });
    const texts = new Set(await page.evaluate(textsOnPage));
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const step = Math.round((page.viewportSize()?.height ?? 800) / 2);
    for (let y = 0; y <= height; y += step) {
        await page.evaluate((top) => window.scrollTo(0, top), y);
        await page.waitForTimeout(50);
        for (const t of await page.evaluate(textsOnPage)) texts.add(t);
    }
    const controls = await page.locator('[role="tab"], button[aria-expanded], [aria-haspopup], summary').all();
    for (const control of controls) {
        await control.evaluate((el) => {
            el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
            el.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
            // Links would leave the page; hovering and focusing is what opens their menus.
            if (!el.closest('a[href]')) el.click();
        });
        await page.waitForTimeout(80);
        for (const t of await page.evaluate(textsOnPage)) texts.add(t);
    }
    const lang = await page.evaluate(() => document.documentElement.lang);
    await page.close();
    return { texts, errors, lang };
}

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

test('the language switch leads to the same page in the other language, and back', { skip }, async () => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (const path of ['/', '/platform/', '/impressum/']) {
        await page.goto(base + path, { waitUntil: 'networkidle' });
        await page.locator('a[hreflang="de"] >> visible=true').first().click();
        await page.waitForURL(`${base}/de${path}`);
        await page.waitForLoadState('networkidle');
        assert.equal(await page.evaluate(() => document.documentElement.lang), 'de', `/de${path}`);
        assert.ok((await page.locator('#root nav a', { hasText: 'Plattform' }).count()) > 0, `/de${path}: the menu is not German`);
        await page.locator('a[hreflang="en"] >> visible=true').first().click();
        await page.waitForURL(base + path);
        await page.waitForLoadState('networkidle');
        assert.equal(await page.evaluate(() => document.documentElement.lang), 'en', path);
    }
    await context.close();
});

for (const [name, viewport] of [
    ['desktop', { width: 1440, height: 900 }],
    ['phone', { width: 390, height: 844 }],
]) {
    test(`German pages stay German after scrolling and opening everything (${name})`, { skip }, async () => {
        const context = await browser.newContext({ viewport, reducedMotion: 'reduce', isMobile: name === 'phone', hasTouch: name === 'phone' });
        await context.addInitScript(recordCanvasText);
        for (const path of ENGLISH) {
            const en = await visit(context, path);
            const de = await visit(context, `/de${path}`);
            assert.equal(de.lang, 'de', `/de${path}`);
            assert.deepEqual(de.errors, [], `/de${path}: page errors`);
            assert.deepEqual(leftInEnglish(en.texts, de.texts), [], `/de${path} (${name}): the same as on ${path}`);
        }
        await context.close();
    });
}

test('the German form: its own checks, every answer from the server, and the thank-you, all in German', { skip }, async () => {
    // The server's answers, from the form's real function (api/interest.ts). Without credentials here,
    // it can neither store nor email, so a complete submission gets its "could not save" answer.
    delete process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.SMTP_PASS;
    const { POST } = await load('api/interest.ts');
    const good = { name: 'Ada Lovelace', email: 'ada@example.com', organisation: 'Analytical Engines', role: '', areas: ['material'], message: '', consent: true, website: '', elapsed: 5000, from: '/interest/' };
    const ask = async (body, { origin = 'https://www.mirdyne.com', raw } = {}) => {
        const res = await POST(
            new Request('https://www.mirdyne.com/api/interest', {
                method: 'POST',
                headers: { origin, host: 'www.mirdyne.com', 'content-type': 'application/json' },
                body: raw ?? JSON.stringify(body),
            }),
        );
        return { status: res.status, body: await res.text() };
    };
    const answers = [
        await ask({ ...good, name: '' }),
        await ask({ ...good, name: 'A'.repeat(121) }),
        await ask({ ...good, email: 'ada' }),
        await ask({ ...good, organisation: '' }),
        await ask({ ...good, organisation: 'O'.repeat(161) }),
        await ask({ ...good, role: 'R'.repeat(121) }),
        await ask({ ...good, areas: [] }),
        await ask({ ...good, message: 'M'.repeat(3001) }),
        await ask({ ...good, consent: false }),
        await ask(good, { origin: 'https://example.com' }),
        await ask(null, { raw: JSON.stringify({ ...good, message: 'x'.repeat(20001) }) }),
        await ask(good),
    ];
    const messages = answers.map((a) => JSON.parse(a.body).error);
    assert.equal(new Set(messages).size, 12, `the server's messages: ${messages.join(' | ')}`);

    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const run = async (path) => {
        const page = await context.newPage();
        let answer = null;
        await page.route('**/api/interest', (route) => answer(route));
        await page.goto(base + path, { waitUntil: 'networkidle' });
        const texts = new Set();
        const shown = [];
        const note = async () => {
            for (const t of await page.evaluate(textsOnPage)) texts.add(t);
        };
        /** Sends the form and waits for its answer to show. */
        const send = async () => {
            const answered = Promise.race(
                ['requestfinished', 'requestfailed'].map((event) =>
                    page.waitForEvent(event, (r) => r.url().endsWith('/api/interest')).catch(() => null),
                ),
            );
            await page.locator('form button[type="submit"]').click();
            await answered;
            await page.waitForFunction(() => !document.querySelector('form [aria-busy="true"]'));
            await page.waitForTimeout(50);
            await note();
        };
        // The form's own checks, on an empty form: nothing is sent.
        await page.locator('form button[type="submit"]').click();
        await page.waitForTimeout(150);
        await note();
        const own = await page.locator('.field__error').allTextContents();
        // Filled in, then each of the server's answers.
        await page.fill('#f-name', good.name);
        await page.fill('#f-email', good.email);
        await page.fill('#f-organisation', good.organisation);
        for (const box of ['input[name="areas"] >> nth=0', 'input[name="consent"]']) {
            await page.locator(box).evaluate((el) => el.click());
            assert.ok(await page.locator(box).isChecked(), `${path}: ${box} is not ticked`);
        }
        for (const a of answers) {
            answer = (route) => route.fulfill({ status: a.status, contentType: 'application/json', body: a.body });
            await send();
            shown.push(await page.locator('main').innerText());
        }
        // No answer that can be read, and no answer at all.
        answer = (route) => route.fulfill({ status: 502, contentType: 'text/html', body: '<h1>Bad gateway</h1>' });
        await send();
        answer = (route) => route.abort('connectionrefused');
        await send();
        // And the thank-you.
        answer = (route) => route.fulfill({ status: 201, contentType: 'application/json', body: '{"ok":true}' });
        await send();
        await page.close();
        return { texts, own, shown };
    };
    const en = await run('/interest/');
    const de = await run('/de/interest/');
    await context.close();

    assert.ok(de.own.length >= 4, `the form's own checks: ${de.own.join(' | ')}`);
    for (const m of de.own) assert.ok(KEPT.has(m.trim()), `not German from the dictionary: ${m}`);
    messages.forEach((m, i) => {
        assert.ok(DE[m], `no German for the server's ${JSON.stringify(m)}`);
        assert.ok(de.shown[i].includes(DE[m]), `/de/interest/ does not show ${JSON.stringify(DE[m])}`);
        assert.ok(!de.shown[i].includes(m), `/de/interest/ shows the English ${JSON.stringify(m)}`);
        assert.ok(en.shown[i].includes(m), `/interest/ does not show ${JSON.stringify(m)}`);
    });
    assert.deepEqual(leftInEnglish(en.texts, de.texts), [], '/de/interest/: the same as on /interest/');
});
