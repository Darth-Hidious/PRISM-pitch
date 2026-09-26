import assert from 'node:assert/strict';
import { test } from 'node:test';
import { load } from './load.mjs';

const { prefersMarkdown, parseAccept, markdownCopy, MARKDOWN_PAGES } = await load('server/negotiate.ts');

test('Markdown only for clients that prefer it', () => {
    const md = [
        'text/markdown',
        'TEXT/Markdown',
        'text/markdown, text/html',
        'text/markdown, */*',
        'text/markdown;q=0.9, text/html;q=0.8',
        'text/markdown, text/html;q=0.9, */*;q=0.8',
        'text/plain, text/markdown;q=0.5, */*;q=0.1',
        'text/html;q=0.5, text/markdown',
        'text/markdown; charset=utf-8',
    ];
    const html = [
        null,
        '',
        '*/*',
        'text/*',
        'text/html',
        'text/html, text/markdown',
        'text/markdown;q=0',
        'text/markdown;q=0.5, text/*;q=0.9',
        'text/markdown;q=0.9, text/html',
        'text/plain',
        'application/json',
        // What browsers send.
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    ];
    for (const a of md) assert.equal(prefersMarkdown(a), true, `Markdown for ${JSON.stringify(a)}`);
    for (const a of html) assert.equal(prefersMarkdown(a), false, `HTML for ${JSON.stringify(a)}`);
});

test('the Accept parser follows RFC 9110', () => {
    assert.deepEqual(
        parseAccept('text/html;level=1;q=0.5, */*;q=0.1').map(({ type, subtype, q }) => [type, subtype, q]),
        [
            ['text', 'html', 0.5],
            ['*', '*', 0.1],
        ],
    );
    // A comma inside a quoted parameter does not split the list.
    assert.equal(parseAccept('text/markdown;x="a,b";q=0.7, text/html;q=0.1').length, 2);
    // Malformed ranges and weights are ignored, as if not sent.
    assert.deepEqual(parseAccept('*/html, text, text/markdown;q=2, text/markdown;q=0.1234, text/plain;q=1.000'), [
        { type: 'text', subtype: 'plain', q: 1, index: 4 },
    ]);
});

test('each page maps to its Markdown copy, and nothing else does', () => {
    assert.equal(markdownCopy('/'), '/index.html.md');
    assert.equal(markdownCopy('/company'), '/company/index.html.md');
    assert.equal(markdownCopy('/company/'), '/company/index.html.md');
    assert.equal(markdownCopy('/deck/'), null);
    assert.equal(markdownCopy('/company/extra'), null);
    assert.equal(markdownCopy('/api/interest'), null);
    assert.equal(markdownCopy('/de'), '/de/index.html.md');
    assert.equal(markdownCopy('/de/company'), '/de/company/index.html.md');
    assert.equal(markdownCopy('/de/company/'), '/de/company/index.html.md');
    assert.equal(markdownCopy('/de/deck/'), null);
    assert.equal(markdownCopy('/de/de/'), null);
});

test('every page is there in English and, under /de/, in German', () => {
    const english = MARKDOWN_PAGES.filter((p) => !p.startsWith('/de/'));
    assert.deepEqual(english, ['/', '/platform/', '/method/', '/company/', '/news/', '/interest/', '/contact/', '/impressum/', '/privacy/']);
    assert.deepEqual(
        MARKDOWN_PAGES.filter((p) => p.startsWith('/de/')),
        english.map((p) => `/de${p}`),
    );
});
