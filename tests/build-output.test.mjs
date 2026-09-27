/**
 * The built site (dist/, from `npm run build`), read the way an agent reads it: raw HTML with no
 * JavaScript, the Markdown copies, the structured data and the machine-readable files.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { DOMParser, parseHTML } from 'linkedom';
import { HEAD_SNIPPET, SITE, untranslated } from '../scripts/prerender-lib.mjs';
import { ROOT, load } from './load.mjs';

const DIST = resolve(ROOT, 'dist');
if (!existsSync(resolve(DIST, 'index.html'))) throw new Error('No build in dist/: run `npm run build` first.');

const { MARKDOWN_PAGES } = await load('server/negotiate.ts');
const { DE } = await load('src/site/i18n-de.ts');
const PAGES = [...MARKDOWN_PAGES.map((path) => ({ path, file: `${path.slice(1)}index.html` })), { path: null, file: '404.html' }];
/** The English pages; each has a German twin at /de/…. */
const ENGLISH = MARKDOWN_PAGES.filter((p) => !p.startsWith('/de/'));
const fileOf = (path) => `${path.slice(1)}index.html`;
/** An attribute by its name in any case: React writes some in camel case (hrefLang), which HTML reads the same. */
const attr = (el, name) => [...el.attributes].find((a) => a.name.toLowerCase() === name)?.value ?? null;
/** German text the dictionary keeps as it is in English: names, and words that are the same in German. */
const KEPT = new Set(Object.values(DE));

const read = (file) => readFileSync(resolve(DIST, file), 'utf8');
const text = (el) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
const page = (file) => {
    const html = read(file);
    const { document } = parseHTML(html);
    return { html, document, copy: document.querySelector('#root > [data-prerender]') };
};
/** The dist file an address on the site is served from, or null. */
const fileFor = (url) => {
    const { pathname } = new URL(url);
    const f = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
    return existsSync(resolve(DIST, f.slice(1))) ? f : null;
};

test('every page carries its content in the raw HTML', () => {
    for (const { file } of PAGES) {
        const { copy } = page(file);
        assert.ok(copy, `${file}: no [data-prerender] copy in #root`);
        assert.ok(text(copy).length >= 500, `${file}: only ${text(copy).length} characters of text`);
        assert.equal(copy.querySelectorAll('h1').length, 1, `${file}: needs exactly one <h1>`);
    }
});

