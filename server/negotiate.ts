/**
 * Content negotiation (RFC 9110, section 12.5.1) between the two forms of a page on this site: HTML, the
 * default, and Markdown (text/markdown, RFC 7763), for AI agents and other software. Shared by the Routing
 * Middleware (middleware.ts) and the 404 function (api/not-found.ts).
 */

interface Range {
    type: string;
    subtype: string;
    q: number;
    /** Position in the header: the earlier, the more preferred when all else is equal. */
    index: number;
}

/** Splits a header on commas, but not on commas inside a quoted parameter value. */
function splitList(header: string, separator: ',' | ';'): string[] {
    const parts: string[] = [];
    let current = '';
    let quoted = false;
    for (let i = 0; i < header.length; i++) {
        const ch = header[i];
        if (quoted && ch === '\\') {
            current += ch + (header[i + 1] ?? '');
            i++;
        } else if (ch === '"') {
            quoted = !quoted;
            current += ch;
        } else if (ch === separator && !quoted) {
            parts.push(current);
            current = '';
        } else {
            current += ch;
        }
    }
    parts.push(current);
    return parts.map((p) => p.trim()).filter(Boolean);
}

/** The media ranges of an Accept header. Malformed entries and weights are left out, as if not sent. */
export function parseAccept(header: string): Range[] {
    const ranges: Range[] = [];
    splitList(header, ',').forEach((entry, index) => {
        const [mediaRange, ...params] = splitList(entry, ';');
        const m = /^([!#$%&'*+.^_`|~0-9a-z-]+)\/([!#$%&'*+.^_`|~0-9a-z-]+)$/i.exec(mediaRange ?? '');
        if (!m) return;
        const [type, subtype] = [m[1].toLowerCase(), m[2].toLowerCase()];
        if (type === '*' && subtype !== '*') return;
        let q = 1;
        for (const param of params) {
            const [name, value = ''] = param.split('=').map((s) => s.trim());
            if (name.toLowerCase() !== 'q') continue;
            // RFC 9110, section 12.4.2: "0" or "1" with up to three decimals, at most 1.
            if (!/^(0(\.\d{0,3})?|1(\.0{0,3})?)$/.test(value)) return;
            q = Number(value);
        }
        ranges.push({ type, subtype, q, index });
    });
    return ranges;
}

/** How the client weighs one media type: the most specific range that covers it decides. */
function weigh(ranges: Range[], type: string, subtype: string) {
    let best: (Range & { specificity: number }) | null = null;
    for (const r of ranges) {
        const specificity =
            r.type === type && r.subtype === subtype ? 3 : r.type === type && r.subtype === '*' ? 2 : r.type === '*' ? 1 : 0;
        if (specificity && (!best || specificity > best.specificity)) best = { ...r, specificity };
    }
    return best ?? { q: 0, specificity: 0, index: Infinity };
}

/**
 * Whether to answer with Markdown instead of HTML. Only when the client prefers it: a weight above zero
 * and at least that of text/html. On a tie, the type the client names more specifically wins, then the one
 * it lists first. With no Accept header, or "*\/*", or what browsers send, the answer is HTML.
 */
export function prefersMarkdown(accept: string | null | undefined): boolean {
    if (!accept) return false;
    const ranges = parseAccept(accept);
    const md = weigh(ranges, 'text', 'markdown');
    const html = weigh(ranges, 'text', 'html');
    if (md.q <= 0 || md.q < html.q) return false;
    if (md.q > html.q) return true;
    if (md.specificity !== html.specificity) return md.specificity > html.specificity;
    return md.index < html.index;
}

/** The site's pages that have a Markdown copy, at `<page>index.html.md` (written by scripts/prerender.mjs). */
export const MARKDOWN_PAGES = [
    '/',
    '/platform/',
    '/method/',
    '/company/',
    '/news/',
    '/interest/',
    '/contact/',
    '/impressum/',
    '/privacy/',
] as const;

/** The Markdown copy for a request path, or null when the path is not one of those pages. */
export function markdownCopy(pathname: string): string | null {
    const page = pathname.endsWith('/') ? pathname : `${pathname}/`;
    return (MARKDOWN_PAGES as readonly string[]).includes(page) ? `${page}index.html.md` : null;
}
