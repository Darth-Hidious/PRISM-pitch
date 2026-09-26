import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { getTransformedRoutes } = require('@vercel/routing-utils');
const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const { routes, error } = getTransformedRoutes(config);

/** The first route before or after the filesystem that matches, as Vercel reads vercel.json. */
function match(path, headers = {}, phase = 'any') {
    const fs = routes.findIndex((r) => r.handle === 'filesystem');
    const list = phase === 'before' ? routes.slice(0, fs) : phase === 'after' ? routes.slice(fs + 1) : routes;
    return list.find(
        (r) =>
            r.src &&
            !r.continue &&
            new RegExp(r.src).test(path) &&
            (r.has ?? []).every((h) => h.type === 'header' && new RegExp(`^${h.value}$`).test(headers[h.key] ?? '')),
    );
}

test('vercel.json is valid for Vercel', () => {
    assert.equal(error, null);
});

test('/about is the Company page', () => {
    for (const p of ['/about', '/about/']) {
        const r = match(p, {}, 'before');
        assert.equal(r.status, 308, p);
        assert.equal(r.headers.Location, '/company/');
    }
});

test('/contact serves the Contact page', () => {
    assert.equal(match('/contact', {}, 'after').dest, '/contact/index.html');
});

test('a missing address asked for as Markdown goes to the Markdown 404, after the filesystem', () => {
    for (const accept of ['text/markdown', 'text/html, TEXT/MARKDOWN;q=0.5']) {
        assert.match(match('/no/such/page', { accept }, 'after').dest, /^\/api\/not-found/);
    }
    // Everyone else gets the static 404.html.
    assert.equal(match('/no/such/page', { accept: 'text/html' }, 'after'), undefined);
    // Pages listed before it keep their own rewrite.
    assert.equal(match('/deck', { accept: 'text/markdown' }, 'after').dest, '/deck/index.html');
});

test('Markdown copies are text/markdown and point to their HTML page as canonical', () => {
    const headersFor = (path) =>
        Object.assign({}, ...routes.filter((r) => r.continue && r.headers && new RegExp(r.src).test(path)).map((r) => r.headers));
    assert.equal(headersFor('/index.html.md')['Content-Type'], 'text/markdown; charset=utf-8');
    assert.equal(headersFor('/index.html.md').Link, '<https://www.mirdyne.com/>; rel="canonical"');
    const company = headersFor('/company/index.html.md');
    assert.equal(company['Content-Type'], 'text/markdown; charset=utf-8');
    assert.equal(company.Link.replace('$1', 'company'), '<https://www.mirdyne.com/company/>; rel="canonical"');
});
