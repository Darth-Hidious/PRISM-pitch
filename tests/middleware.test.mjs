import assert from 'node:assert/strict';
import { test } from 'node:test';
import { load } from './load.mjs';

const { default: middleware, config } = await load('middleware.ts');
const { MARKDOWN_PAGES } = await load('server/negotiate.ts');

const call = (path, accept) =>
    middleware(new Request(`https://www.mirdyne.com${path}`, { headers: accept ? { accept } : {} }));

test('Accept: text/markdown gets the page’s Markdown copy, marked text/markdown and Vary: Accept', () => {
    for (const page of MARKDOWN_PAGES) {
        for (const path of new Set([page, page.replace(/\/$/, '') || '/'])) {
            const res = call(path, 'text/markdown');
            assert.equal(res.headers.get('x-middleware-rewrite'), `https://www.mirdyne.com${page}index.html.md`, path);
            assert.equal(res.headers.get('content-type'), 'text/markdown; charset=utf-8');
            assert.equal(res.headers.get('vary'), 'Accept');
        }
    }
});

test('browsers, text/html and no Accept at all get the HTML, still with Vary: Accept', () => {
    for (const accept of ['text/html', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', '*/*', undefined]) {
        const res = call('/', accept);
        assert.equal(res.headers.get('x-middleware-next'), '1', String(accept));
        assert.equal(res.headers.get('x-middleware-rewrite'), null);
        assert.equal(res.headers.get('vary'), 'Accept');
    }
});

test('the matcher covers every page with and without its trailing slash, and nothing else', () => {
    const expected = MARKDOWN_PAGES.flatMap((p) => (p === '/' ? ['/'] : [p.slice(0, -1), p]));
    assert.deepEqual([...config.matcher].sort(), [...expected].sort());
});