test('headings go down one level at a time, starting with the <h1>', () => {
    for (const { file } of PAGES) {
        const levels = [...page(file).copy.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((h) => Number(h.tagName[1]));
        assert.equal(levels[0], 1, `${file}: the first heading is h${levels[0]}`);
        levels.forEach((l, i) => i && assert.ok(l <= levels[i - 1] + 1, `${file}: h${levels[i - 1]} is followed by h${l}`));
    }
});

test('the plain copy holds nothing that needs JavaScript, and changes nothing for the browser', () => {
    for (const { file } of PAGES) {
        const { html, copy } = page(file);
        for (const sel of ['form', 'script', 'button', 'canvas', 'link', '[aria-hidden="true"]', 'svg']) {
            assert.equal(copy.querySelectorAll(sel).length, 0, `${file}: ${sel} in the plain copy`);
        }
        for (const img of copy.querySelectorAll('img')) assert.equal(img.getAttribute('loading'), 'lazy', `${file}: eager <img>`);
        // Hidden from the first paint wherever the page's own script runs.
        assert.ok(html.includes(HEAD_SNIPPET), `${file}: the snippet that hides the copy is missing`);
        assert.ok(html.indexOf(HEAD_SNIPPET) < html.indexOf('</head>'), `${file}: the snippet must be in <head>`);
    }
});

test('each page links its Markdown copy, and the copy reads as Markdown', () => {
    const written = readdirSync(DIST, { recursive: true }).filter((f) => String(f).endsWith('.md'));
    assert.equal(written.length, MARKDOWN_PAGES.length, `Markdown files: ${written.join(', ')}`);
    for (const { path, file } of PAGES) {
        const { document } = page(file);
        const alt = document.querySelector('link[rel="alternate"][type="text/markdown"]');
        if (!path) {
            assert.equal(alt, null, '404.html has no Markdown copy of its own');
            continue;
        }
        assert.equal(alt?.getAttribute('href'), `${path}index.html.md`, path);
        const md = read(`${path.slice(1)}index.html.md`);
        assert.match(md, /^# \S/, `${path}: the Markdown must open with its title`);
        assert.equal((md.match(/^# /gm) ?? []).length, 1, `${path}: one title`);
        assert.doesNotMatch(md, /\]\(\/(?!\/)/, `${path}: relative link in the Markdown`);
        assert.doesNotMatch(md, /<\/?(div|span|p|a|section|img|svg)\b/i, `${path}: HTML left in the Markdown`);
        const here = path.startsWith('/de/') ? 'Diese Seite im Web' : 'This page on the web';
        assert.ok(md.includes(`${here}: <${SITE}${path}>`), `${path}: footer`);
        const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
        assert.equal(canonical, `${SITE}${path}`, `${path}: canonical`);
    }
});

test('the static copy says what the page says: the figures that count up in the browser', () => {
    const md = read('index.html.md');
    // 126 ways to pick 5 of 9 metals × 3,764,376 ways to mix 5 in whole percent.
    assert.ok(md.includes(`**${(126 * 3764376).toLocaleString('en-GB')}** possible alloys`), 'the home page’s alloy count');
    assert.doesNotMatch(md, /\*\*1\*\* possible alloys/);
    // The German page writes the number the German way.
    assert.ok(read('de/index.html.md').includes(`**${(126 * 3764376).toLocaleString('de-DE')}**`), 'the German home page’s alloy count');
});

test('JSON-LD: Organization with contact point and postal address, matching the Impressum', () => {
    const graphFor = (file) => {
        const scripts = page(file).document.querySelectorAll('script[type="application/ld+json"]');
        assert.equal(scripts.length, 1, `${file}: one JSON-LD block`);
        const data = JSON.parse(scripts[0].textContent);
        assert.equal(data['@context'], 'https://schema.org');
        return data['@graph'];
    };
    const impressum = text(page('impressum/index.html').copy);
    for (const [file, pageType] of [
        ['index.html', null],
        ['company/index.html', 'AboutPage'],
        ['contact/index.html', 'ContactPage'],
        ['de/index.html', null],
        ['de/company/index.html', 'AboutPage'],
        ['de/contact/index.html', 'ContactPage'],
    ]) {
        const graph = graphFor(file);
        const org = graph.find((n) => n['@type'] === 'Organization');
        assert.ok(org, `${file}: Organization`);
        assert.equal(org['@id'], `${SITE}/#organization`);
        assert.equal(org.url, `${SITE}/`);
        assert.ok(fileFor(org.logo), `${file}: the logo ${org.logo} is not in the build`);
        assert.ok(impressum.includes(org.legalName), 'legal name as in the Impressum');
        const { address } = org;
        assert.equal(address['@type'], 'PostalAddress');
        for (const k of ['streetAddress', 'postalCode', 'addressLocality']) {
            assert.ok(address[k] && impressum.includes(address[k]), `${file}: ${k} "${address[k]}" is not in the Impressum`);
        }
        assert.equal(address.addressCountry, 'DE');
        assert.ok(Array.isArray(org.contactPoint) && org.contactPoint.length > 0);
        for (const cp of org.contactPoint) {
            assert.equal(cp['@type'], 'ContactPoint');
            assert.ok(cp.contactType, 'contactType');
            assert.ok(cp.email || cp.telephone, 'email or telephone');
            if (cp.email) assert.ok(impressum.includes(cp.email), 'contact email as in the Impressum');
        }
        // The description is in the page's language.
        const english = graphFor(file.replace(/^de\//, '')).find((n) => n['@type'] === 'Organization').description;
        if (file.startsWith('de/')) assert.notEqual(org.description, english, `${file}: the Organization's description is the English one`);
        const site = graph.find((n) => n['@type'] === 'WebSite');
        assert.equal(site?.publisher?.['@id'], org['@id'], `${file}: WebSite published by the Organization`);
        if (pageType) {
            const wp = graph.find((n) => n['@type'] === pageType);
            assert.ok(wp, `${file}: ${pageType}`);
            assert.equal(wp.about['@id'], org['@id']);
            const german = file.startsWith('de/');
            assert.equal(wp.url, `${SITE}/${file.replace(/index\.html$/, '')}`, `${file}: the page's own address`);
            assert.equal(wp.inLanguage, german ? 'de-DE' : 'en-GB', `${file}: inLanguage`);
        }
    }
    for (const f of ['platform/index.html', 'method/index.html', 'news/index.html', '404.html', 'de/platform/index.html', 'de/method/index.html', 'de/news/index.html']) {
        assert.equal(page(f).document.querySelectorAll('script[type="application/ld+json"]').length, 0, f);
    }
});

test('trust pages: About (/company/), Contact and Privacy each hold at least 500 characters of their own', () => {
    for (const f of ['company/index.html', 'contact/index.html', 'privacy/index.html', 'de/company/index.html', 'de/contact/index.html', 'de/privacy/index.html']) {
        const main = page(f).copy.querySelector('main');
        assert.ok(text(main).length >= 500, `${f}: ${text(main).length} characters in <main>`);
    }
    for (const f of ['contact/index.html', 'de/contact/index.html']) {
        assert.match(text(page(f).copy.querySelector('main')), /info@mirdyne\.com/, f);
    }
});

test('404.html: not for indexing, and it points to the site map and llms.txt', () => {
    const { document, copy } = page('404.html');
    // One file for every missing address: the browser draws it in German under /de/ (boot.ts).
    assert.ok(document.documentElement.hasAttribute('data-lang-from-path'), '404.html takes its language from the address');
    assert.equal(document.querySelector('meta[name="robots"]')?.getAttribute('content'), 'noindex');
    assert.equal(document.querySelector('link[rel="canonical"]'), null);
    assert.equal(text(copy.querySelector('h1')), 'Page not found.');
    const hrefs = [...copy.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    assert.ok(hrefs.includes('/sitemap.xml') && hrefs.includes('/llms.txt'));
});

test('llms.txt follows llmstxt.org, has a when-to-use section, and every link resolves', () => {
    const lines = read('llms.txt').split('\n');
    assert.match(lines[0], /^# \S/, 'an H1 with the name, first');
    assert.equal((lines.filter((l) => /^# /.test(l))).length, 1, 'only one H1');
    const quote = lines.findIndex((l) => l.startsWith('> '));
    assert.ok(quote > 0 && lines.slice(1, quote).every((l) => !l.trim()), 'the blockquote summary comes next');
    const firstH2 = lines.findIndex((l) => l.startsWith('## '));
    assert.ok(firstH2 > quote);
    assert.ok(lines.slice(quote + 1, firstH2).every((l) => !/^#/.test(l)), 'no headings before the file lists');
    assert.ok(lines.every((l) => !/^#{3,} /.test(l)), 'no H3 or deeper');
    const sections = lines.filter((l) => l.startsWith('## ')).map((l) => l.slice(3));
    assert.ok(sections.some((s) => /when to use/i.test(s)), `sections: ${sections.join(', ')}`);
    assert.ok(lines.slice(quote + 1, firstH2).some((l) => /agents/i.test(l) && /text\/markdown/.test(l)), 'instructions for agents');
    for (const l of lines.slice(firstH2).filter((l) => l.trim() && !l.startsWith('## '))) {
        const m = /^- \[([^\]]+)\]\((https?:\/\/[^)\s]+)\)(: .+)?$/.exec(l);
        assert.ok(m, `not a file-list item: ${l}`);
        if (m[2].startsWith(SITE)) assert.ok(fileFor(m[2]), `llms.txt links ${m[2]}, which the build does not have`);
    }
});

test('sitemap.xml lists every page (and not the deck or the 404), each built', () => {
    const doc = new DOMParser().parseFromString(read('sitemap.xml'), 'text/xml');
    const urlset = doc.querySelector('urlset');
    assert.equal(urlset?.getAttribute('xmlns'), 'http://www.sitemaps.org/schemas/sitemap/0.9');
    const locs = [...doc.querySelectorAll('url > loc')].map((l) => l.textContent.trim());
    assert.deepEqual([...locs].sort(), MARKDOWN_PAGES.map((p) => `${SITE}${p}`).sort());
    for (const loc of locs) assert.ok(fileFor(loc), `${loc} is not in the build`);
    for (const lm of doc.querySelectorAll('url > lastmod')) assert.match(lm.textContent, /^\d{4}-\d{2}-\d{2}$/);
});

test('sitemap.xml links each page with its twin in the other language, both ways (hreflang)', () => {
    const doc = new DOMParser().parseFromString(read('sitemap.xml'), 'text/xml');
    assert.equal(doc.querySelector('urlset').getAttribute('xmlns:xhtml'), 'http://www.w3.org/1999/xhtml');
    for (const url of doc.querySelectorAll('url')) {
        const loc = url.querySelector('loc').textContent.trim();
        const english = new URL(loc).pathname.replace(/^\/de\//, '/');
        const links = [...url.getElementsByTagName('xhtml:link')].map((l) => [l.getAttribute('rel'), l.getAttribute('hreflang'), l.getAttribute('href')]);
        assert.deepEqual(
            links,
            [
                ['alternate', 'en', `${SITE}${english}`],
                ['alternate', 'de', `${SITE}/de${english}`],
                ['alternate', 'x-default', `${SITE}${english}`],
            ],
            loc,
        );
    }
});

test('robots.txt allows the site and names the site map', () => {
    const robots = read('robots.txt');
    assert.match(robots, /^Sitemap: https:\/\/prism\.mirdyne\.com\/sitemap\.xml$/m);
    assert.doesNotMatch(robots, /^Disallow: \/\s*$/m);
});

test('German pages: the same pages under /de/, marked German, each linked with its English twin', () => {
    for (const path of ENGLISH) {
        const en = page(fileOf(path)).document;
        const de = page(fileOf(`/de${path}`)).document;
        assert.equal(en.documentElement.getAttribute('lang'), 'en', path);
        assert.equal(de.documentElement.getAttribute('lang'), 'de', `/de${path}`);
        for (const [doc, self] of [
            [en, path],
            [de, `/de${path}`],
        ]) {
            const alternates = [...doc.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => [l.getAttribute('hreflang'), l.getAttribute('href')]);
            assert.deepEqual(
                alternates,
                [
                    ['en', `${SITE}${path}`],
                    ['de', `${SITE}/de${path}`],
                    ['x-default', `${SITE}${path}`],
                ],
                `${self}: hreflang`,
            );
            assert.equal(doc.querySelector('link[rel="canonical"]')?.getAttribute('href'), `${SITE}${self}`, `${self}: canonical`);
            assert.equal(doc.querySelector('meta[property="og:url"]')?.getAttribute('content'), `${SITE}${self}`, `${self}: og:url`);
        }
        const locale = (doc, p) => doc.querySelector(`meta[property="${p}"]`)?.getAttribute('content');
        assert.deepEqual([locale(en, 'og:locale'), locale(en, 'og:locale:alternate')], ['en_GB', 'de_DE'], path);
        assert.deepEqual([locale(de, 'og:locale'), locale(de, 'og:locale:alternate')], ['de_DE', 'en_GB'], `/de${path}`);
    }
});

test('German pages: title, descriptions and preview text are German', () => {
    const META = ['meta[name="description"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[property="og:image:alt"]'];
    for (const path of ENGLISH) {
        const en = page(fileOf(path)).document;
        const de = page(fileOf(`/de${path}`)).document;
        // The same as in English only where it is a name kept on purpose ("PRISM by Mirdyne").
        const german = (d, e, what) => assert.ok(d !== e || KEPT.has(d), `/de${path}: ${what} is the English one: ${JSON.stringify(e)}`);
        assert.ok(text(de.querySelector('title')), `/de${path}: no title`);
        german(text(de.querySelector('title')), text(en.querySelector('title')), 'the title');
        for (const sel of META) {
            const e = en.querySelector(sel)?.getAttribute('content');
            const d = de.querySelector(sel)?.getAttribute('content');
            assert.equal(Boolean(d), Boolean(e), `/de${path}: ${sel} present in one language only`);
            if (e) german(d, e, sel);
        }
    }
});

test('German pages: no text left in English, in the plain copy or the Markdown', () => {
    for (const path of ENGLISH) {
        const en = page(fileOf(path)).copy.innerHTML;
        const de = page(fileOf(`/de${path}`)).copy.innerHTML;
        assert.deepEqual(untranslated(en, de, KEPT), [], `/de${path}: the same as on ${path}`);
        const md = read(`de${path}index.html.md`);
        // The words the build adds itself. (The legal pages hold an English version of their text on purpose.)
        for (const words of ['Diagram:', 'This form needs JavaScript']) {
            assert.ok(!md.includes(words), `/de${path}index.html.md: "${words}"`);
        }
        const footer = md.slice(md.lastIndexOf('\n---\n'));
        for (const words of ['This page on the web', 'Register interest', 'Pages:', 'Legal:']) {
            assert.ok(!footer.includes(words), `/de${path}index.html.md, footer: "${words}"`);
        }
    }
});

test('links stay in the page’s language; only the language switch crosses over', () => {
    for (const path of MARKDOWN_PAGES) {
        const german = path.startsWith('/de/');
        let switches = 0;
        for (const a of page(fileOf(path)).copy.querySelectorAll('a[href]')) {
            const url = new URL(a.getAttribute('href'), `${SITE}${path}`);
            const toGerman = url.pathname.startsWith('/de/');
            if (url.origin !== SITE || !(ENGLISH.includes(url.pathname) || toGerman)) continue;
            // A jump within the page (the legal pages' "English" and "Deutsch" versions) stays on it.
            if (url.pathname === path && url.hash) continue;
            const where = `${path}: link to ${a.getAttribute('href')} ("${text(a)}")`;
            const hreflang = attr(a, 'hreflang');
            if (hreflang) {
                // The language switch: to the same page in the other language, marked as such.
                switches++;
                assert.equal(hreflang, german ? 'en' : 'de', where);
                assert.equal(attr(a, 'lang'), hreflang, where);
                assert.equal(url.pathname, german ? path.slice(3) : `/de${path}`, where);
            } else if (!a.closest('[lang]')) {
                // Text marked as another language (the legal pages' two versions) may link either way.
                assert.equal(toGerman, german, where);
            }
        }
        assert.ok(switches > 0, `${path}: no language switch`);
    }
});

test('German pages preload their dictionary; English pages load no German', () => {
    const chunks = readdirSync(resolve(DIST, 'assets')).filter((f) => /^i18n-de-[\w-]+\.js$/.test(f));
    assert.equal(chunks.length, 1, `German dictionaries in dist/assets: ${chunks.join(', ')}`);
    for (const path of MARKDOWN_PAGES) {
        const preloads = [...page(fileOf(path)).document.querySelectorAll('link[rel="modulepreload"]')].map((l) => l.getAttribute('href'));
        assert.deepEqual(preloads, path.startsWith('/de/') ? [`/assets/${chunks[0]}`] : [], path);
    }
});

test('the supply-chain explorer, read without JavaScript: its words and each programme’s chance, not its controls', async () => {
    const H = await load('src/site/hawkes.ts');
    const M = await load('src/site/supply-model.ts');
    // What the page starts with: a disruption at the first supplier, knock-on effects at 0.85.
    const A = H.scale(M.BASE, 0.85);
    const j = M.SUPPLIERS[0].i;
    const beta = 1 / M.MEAN_DELAY_DAYS;
    // The day the expected impact on the programmes peaks, within the 180 days the page looks at.
    const days = Array.from({ length: 181 }, (_, d) => d);
    const total = H.impulseResponse(A, beta, j, days, 0.25).map((h) => M.PROGRAMMES.reduce((s, p) => s + h[p.i], 0));
    const peak = total.indexOf(Math.max(...total));
    // The worst 1 in 20 of the 2,000 cascades the page draws for this setting.
    const { seeded } = await load('src/site/hooks.ts');
    const rand = seeded(1000 + j * 97 + 85);
    const sizes = Array.from({ length: 2000 }, () => H.simulateCascade(A, beta, j, rand).events.length);
    const worst = H.quantile(sizes.sort((a, b) => a - b), 0.95);
    for (const [path, heading, locale] of [
        ['/platform/', 'How a disruption spreads', 'en-GB'],
        ['/de/platform/', 'Wie sich eine Störung ausbreitet', 'de-DE'],
    ]) {
        const { copy } = page(fileOf(path));
        assert.ok([...copy.querySelectorAll('h3')].some((h) => text(h) === heading), `${path}: no heading "${heading}"`);
        assert.equal(copy.querySelectorAll('[data-interactive], input').length, 0, `${path}: controls in the plain copy`);
        // The chances on the page are the exact ones.
        const md = read(`${path.slice(1)}index.html.md`);
        for (const p of M.PROGRAMMES) {
            const chance = H.hitProbability(A, j, p.i).toLocaleString(locale, { style: 'percent', maximumSignificantDigits: 2 });
            assert.ok(md.includes(`**${chance}**`), `${path}: ${p.id}'s chance of a hit, ${chance}, is not on the page`);
        }
        // So are the day the impact peaks and the size the worst 1 in 20 cascades reach.
        const german = locale === 'de-DE';
        assert.ok(md.includes(`${peak} ${german ? 'Tagen' : 'days'}`), `${path}: the peak, day ${peak}, is not on the page`);
        assert.ok(md.includes(`${worst}+ ${german ? 'Ereignisse' : 'events'}`), `${path}: the worst 1 in 20, ${worst}+, is not on the page`);
    }
});

test('the making route, read without JavaScript: melted, milled, made into powder, printed, then coupons and tests', () => {
    for (const [path, steps, diagram] of [
        [
            '/',
            ['Raw metals, ready to melt', 'Loaded into the hearth', 'Melted with an electric arc', 'An alloy button, as cast', 'Milled down', 'Made into powder', 'Printed in a powder bed', 'Or built up by DED', 'Coupons, then tests'],
            'Diagram:',
        ],
        [
            '/de/',
            ['Rohmetalle, bereit zum Schmelzen', 'In den Herd eingelegt', 'Im Lichtbogen geschmolzen', 'Ein Legierungsknopf im Gusszustand', 'Klein gefräst', 'Zu Pulver verarbeitet', 'Im Pulverbett gedruckt', 'Oder per DED aufgebaut', 'Proben, dann Tests'],
            'Diagramm:',
        ],
    ]) {
        const { copy } = page(fileOf(path));
        const items = [...copy.querySelectorAll('.made__grid > li')];
        // Each step in order, numbered 01 to 09, its caption first (a note may follow it).
        assert.deepEqual(
            items.map((li) => text(li.querySelector('.made__step'))),
            steps.map((_, i) => String(i + 1).padStart(2, '0')),
            `${path}: the steps' numbers`,
        );
        items.forEach((li, i) => {
            const caption = text(li.querySelector('figcaption')).replace(/^\d\d\s*/, '');
            assert.ok(caption.startsWith(steps[i]), `${path}: step ${i + 1} reads "${caption}", not "${steps[i]}"`);
        });
        // Every step is a photograph with its description, except DED (08), which is drawn and described.
        items.forEach((li, i) => {
            if (i === 7) {
                const d = text(li.querySelector('.prerender-figure'));
                assert.ok(d.startsWith(diagram) && d.length > 40, `${path}: the drawn step without its description: "${d}"`);
            } else {
                const alt = li.querySelector('img')?.getAttribute('alt') ?? '';
                assert.ok(alt.length > 40, `${path}: step ${i + 1} has no photograph with a description`);
            }
        });
        // LPBF names both places it runs.
        assert.match(text(items[6]), /Fraunhofer IAPT.*Bimo Tech/, `${path}: where the powder bed printing runs`);
    }
    // Nothing on the site still says the route ends in machining, or skips the powder.
    for (const path of ENGLISH) {
        const words = text(page(fileOf(path)).copy);
        for (const wrong of ['Machined to shape', 'machined part', 'melt and 3D-print', 'melted and 3D-printed']) {
            assert.ok(!words.includes(wrong), `${path}: "${wrong}"`);
        }
    }
    // The photographs that are not ours are credited in the Impressum, in both languages.
    for (const [path, credits] of [
        ['/impressum/', ['Metal powder under an electron microscope', 'Test pieces in a laser powder-bed printer', 'Printed test coupons on the build plate']],
        ['/de/impressum/', ['Metallpulver unter dem Elektronenmikroskop', 'Testteile in einem Laser-Pulverbettdrucker', 'Gedruckte Proben auf der Bauplatte']],
    ]) {
        const words = text(page(fileOf(path)).copy.querySelector('#credits'));
        for (const c of credits) assert.ok(words.includes(c), `${path}: no credit for "${c}"`);
    }
    const platform = text(page(fileOf('/platform/')).copy);
    assert.match(platform, /melted, milled and made into powder, printed at Fraunhofer IAPT and then at Bimo Tech, and tested as coupons/, '/platform/: PRISM Alpha’s route');
});

test('how PRISM chooses, read without JavaScript: six steps in plain words, the scene described, no controls', () => {
    for (const [path, heading, titles, diagram] of [
        ['/method/', 'Which recipes are worth making?', ['Propose', 'Judge', 'Check exactly', 'Can it be printed?', 'A window, not a point', 'Test, then learn'], 'Diagram: How PRISM chooses:'],
        ['/de/method/', 'Welche Rezepte lohnen sich?', ['Vorschlagen', 'Bewerten', 'Genau nachrechnen', 'Lässt es sich drucken?', 'Ein Fenster, kein Punkt', 'Testen, dann lernen'], 'Diagramm: Wie PRISM auswählt:'],
    ]) {
        const { copy } = page(fileOf(path));
        const section = copy.querySelector('#chooses');
        assert.ok(section, `${path}: no #chooses section`);
        // It follows the method's demos and comes before open research and proof.
        const order = [...copy.querySelectorAll('section[id]')].map((s) => s.id);
        assert.deepEqual(order.slice(0, 4), ['method', 'chooses', 'open-research', 'proof'], `${path}: sections ${order.join(', ')}`);
        assert.equal(text(section.querySelector('h2')), heading);
        const steps = [...section.querySelectorAll('.choose__steps > li')];
        assert.deepEqual(steps.map((li) => text(li.querySelector('h3'))), titles, `${path}: the six steps`);
        for (const li of steps) {
            const words = text(li.querySelector('p'));
            assert.ok(words.length > 30, `${path}: "${text(li.querySelector('h3'))}" says too little`);
            // Plain words: no numbers, no formulas.
            assert.ok(!/[\d=±σ∑]/.test(words), `${path}: "${words}"`);
        }
        assert.ok(text(section).includes(diagram), `${path}: the scene is not described`);
        assert.equal(section.querySelectorAll('button, [data-interactive]').length, 0, `${path}: controls in the plain copy`);
    }
    // The loop and the research stack tell the same story.
    const home = text(page(fileOf('/')).copy);
    assert.match(home, /A generator proposes a whole batch of promising recipes/);
    assert.match(home, /Several models judge each one, an exact calculation settles the doubtful ones/);
    const platform = text(page(fileOf('/platform/')).copy);
    for (const layer of ['Generator', 'Judges and trust meter', 'Exact check', 'A window, not a point']) assert.ok(platform.includes(layer), `/platform/: "${layer}"`);
});
