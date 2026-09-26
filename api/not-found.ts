import { prefersMarkdown } from '../server/negotiate.js';

/**
 * The 404 for clients that ask for Markdown (vercel.json sends them here when an address matches no
 * file, page or function; everyone else gets the static 404.html). The status stays 404; the body says
 * where to go instead, in the form the client prefers.
 */

const SITE = 'https://www.mirdyne.com';

export const MARKDOWN_404 = `# Page not found

There is no page at this address on mirdyne.com. The link may be wrong, or the page may have moved.

- [Home](${SITE}/)
- [Contact](${SITE}/contact/)
- [Site map](${SITE}/sitemap.xml): every page on the site
- [llms.txt](${SITE}/llms.txt): what the site covers, with a Markdown version of each page
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

export default {
    fetch(request: Request) {
        const markdown = prefersMarkdown(request.headers.get('accept'));
        return new Response(request.method === 'HEAD' ? null : markdown ? MARKDOWN_404 : HTML_404, {
            status: 404,
            headers: {
                'Content-Type': markdown ? 'text/markdown; charset=utf-8' : 'text/html; charset=utf-8',
                Vary: 'Accept',
                'Cache-Control': 'public, max-age=0, must-revalidate',
                'X-Robots-Tag': 'noindex',
            },
        });
    },
};
