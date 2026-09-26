import { next, rewrite } from '@vercel/functions/middleware';
import { markdownCopy, prefersMarkdown } from './server/negotiate.js';

/**
 * Vercel Routing Middleware: each page of the site, as Markdown for clients that ask for it
 * (`Accept: text/markdown`), as HTML for everyone else, at the same address. Both answers say
 * `Vary: Accept`, so caches keep them apart. The Markdown copies are static files the build writes
 * beside each page (scripts/prerender.mjs); this only chooses between them.
 *
 * A static file wins over vercel.json rewrites, so the choice for an existing page cannot be made there;
 * addresses that do not exist are handled in vercel.json and api/not-found.ts.
 */
export const config = {
    matcher: [
        '/',
        '/platform',
        '/platform/',
        '/method',
        '/method/',
        '/company',
        '/company/',
        '/news',
        '/news/',
        '/interest',
        '/interest/',
        '/contact',
        '/contact/',
        '/impressum',
        '/impressum/',
        '/privacy',
        '/privacy/',
    ],
};

export default function middleware(request: Request) {
    const copy = markdownCopy(new URL(request.url).pathname);
    if (copy && prefersMarkdown(request.headers.get('accept'))) {
        return rewrite(new URL(copy, request.url), {
            headers: { 'Content-Type': 'text/markdown; charset=utf-8', Vary: 'Accept' },
        });
    }
    return next({ headers: { Vary: 'Accept' } });
}
