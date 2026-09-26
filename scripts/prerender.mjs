/**
 * The last build step (npm run build), after `vite build`: writes every page's content into its built
 * HTML, so it reads without JavaScript, and a Markdown copy of each page beside it (/company/ →
 * /company/index.html.md, as llmstxt.org proposes). The middleware serves that copy to clients that ask
 * for text/markdown. What the step does to the markup: scripts/prerender-lib.mjs.
 *
 * It renders the same React tree as the browser, from a server build of src/site/prerender.ts. The
 * browser still draws each page itself; see mount() in src/site/boot.ts.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import { SITE, cleanMarkup, injectPage, toMarkdown, untranslated } from './prerender-lib.mjs';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const out = resolve(root, 'node_modules/.cache/prerender');

await build({
    root,
    configFile: resolve(root, 'vite.config.ts'),
    logLevel: 'warn',
    build: { ssr: 'src/site/prerender.ts', outDir: out, emptyOutDir: true, copyPublicDir: false },
});
const { PAGES, COMPANY, render, structuredData, missingGerman, translate, keptTheSame } = await import(
    pathToFileURL(resolve(out, 'prerender.js')).href
);
/** Each English page's raw render, to hold its German twin against. */
const englishRender = new Map();
const leftInEnglish = new Map();

/** The Markdown copy's closing lines, in the page's language, linking the pages in that language. */
const FOOTER = {
    en: { here: 'This page on the web', pages: 'Pages', legal: 'Legal', llms: 'The whole site, for language models' },
    de: { here: 'Diese Seite im Web', pages: 'Seiten', legal: 'Rechtliches', llms: 'Die ganze Website für Sprachmodelle' },
};
const footer = (path, lang) => {
    const w = FOOTER[lang];
    const prefix = lang === 'de' ? '/de' : '';
    const link = (label, to) => `[${translate(lang, label)}](${SITE}${prefix}${to})`;
    return [
        `${w.here}: <${SITE}${path}>`,
        `${w.pages}: ${[
            link('Home', '/'),
            link('Platform', '/platform/'),
            link('Method', '/method/'),
            link('Company', '/company/'),
            link('News', '/news/'),
            link('Contact', '/contact/'),
            link('Register interest', '/interest/'),
        ].join(' · ')}`,
        `${w.legal}: ${[link('Impressum', '/impressum/'), link('Privacy', '/privacy/')].join(' · ')}`,
        `${w.llms}: [llms.txt](${SITE}/llms.txt)`,
    ].join('\n\n');
};

for (const page of PAGES) {
    const file = resolve(dist, page.file);
    const raw = render(page);
    if (page.lang === 'en') englishRender.set(page.path, raw);
    else for (const text of untranslated(englishRender.get(page.path.slice(3)), raw, keptTheSame())) leftInEnglish.set(text, page.path);
    const markup = cleanMarkup(raw, { email: COMPANY.email, lang: page.lang });
    const markdownHref = page.path && `${page.path}index.html.md`;
    const html = injectPage(await readFile(file, 'utf8'), {
        markup,
        markdownHref,
        jsonLd: page.path && structuredData(page.path),
    });
    await writeFile(file, html);
    let note = '';
    if (markdownHref) {
        const md = toMarkdown(markup, { path: page.path, footer: footer(page.path, page.lang) });
        await writeFile(resolve(dist, markdownHref.slice(1)), md);
        note = `, ${markdownHref} ${md.length} chars`;
    }
    console.log(`prerendered ${page.file}: ${html.length} bytes${note}`);
}

// Every German page has been rendered: any English text it showed without a German translation stops the
// build, so the German site never goes out half in English.
const missing = missingGerman();
if (missing.length || leftInEnglish.size) {
    throw new Error(
        [
            missing.length && `No German in src/site/i18n-de.ts for ${missing.length} text(s) passed to t():`,
            ...missing.map((m) => `  ${JSON.stringify(m)}`),
            leftInEnglish.size && `${leftInEnglish.size} text(s) on German pages are the same as in English (not passed to t()?):`,
            ...[...leftInEnglish].map(([text, path]) => `  ${path}  ${JSON.stringify(text)}`),
        ]
            .filter(Boolean)
            .join('\n'),
    );
}

// The site map, with each page's two languages linked as alternates (hreflang, as Google reads it).
const today = new Date().toISOString().slice(0, 10);
const alternates = (path) =>
    [
        ['en', path],
        ['de', `/de${path}`],
        ['x-default', path],
    ]
        .map(([lang, href]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${SITE}${href}"/>`)
        .join('\n');
const urls = PAGES.filter((p) => p.path && p.lang === 'en').flatMap((p) =>
    [p.path, `/de${p.path}`].map((loc) => `  <url>\n    <loc>${SITE}${loc}</loc>\n    <lastmod>${today}</lastmod>\n${alternates(p.path)}\n  </url>`),
);
await writeFile(
    resolve(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`,
);
console.log(`sitemap.xml: ${urls.length} addresses`);
