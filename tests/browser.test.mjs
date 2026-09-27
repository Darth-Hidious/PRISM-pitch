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
            // As on Vercel: any missing address gets 404.html, with status 404.
            res.writeHead(404, { 'Content-Type': TYPES['.html'] }).end(readFileSync(resolve(DIST, '404.html')));
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
    // Every tab, menu and fold, including those that only appear once another is open. Done in the page,
    // on the elements themselves: opening one can redraw the rest.
    const opened = await page.evaluate(async (collect) => {
        const textsNow = new Function(`return (${collect})()`);
        const out = new Set();
        const done = new Set();
        for (let round = 0; round < 3; round++) {
            const controls = [...document.querySelectorAll('[role="tab"], button[aria-expanded], [aria-haspopup], summary')].filter((el) => !done.has(el));
            if (!controls.length) break;
            for (const el of controls) {
                done.add(el);
                if (!el.isConnected) continue;
                el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
                el.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
                // Links would leave the page; hovering and focusing is what opens their menus.
                if (!el.closest('a[href]')) el.click();
                await new Promise((r) => setTimeout(r, 80));
                for (const t of textsNow()) out.add(t);
            }
        }
        return [...out];
    }, textsOnPage.toString());
    for (const t of opened) texts.add(t);
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
    const ask = async (body, { origin = 'https://prism.mirdyne.com', raw } = {}) => {
        const res = await POST(
            new Request('https://prism.mirdyne.com/api/interest', {
                method: 'POST',
                headers: { origin, host: 'prism.mirdyne.com', 'content-type': 'application/json' },
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
    // What the visitor typed comes back in the thank-you, the same in any language.
    const typed = new Set([good.name, good.name.split(' ')[0], good.email, good.organisation]);
    assert.deepEqual(
        leftInEnglish(en.texts, de.texts).filter((t) => !typed.has(t)),
        [],
        '/de/interest/: the same as on /interest/',
    );
});

test('the 404 page is German under /de/ and English anywhere else', { skip }, async () => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    await context.addInitScript(recordCanvasText);
    for (const [path, lang, h1, home] of [
        ['/de/no-such-page/', 'de', 'Seite nicht gefunden.', '/de/'],
        ['/de/company/no-such-page', 'de', 'Seite nicht gefunden.', '/de/'],
        ['/no-such-page/', 'en', 'Page not found.', '/'],
        ['/design/', 'en', 'Page not found.', '/'],
    ]) {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        const res = await page.goto(base + path, { waitUntil: 'networkidle' });
        assert.equal(res.status(), 404, path);
        await page.waitForFunction(() => !document.querySelector('[data-prerender]'));
        const state = await page.evaluate(() => ({
            lang: document.documentElement.lang,
            h1: document.querySelector('#root main h1')?.textContent.trim(),
            title: document.title,
            links: [...document.querySelectorAll('#root main .legal__list a')].map((a) => a.getAttribute('href')),
        }));
        assert.equal(state.lang, lang, path);
        assert.equal(state.h1, h1, path);
        assert.equal(state.links[0], home, `${path}: the first link goes home in the same language`);
        assert.ok(state.links.every((href) => href.startsWith(lang === 'de' ? '/de/' : '/') && (lang === 'de' || !href.startsWith('/de/'))), `${path}: ${state.links}`);
        if (lang === 'de') assert.equal(state.title, 'Seite nicht gefunden | PRISM by Mirdyne');
        assert.deepEqual(errors, [], `${path}: page errors`);
        await page.close();
    }
    // Nothing on the German 404 is left in English.
    const en = await visit(context, '/no-such-page/');
    const de = await visit(context, '/de/no-such-page/');
    assert.deepEqual(leftInEnglish(en.texts, de.texts), [], '/de/no-such-page/: the same as on /no-such-page/');
    await context.close();
});

test('the supply-chain explorer: its controls change what it shows, and what it shows is the mathematics', { skip }, async () => {
    const H = await load('src/site/hawkes.ts');
    const M = await load('src/site/supply-model.ts');
    for (const [path, locale, day] of [
        ['/platform/', 'en-GB', 'Day'],
        ['/de/platform/', 'de-DE', 'Tag'],
    ]) {
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        await page.goto(base + path, { waitUntil: 'networkidle' });
        await page.locator('.shock__stage').scrollIntoViewIfNeeded();
        // Each programme's chance of a hit, as the page shows it, is the exact one for the setting.
        const chancesAre = async (source, kappa) => {
            const A = H.scale(M.BASE, kappa);
            const want = M.PROGRAMMES.map((p) =>
                H.hitProbability(A, source.i, p.i).toLocaleString(locale, { style: 'percent', maximumSignificantDigits: 2 }),
            );
            await page.waitForFunction(
                (w) => JSON.stringify([...document.querySelectorAll('.shock__odds li strong')].map((e) => e.textContent)) === JSON.stringify(w),
                want,
                { timeout: 5000 },
            );
        };
        await chancesAre(M.SUPPLIERS[0], 0.85);
        await page.locator('input[value="refinery"]').check();
        await chancesAre(M.SUPPLIERS[2], 0.85);
        // At the bottom of the scale the chances are below 1 %, and still shown, not rounded to 0 %.
        await page.locator('.shock__coupling input').fill('0.3');
        await chancesAre(M.SUPPLIERS[2], 0.3);
        assert.doesNotMatch((await page.locator('.shock__odds').textContent()).replace(/\s+/g, ' '), /(^|[^\d.,])0 ?%/);
        const worst = async () => Number((await page.locator('.shock__facts dd strong').nth(1).textContent()).replace(/\D/g, ''));
        const weak = await worst();
        await page.locator('.shock__coupling input').fill('0.95');
        await chancesAre(M.SUPPLIERS[2], 0.95);
        // Stronger knock-on effects: the worst 1 in 20 grows many times over.
        assert.ok((await worst()) >= 10 * weak, `the worst 1 in 20 went from ${weak} to only ${await worst()}`);
        // Cascades play: the clock runs in the page's language, events light their nodes, and effects are
        // reached by a pulse along the link from their cause.
        await page.waitForFunction(
            () => document.getAnimations().some((a) => a.effect?.target?.classList?.contains('shock__pulse')),
            null,
            { timeout: 20000 },
        );
        await page.waitForFunction(() => document.querySelectorAll('.shock__node.was-hit').length > 0, null, { timeout: 5000 });
        assert.match(await page.locator('.shock__clock').textContent(), new RegExp(`^${day} \\d+ · \\d+ \\S+$`));
        assert.deepEqual(errors, [], `${path}: page errors`);
        await context.close();
    }
});

test('the supply-chain explorer without motion: one whole cascade at once, nothing moving', { skip }, async () => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(`${base}/platform/`, { waitUntil: 'networkidle' });
    await page.locator('.shock__stage').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const state = await page.evaluate(() => ({
        lit: document.querySelectorAll('.shock__node.was-hit').length,
        moving: document.getAnimations().filter((a) => a.effect?.target?.closest?.('.shock')).length,
        clock: document.querySelector('.shock__clock').textContent,
    }));
    assert.ok(state.lit >= 1, 'the cascade is not shown');
    assert.equal(state.moving, 0, 'something moves');
    assert.match(state.clock, /^Day \d+ · \d+ events?$/);
    // Another supplier, another cascade, shown whole.
    await page.locator('input[value="gas"]').check();
    await page.waitForFunction(() => document.querySelector('.shock__node.is-source .shock__dot') && document.querySelector('.shock__node.is-source').classList.contains('was-hit'));
    await context.close();
});

