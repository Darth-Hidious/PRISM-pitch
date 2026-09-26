import assert from 'node:assert/strict';
import { test } from 'node:test';
import { load } from './load.mjs';

const { default: handler, MARKDOWN_404, MARKDOWN_404_DE } = await load('api/not-found.ts');

const call = (accept, method = 'GET') =>
    handler.fetch(new Request('https://www.mirdyne.com/no/such/page', { method, headers: { accept } }));

test('Markdown 404: status 404, text/markdown, links to the site map and llms.txt', async () => {
    const res = call('text/markdown');
    assert.equal(res.status, 404);
    assert.equal(res.headers.get('content-type'), 'text/markdown; charset=utf-8');
    assert.equal(res.headers.get('vary'), 'Accept');
    const body = await res.text();
    assert.equal(body, MARKDOWN_404);
    assert.ok(body.length >= 20);
    assert.match(body, /^# Page not found$/m);
    assert.match(body, /\]\(https:\/\/www\.mirdyne\.com\/sitemap\.xml\)/);
    assert.match(body, /\]\(https:\/\/www\.mirdyne\.com\/llms\.txt\)/);
});

test('a client that lists Markdown but prefers HTML gets an HTML 404', async () => {
    const res = call('text/html, text/markdown;q=0.5');
    assert.equal(res.status, 404);
    assert.equal(res.headers.get('content-type'), 'text/html; charset=utf-8');
    assert.match(await res.text(), /<h1>Page not found<\/h1>/);
});

test('HEAD: the same status and headers, no body', async () => {
    const res = call('text/markdown', 'HEAD');
    assert.equal(res.status, 404);
    assert.equal(res.headers.get('content-type'), 'text/markdown; charset=utf-8');
    assert.equal(await res.text(), '');
});

test('under /de/ the 404 is German, in either form; anywhere else it is English', async () => {
    // vercel.json passes the missing address on as ?path=, without its leading slash.
    const at = (path, accept) =>
        handler.fetch(new Request(`https://www.mirdyne.com/api/not-found?path=${encodeURIComponent(path)}`, { headers: { accept } }));
    for (const path of ['de/no/such/page', 'de', 'de/']) {
        const md = at(path, 'text/markdown');
        assert.equal(md.status, 404);
        assert.equal(md.headers.get('content-language'), 'de');
        const body = await md.text();
        assert.equal(body, MARKDOWN_404_DE);
        assert.match(body, /^# Seite nicht gefunden$/m);
        assert.match(body, /\]\(https:\/\/www\.mirdyne\.com\/de\/\)/);
        assert.match(body, /\]\(https:\/\/www\.mirdyne\.com\/sitemap\.xml\)/);
        assert.match(body, /\]\(https:\/\/www\.mirdyne\.com\/llms\.txt\)/);
        const html = at(path, 'text/html, text/markdown;q=0.5');
        assert.match(await html.text(), /<html lang="de">[\s\S]*<h1>Seite nicht gefunden<\/h1>/);
    }
    for (const path of ['no/such/page', 'deck/nothing', 'design']) {
        const md = at(path, 'text/markdown');
        assert.equal(md.headers.get('content-language'), 'en');
        assert.equal(await md.text(), MARKDOWN_404);
    }
});
