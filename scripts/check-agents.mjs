/**
 * Checks a deployed site the way an agent meets it: every page in the site map as HTML and as Markdown,
 * the 404s, the redirects, and each machine-readable file.
 *
 *   node scripts/check-agents.mjs [base URL]      (default https://www.mirdyne.com)
 *
 * A protected preview needs its cookie: CHECK_COOKIE='_vercel_jwt=…'. Behind a proxy, set
 * NODE_USE_ENV_PROXY=1 so fetch uses it. Exits with 1 if anything is wrong.
 */
const BASE = (process.argv[2] ?? 'https://www.mirdyne.com').replace(/\/$/, '');
const SITE = 'https://www.mirdyne.com';
const BROWSER = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';

let failures = 0;
const ok = (cond, what) => {
    console.log(`${cond ? 'ok  ' : 'BAD '} ${what}`);
    if (!cond) failures++;
    return cond;
};

async function get(path, { accept, method = 'GET', redirect = 'manual' } = {}) {
    const headers = {};
    if (accept) headers.accept = accept;
    if (process.env.CHECK_COOKIE) headers.cookie = process.env.CHECK_COOKIE;
    for (let attempt = 1; ; attempt++) {
        try {
            const res = await fetch(BASE + path, { method, headers, redirect });
            const body = method === 'HEAD' ? '' : await res.text();
            return { status: res.status, type: res.headers.get('content-type') ?? '', vary: res.headers.get('vary') ?? '', headers: res.headers, body };
        } catch (e) {
            if (attempt === 3) throw e;
        }
    }
}

const varies = (r) => r.vary.toLowerCase().split(',').map((s) => s.trim()).includes('accept');
const onBase = (url) => url.replace(SITE, BASE);
/** Text of the plain copy in #root: what a reader without JavaScript gets. */
const copyText = (html) => {
    const m = /<div data-prerender>([\s\S]*)<\/div><\/div>/.exec(html);
    return m ? m[1].replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim() : '';
};

console.log(`Checking ${BASE}\n`);

// robots.txt and the site map: the list of pages comes from the site itself.
const robots = await get('/robots.txt');
ok(robots.status === 200 && robots.type.startsWith('text/plain'), `robots.txt: ${robots.status} ${robots.type}`);
ok(/^Sitemap: https:\/\/www\.mirdyne\.com\/sitemap\.xml$/m.test(robots.body), 'robots.txt names the site map');
const sitemap = await get('/sitemap.xml');
ok(sitemap.status === 200 && /xml/.test(sitemap.type), `sitemap.xml: ${sitemap.status} ${sitemap.type}`);
ok(sitemap.body.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), 'sitemap.xml uses the sitemaps.org schema');
const pages = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
ok(pages.length >= 9, `sitemap.xml lists ${pages.length} pages: ${pages.join(' ')}`);

// Every page: HTML for browsers, Markdown for agents, at the same address, with Vary: Accept.
for (const path of pages) {
    const html = await get(path, { accept: BROWSER });
    const text = copyText(html.body);
    ok(
        html.status === 200 && html.type.startsWith('text/html') && varies(html) && text.length >= 500 && (html.body.match(/<h1[\s>]/g) ?? []).length === 1,
        `${path} as HTML: ${html.status}, ${html.type}, Vary: ${html.vary || '-'}, ${text.length} characters without JavaScript`,
    );
    const any = await get(path, { accept: '*/*' });
    ok(any.status === 200 && any.type.startsWith('text/html'), `${path} for Accept: */*: ${any.type}`);
    const md = await get(path, { accept: 'text/markdown' });
    ok(
        md.status === 200 && md.type.startsWith('text/markdown') && varies(md) && md.body.startsWith('# '),
        `${path} as Markdown: ${md.status}, ${md.type}, Vary: ${md.vary || '-'}, opens with "${md.body.split('\n')[0]}"`,
    );
    if (path !== '/') {
        const bare = await get(path.replace(/\/$/, ''), { accept: 'text/markdown' });
        ok(bare.status === 200 && bare.type.startsWith('text/markdown'), `${path.replace(/\/$/, '')} (no slash) as Markdown: ${bare.status}`);
    }
    const twin = await get(`${path}index.html.md`);
    ok(
        twin.status === 200 && twin.type.startsWith('text/markdown') && twin.body === md.body,
        `${path}index.html.md: ${twin.status}, ${twin.type}, same as the negotiated copy`,
    );
    ok((twin.headers.get('link') ?? '') === `<${SITE}${path}>; rel="canonical"`, `${path}index.html.md names its page as canonical`);
}