test('the drawn step of the making route moves only on screen, and stands still without motion', { skip }, async () => {
    for (const reducedMotion of ['no-preference', 'reduce']) {
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion });
        const page = await context.newPage();
        await page.goto(`${base}/`, { waitUntil: 'networkidle' });
        const state = () =>
            page.evaluate(() => {
                // Only the drawn making step (DED) moves; the drawn design steps stand still.
                const svgs = [...document.querySelectorAll('.made__grid svg.route')].filter((s) => s.querySelector('animate, animateTransform') || s.getAttribute('aria-label')?.includes('nozzle'));
                return { count: svgs.length, paused: svgs.map((s) => s.animationsPaused()), animations: document.querySelectorAll('.route animate, .route animateTransform').length };
            });
        const away = await state();
        assert.equal(away.count, 1, 'one moving drawn step');
        if (reducedMotion === 'reduce') {
            assert.equal(away.animations, 0, 'the drawing animates without motion');
        } else {
            assert.ok(away.animations > 0, 'the drawing does not animate');
            assert.deepEqual(away.paused, [true], 'the drawing moves while off screen');
            const ded = page.locator('.made__grid svg.route[aria-label*="nozzle"]');
            await ded.scrollIntoViewIfNeeded();
            await page.waitForFunction(() => !document.querySelector('.made__grid svg.route[aria-label*="nozzle"]').animationsPaused());
        }
        await context.close();
    }
});

