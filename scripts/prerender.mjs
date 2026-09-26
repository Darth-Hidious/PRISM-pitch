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
import { SITE, cleanMarkup, injectPage, toMarkdown } from './prerender-lib.mjs';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const out = resolve(root, 'node_modules/.cache/prerender');

await build({
    root,
    configFile: resolve(root, 'vite.config.ts'),
    logLevel: 'warn',
    build: { ssr: 'src/site/prerender.ts', outDir: out, emptyOutDir: true, copyPublicDir: false },
});
const { PAGES, COMPANY, render, structuredData } = await import(pathToFileURL(resolve(out, 'prerender.js')).href);

const link = (label, path) => `[${label}](${SITE}${path})`;
const footer = (path) =>
    [
        `This page on the web: <${SITE}${path}>`,
        `Pages: ${[
            link('Home', '/'),
            link('Platform', '/platform/'),
            link('Method', '/method/'),
            link('Company', '/company/'),
            link('News', '/news/'),
            link('Contact', '/contact/'),
            link('Register interest', '/interest/'),
        ].join(' · ')}`,
        `Legal: ${[link('Impressum', '/impressum/'), link('Privacy', '/privacy/')].join(' · ')}`,
        `The whole site, for language models: ${link('llms.txt', '/llms.txt')}`,
    ].join('\n\n');

for (const page of PAGES) {
    const file = resolve(dist, page.file);
    const markup = cleanMarkup(render(page.element), { email: COMPANY.email });
    const markdownHref = page.path && `${page.path}index.html.md`;
    const html = injectPage(await readFile(file, 'utf8'), {
        markup,
        markdownHref,
        jsonLd: page.path && structuredData(page.path),
    });
    await writeFile(file, html);
    let note = '';
    if (markdownHref) {
        const md = toMarkdown(markup, { path: page.path, footer: footer(page.path) });
        await writeFile(resolve(dist, markdownHref.slice(1)), md);
        note = `, ${markdownHref} ${md.length} chars`;
    }
    console.log(`prerendered ${page.file}: ${html.length} bytes${note}`);
}