// Addresses that do not exist: status 404, in the form asked for.
const missing = `/no-such-page-${Date.now()}`;
const nf = await get(missing, { accept: BROWSER });
ok(nf.status === 404 && nf.type.startsWith('text/html') && nf.body.includes('Page not found'), `missing page as HTML: ${nf.status} ${nf.type}`);
const nfmd = await get(missing, { accept: 'text/markdown' });
ok(
    nfmd.status === 404 && nfmd.type.startsWith('text/markdown') && nfmd.body.length >= 20 && nfmd.body.includes('/sitemap.xml') && nfmd.body.includes('/llms.txt'),
    `missing page as Markdown: ${nfmd.status} ${nfmd.type}, ${nfmd.body.length} characters, links the site map and llms.txt`,
);
const nfhead = await get(missing, { accept: 'text/markdown', method: 'HEAD' });
ok(nfhead.status === 404, `missing page, HEAD: ${nfhead.status}`);
const nfdeep = await get('/company/no-such-page', { accept: 'text/markdown' });
ok(nfdeep.status === 404 && nfdeep.type.startsWith('text/markdown'), `missing page under /company/ as Markdown: ${nfdeep.status}`);
const nfasset = await get('/assets/no-such-file.js');
ok(nfasset.status === 404, `missing asset: ${nfasset.status}`);

// Redirects.
for (const p of ['/about', '/about/']) {
    const r = await get(p);
    ok(r.status === 308 && r.headers.get('location') === '/company/', `${p} → ${r.status} ${r.headers.get('location')}`);
}
const ev = await get('/evidence');
ok(ev.status === 307 && ev.headers.get('location') === '/method/#proof', `/evidence → ${ev.status} ${ev.headers.get('location')}`);

// llms.txt: its format, and every link on this site answers.
const llms = await get('/llms.txt');
ok(llms.status === 200 && llms.type.startsWith('text/plain') && llms.body.startsWith('# '), `llms.txt: ${llms.status} ${llms.type}`);
ok(/^## When to use/m.test(llms.body) && /Accept: text\/markdown/.test(llms.body), 'llms.txt has a when-to-use section and instructions for agents');
for (const [, url] of llms.body.matchAll(/\]\((https:\/\/www\.mirdyne\.com[^)\s]*)\)/g)) {
    const r = await get(new URL(url).pathname, { redirect: 'follow' });
    ok(r.status === 200, `llms.txt link ${url}: ${r.status} ${r.type}`);
}

// Structured data on the home page.
const home = await get('/', { accept: BROWSER });
const ld = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(home.body);
let graph = [];
try {
    graph = JSON.parse(ld?.[1] ?? 'null')?.['@graph'] ?? [];
} catch {
    graph = [];
}
const org = graph.find((n) => n['@type'] === 'Organization');
ok(!!org, 'home page JSON-LD: an Organization');
ok(org?.contactPoint?.some((c) => c.contactType && (c.email || c.telephone)), 'Organization contactPoint with contactType and email');
ok(org?.address?.['@type'] === 'PostalAddress' && org.address.streetAddress && org.address.postalCode, 'Organization address as PostalAddress');
ok(graph.some((n) => n['@type'] === 'WebSite'), 'home page JSON-LD: the WebSite');
ok(home.body.includes('<link rel="alternate" type="text/markdown" href="/index.html.md" />'), 'home page links its Markdown copy');

// The rest of what software reads: the manifest and its icons, the favicons, the link preview.
const manifest = await get('/site.webmanifest');
let icons = [];
try {
    icons = JSON.parse(manifest.body).icons ?? [];
} catch {
    icons = [];
}
ok(manifest.status === 200 && icons.length > 0, `site.webmanifest: ${manifest.status}, ${icons.length} icons`);
for (const p of [...icons.map((i) => i.src), '/favicon.ico', '/favicon.svg', '/apple-touch-icon.png', '/og/prism.jpg', '/mirdyne-mark.svg']) {
    const r = await get(p);
    ok(r.status === 200 && /^image\//.test(r.type), `${p}: ${r.status} ${r.type}`);
}

// What must not change: the deck stays HTML, the form's function stays a function.
const deck = await get('/deck/', { accept: 'text/markdown' });
ok(deck.status === 200 && deck.type.startsWith('text/html') && deck.body.includes('noindex'), `/deck/ for Accept: text/markdown: ${deck.status} ${deck.type}`);
const api = await get('/api/interest', { accept: 'text/markdown' });
ok(api.status === 405, `GET /api/interest: ${api.status} (the form's function, not the 404)`);

console.log(failures ? `\n${failures} problem(s)` : '\nAll good.');
process.exit(failures ? 1 : 0);