test('how PRISM chooses: it plays by itself on a wide screen, and a picked step stays', { skip }, async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${base}/method/`, { waitUntil: 'networkidle' });
    await page.locator('.choose__body').scrollIntoViewIfNeeded();
    const on = () => page.evaluate(() => [...document.querySelectorAll('.choose__steps li')].findIndex((li) => li.classList.contains('is-on')));
    assert.equal(await on(), 0);
    // The next step comes by itself, and the scene adds its layer.
    await page.waitForFunction(() => document.querySelector('.choose__steps li:nth-child(2)').classList.contains('is-on'), null, { timeout: 8000 });
    assert.ok(await page.evaluate(() => document.querySelector('.choose__svg').classList.contains('is-scored')), 'the models have not scored the recipes');
    // Picking a step shows it, with every layer before it, and stops the play.
    await page.locator('.choose__pick').nth(4).click();
    const layers = () => page.evaluate(() => [...document.querySelector('.choose__svg').classList].filter((c) => c.startsWith('is-') || c.startsWith('has-')).sort());
    assert.deepEqual(await layers(), ['has-window', 'is-checked', 'is-filtered', 'is-moving', 'is-scored']);
    await page.waitForTimeout(5500);
    assert.equal(await on(), 4, 'the play went on after a pick');
    await context.close();
});

test('how PRISM chooses without motion: every step at once, standing still', { skip }, async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(`${base}/method/`, { waitUntil: 'networkidle' });
    await page.locator('.choose__body').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const state = await page.evaluate(() => ({
        classes: [...document.querySelector('.choose__svg').classList],
        lit: document.querySelectorAll('.choose__steps li.is-on').length,
        moving: document.getAnimations().filter((a) => a.effect?.target?.closest?.('.choose')).length,
        sticky: getComputedStyle(document.querySelector('.choose__figure')).position,
    }));
    for (const c of ['is-scored', 'is-checked', 'is-filtered', 'has-window', 'is-learned']) assert.ok(state.classes.includes(c), `no ${c}`);
    assert.ok(!state.classes.includes('is-moving'), 'the recipes fly in');
    assert.equal(state.lit, 6, 'every step is shown');
    assert.equal(state.moving, 0, 'something moves');
    assert.equal(state.sticky, 'static', 'the scene holds still on screen');
    await context.close();
});

test('how PRISM chooses on a phone: the scene stays on screen, and scrolling moves through the steps', { skip }, async () => {
    for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
        const context = await browser.newContext({ viewport, isMobile: true, hasTouch: true });
        const page = await context.newPage();
        await page.goto(`${base}/method/`, { waitUntil: 'networkidle' });
        const top = await page.evaluate(() => document.querySelector('.choose__body').getBoundingClientRect().top + scrollY);
        const seen = new Set();
        for (let k = 0; k <= 30; k++) {
            await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), top - 40 + k * viewport.height * 0.15);
            await page.waitForTimeout(80);
            const s = await page.evaluate(() => {
                const f = document.querySelector('.choose__figure').getBoundingClientRect();
                const on = [...document.querySelectorAll('.choose__steps li')].findIndex((li) => li.classList.contains('is-on'));
                return { on, visible: f.bottom > 0 && f.top < innerHeight };
            });
            if (s.on >= 0) seen.add(s.on);
            if (s.on > 0 && s.on < 5) assert.ok(s.visible, `step ${s.on + 1} shows with the scene off screen`);
        }
        assert.deepEqual([...seen].sort(), [0, 1, 2, 3, 4, 5], `${viewport.width}x${viewport.height}: steps seen ${[...seen]}`);
        await context.close();
    }
});

/** Opens the deck on the market momentum slide. */
async function momentum(context) {
    const page = await context.newPage();
    await page.goto(`${base}/deck/`, { waitUntil: 'networkidle' });
    const n = await page.evaluate(() => [...document.querySelectorAll('.deck-slide')].findIndex((s) => s.querySelector('.d-globe')) + 1);
    assert.ok(n > 0, 'no slide with the globe');
    await page.close();
    const slide = await context.newPage();
    await slide.goto(`${base}/deck/#${n}`, { waitUntil: 'networkidle' });
    return slide;
}

const pinsNow = (page) =>
    page.evaluate(() => [...document.querySelectorAll('.d-globe__pin')].map((p) => ({ name: p.textContent, show: p.dataset.show, at: p.style.transform })));

test('the market momentum globe turns when its slide arrives, and each company comes round', { skip }, async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await momentum(context);
    const early = await pinsNow(page);
    assert.equal(early.length, 6, 'six places');
    // It starts over the Pacific: California is round, Europe is not yet.
    assert.equal(early.find((p) => p.name.includes('Periodic Labs')).show, 'true');
    assert.equal(early.find((p) => p.name.includes('Wrocław')).show, 'false', 'Europe shows before the Earth has turned');
    await page.waitForFunction(() => [...document.querySelectorAll('.d-globe__pin')].every((p) => p.dataset.show === 'true'), null, { timeout: 6000 });
    // After the turn it keeps moving a little.
    const a = await pinsNow(page);
    await page.waitForTimeout(700);
    const b = await pinsNow(page);
    assert.notDeepEqual(a.map((p) => p.at), b.map((p) => p.at), 'the Earth stopped');
    assert.equal(await page.evaluate(() => !!document.querySelector('.d-globe__still')), false, 'the picture shows where WebGL works');
    await context.close();
});

