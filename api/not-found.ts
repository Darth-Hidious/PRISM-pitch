import { prefersMarkdown } from '../server/negotiate.js';

/**
 * The 404 for clients that ask for Markdown (vercel.json sends them here when an address matches no
 * file, page or function; everyone else gets the static 404.html). The status stays 404; the body says
 * where to go instead, in the form the client prefers, and in German for addresses under /de/.
 */

const SITE = 'https://prism.mirdyne.com';

export const MARKDOWN_404 = `# Page not found

There is no page at this address on mirdyne.com. The link may be wrong, or the page may have moved.

- [Home](${SITE}/)
- [Contact](${SITE}/contact/)
- [Site map](${SITE}/sitemap.xml): every page on the site
- [llms.txt](${SITE}/llms.txt): what the site covers, with a Markdown version of each page
`;

export const MARKDOWN_404_DE = `# Seite nicht gefunden

Unter dieser Adresse gibt es auf mirdyne.com keine Seite. Vielleicht ist der Link falsch, oder die Seite ist umgezogen.

- [Startseite](${SITE}/de/)
- [Kontakt](${SITE}/de/contact/)
- [Sitemap](${SITE}/sitemap.xml): jede Seite der Website, auf Englisch und Deutsch
- [llms.txt](${SITE}/llms.txt): was die Website abdeckt, mit einer Markdown-Fassung jeder Seite
`;

const HTML_404 = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Page not found | PRISM by Mirdyne</title></head>
<body>
<h1>Page not found</h1>
<p>There is no page at this address on mirdyne.com.</p>
<p><a href="/">Home</a> · <a href="/contact/">Contact</a> · <a href="/sitemap.xml">Site map</a> · <a href="/llms.txt">llms.txt</a></p>
</body>
</html>
`;

const HTML_404_DE = `<!doctype html>
<html lang="de">
<head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Seite nicht gefunden | PRISM by Mirdyne</title></head>
<body>
<h1>Seite nicht gefunden</h1>
<p>Unter dieser Adresse gibt es auf mirdyne.com keine Seite.</p>
<p><a href="/de/">Startseite</a> · <a href="/de/contact/">Kontakt</a> · <a href="/sitemap.xml">Sitemap</a> · <a href="/llms.txt">llms.txt</a></p>
</body>
</html>
`;

/** The missing address, as vercel.json passes it on (`?path=de/…`), is German under /de/. */
const isGerman = (request: Request) => /^\/?de(\/|$)/.test(new URL(request.url).searchParams.get('path') ?? '');

export default {
    fetch(request: Request) {
        const markdown = prefersMarkdown(request.headers.get('accept'));
        const german = isGerman(request);
        const body = markdown ? (german ? MARKDOWN_404_DE : MARKDOWN_404) : german ? HTML_404_DE : HTML_404;
        return new Response(request.method === 'HEAD' ? null : body, {
            status: 404,
            headers: {
                'Content-Type': markdown ? 'text/markdown; charset=utf-8' : 'text/html; charset=utf-8',
                'Content-Language': german ? 'de' : 'en',
                Vary: 'Accept',
                'Cache-Control': 'public, max-age=0, must-revalidate',
                'X-Robots-Tag': 'noindex',
            },
        });
    },
};
