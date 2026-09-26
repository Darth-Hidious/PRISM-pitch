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
    assert.match(robots, /^Sitemap: https:\/\/www\.mirdyne\.com\/sitemap\.xml$/m);
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
        assert.ok(text(de.querySelector('title')), `/de${path}: no title`);
        assert.notEqual(text(de.querySelector('title')), text(en.querySelector('title')), `/de${path}: the title is the English one`);
        for (const sel of META) {
            const e = en.querySelector(sel)?.getAttribute('content');
            const d = de.querySelector(sel)?.getAttribute('content');
            assert.equal(Boolean(d), Boolean(e), `/de${path}: ${sel} present in one language only`);
            if (e) assert.notEqual(d, e, `/de${path}: ${sel} is the English one`);
        }
    }
});

test('German pages: no text left in English, in the plain copy or the Markdown', () => {
    for (const path of ENGLISH) {
        const en = page(fileOf(path)).copy.innerHTML;
        const de = page(fileOf(`/de${path}`)).copy.innerHTML;
        assert.deepEqual(untranslated(en, de, KEPT), [], `/de${path}: the same as on ${path}`);
        const md = read(`de${path}index.html.md`);
        for (const words of ['This page on the web', 'Diagram:', 'This form needs JavaScript', 'Register interest']) {
            assert.ok(!md.includes(words), `/de${path}index.html.md: "${words}"`);
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
            const where = `${path}: link to ${a.getAttribute('href')} ("${text(a)}")`;
            const hreflang = a.getAttribute('hreflang');
            if (hreflang) {
                // The language switch: to the same page in the other language, marked as such.
                switches++;
                assert.equal(hreflang, german ? 'en' : 'de', where);
                assert.equal(a.getAttribute('lang'), hreflang, where);
                assert.equal(url.pathname, german ? path.slice(3) : `/de${path}`, where);
            } else if (!a.closest('[lang]')) {
                // Text marked as another language (the legal pages' two versions) may link either way.
                assert.equal(toGerman, german, where);
            }
        }
        assert.ok(switches > 0, `${path}: no language switch`);
    }
});