test('the market momentum globe without motion, or without WebGL: every company at once, standing still', { skip }, async () => {
    for (const [reducedMotion, noGL] of [['reduce', false], ['no-preference', true]]) {
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion });
        if (noGL) {
            await context.addInitScript(() => {
                const get = HTMLCanvasElement.prototype.getContext;
                HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
                    return type === 'webgl2' ? null : get.call(this, type, ...rest);
                };
            });
        }
        const page = await momentum(context);
        await page.waitForTimeout(400);
        const a = await pinsNow(page);
        assert.ok(a.every((p) => p.show === 'true'), `${a.filter((p) => p.show !== 'true').map((p) => p.name)} hidden`);
        await page.waitForTimeout(700);
        assert.deepEqual(await pinsNow(page), a, 'the Earth moves');
        const still = await page.evaluate(() => document.querySelector('.d-globe__still')?.complete ?? false);
        assert.equal(still, noGL, noGL ? 'no picture without WebGL' : 'the picture shows where WebGL works');
        await context.close();
    }
});

test('the market momentum globe on phones: every tag on screen, nothing to scroll sideways', { skip }, async () => {
    for (const viewport of [{ width: 360, height: 740 }, { width: 390, height: 844 }]) {
        const context = await browser.newContext({ viewport, isMobile: true, hasTouch: true });
        const page = await context.newPage();
        await page.goto(`${base}/deck/`, { waitUntil: 'networkidle' });
        await page.locator('.d-globe__box').scrollIntoViewIfNeeded();
        await page.waitForFunction(() => [...document.querySelectorAll('.d-globe__pin')].every((p) => p.dataset.show === 'true'), null, { timeout: 8000 });
        const out = await page.evaluate(() =>
            [...document.querySelectorAll('.d-globe__tag')]
                .filter((t) => {
                    const r = t.getBoundingClientRect();
                    return r.left < 0 || r.right > document.documentElement.clientWidth;
                })
                .map((t) => t.textContent),
        );
        assert.deepEqual(out, [], `${viewport.width}px: tags off screen`);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `${viewport.width}px: sideways scroll`);
        await context.close();
    }
});

test('the market slide: the dots narrow step by step when it arrives, and show every step at once without motion', { skip }, async () => {
    for (const reducedMotion of ['no-preference', 'reduce']) {
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion });
        const first = await context.newPage();
        await first.goto(`${base}/deck/`, { waitUntil: 'networkidle' });
        const n = await first.evaluate(() => [...document.querySelectorAll('.deck-slide')].findIndex((s) => s.querySelector('.d-funnel')) + 1);
        await first.close();
        const page = await context.newPage();
        await page.goto(`${base}/deck/#${n}`, { waitUntil: 'networkidle' });
        const lit = () => page.evaluate(() => document.querySelectorAll('.d-funnel__steps li[data-on="true"]').length);
        if (reducedMotion === 'reduce') {
            assert.equal(await lit(), 4, 'every step at once');
        } else {
            assert.ok((await lit()) < 4, 'the steps did not wait for the slide');
            await page.waitForFunction(() => document.querySelectorAll('.d-funnel__steps li[data-on="true"]').length === 4, null, { timeout: 8000 });
        }
        const dots = await page.evaluate(() => ['k0', 'k1', 'k2'].map((k) => document.querySelectorAll(`.d-funnel__dots circle.${k}`).length));
        assert.deepEqual(dots, [472 - 189, 189 - 80, 80], 'the dots do not add up');
        await context.close();
    }
});

test('if the page’s script cannot load, or hangs, the plain copy shows instead of a blank page', { skip }, async () => {
    const context = await browser.newContext();
    for (const [handle, within] of [
        [(route) => route.abort(), 3000],
        // A script that never arrives: the copy shows after the snippet's wait (FALLBACK_MS, 8 s).
        [() => {}, 12000],
    ]) {
        const page = await context.newPage();
        await page.route('**/assets/*.js', handle);
        // Not 'domcontentloaded': a module script that never arrives holds that back for good.
        await page.goto(`${base}/platform/`, { waitUntil: 'commit' });
        await page.waitForFunction(
            () => {
                const copy = document.querySelector('[data-prerender]');
                return copy && getComputedStyle(copy).display !== 'none' && copy.querySelector('h1').getBoundingClientRect().height > 0;
            },
            null,
            { timeout: within },
        );
        await page.close();
    }
    await context.close();
});
