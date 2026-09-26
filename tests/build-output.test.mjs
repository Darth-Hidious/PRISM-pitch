/**
 * The built site (dist/, from `npm run build`), read the way an agent reads it: raw HTML with no
 * JavaScript, the Markdown copies, the structured data and the machine-readable files.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { DOMParser, parseHTML } from 'linkedom';
import { HEAD_SNIPPET, SITE } from '../scripts/prerender-lib.mjs';
import { ROOT, load } from './load.mjs';

const DIST = resolve(ROOT, 'dist');
if (!existsSync(resolve(DIST, 'index.html'))) throw new Error('No build in dist/: run `npm run build` first.');

const { MARKDOWN_PAGES } = await load('server/negotiate.ts');
const PAGES = [...MARKDOWN_PAGES.map((path) => ({ path, file: `${path.slice(1)}index.html` })), { path: null, file: '404.html' }];

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
        assert.ok(md.includes(`This page on the web: <${SITE}${path}>`), `${path}: footer`);
        const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
        assert.equal(canonical, `${SITE}${path}`, `${path}: canonical`);
    }
});

test('the static copy says what the page says: the figures that count up in the browser', () => {
    const md = read('index.html.md');
    // 126 ways to pick 5 of 9 metals × 3,764,376 ways to mix 5 in whole percent.
    assert.ok(md.includes(`**${(126 * 3764376).toLocaleString('en-GB')}** possible alloys`), 'the home page’s alloy count');
    assert.doesNotMatch(md, /\*\*1\*\* possible alloys/);
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
        }
    }
    for (const f of ['platform/index.html', 'method/index.html', 'news/index.html', '404.html']) {
        assert.equal(page(f).document.querySelectorAll('script[type="application/ld+json"]').length, 0, f);
    }
});

test('trust pages: About (/company/), Contact and Privacy each hold at least 500 characters of their own', () => {
    for (const f of ['company/index.html', 'contact/index.html', 'privacy/index.html']) {
        const main = page(f).copy.querySelector('main');
        assert.ok(text(main).length >= 500, `${f}: ${text(main).length} characters in <main>`);
    }
    const contact = text(page('contact/index.html').copy.querySelector('main'));
    assert.match(contact, /info@mirdyne\.com/);
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

test('robots.txt allows the site and names the site map', () => {
    const robots = read('robots.txt');
    assert.match(robots, /^Sitemap: https:\/\/www\.mirdyne\.com\/sitemap\.xml$/m);
    assert.doesNotMatch(robots, /^Disallow: \/\s*$/m);
});
