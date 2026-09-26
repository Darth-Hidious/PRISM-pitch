import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HEAD_SNIPPET, cleanMarkup, injectPage, scriptJson, toMarkdown, untranslated, visibleTexts } from '../scripts/prerender-lib.mjs';

const email = 'info@example.com';

test('cleanMarkup drops what needs JavaScript or only decorates', () => {
    const out = cleanMarkup(
        '<main><p>Keep</p><span aria-hidden="true">x</span><canvas></canvas><button>Open menu</button>' +
            '<div role="tablist"><span>tab</span></div><svg aria-hidden="true"><path d="M0 0"/></svg>' +
            '<svg><path d="M0 0"/></svg><link rel="preload" as="image" href="/a.webp"></main>',
        { email },
    );
    assert.equal(out, '<main><p>Keep</p></main>');
});

test('cleanMarkup keeps a labelled drawing as its description, and replaces forms', () => {
    const out = cleanMarkup('<svg role="img" aria-label="The loop, round again"><path d="M0"/></svg><form><input name="email"></form>', {
        email,
    });
    assert.match(out, /<p class="prerender-figure">Diagram: The loop, round again<\/p>/);
    assert.doesNotMatch(out, /<form|<input/);
    assert.match(out, /<a href="mailto:info@example.com">info@example.com<\/a>/);
});

test('cleanMarkup writes its own words in the page’s language', () => {
    const markup = '<svg role="img" aria-label="Der Kreislauf"><path d="M0"/></svg><form><input name="email"></form>';
    const de = cleanMarkup(markup, { email, lang: 'de' });
    assert.match(de, /<p class="prerender-figure">Diagramm: Der Kreislauf<\/p>/);
    assert.match(de, /Dieses Formular funktioniert nur mit JavaScript\. Schreiben Sie uns sonst an <a href="mailto:info@example\.com">/);
    assert.doesNotMatch(de, /Diagram:|This form/);
    assert.match(cleanMarkup(markup, { email }), /Diagram: Der Kreislauf/);
});

test('cleanMarkup makes every picture lazy and drops fetch priority, in any case', () => {
    const out = cleanMarkup('<img src="/a.webp" alt="A" fetchPriority="high"><img src="/b.webp" alt="B" loading="eager">', { email });
    assert.equal((out.match(/loading="lazy"/g) || []).length, 2);
    assert.doesNotMatch(out, /fetchpriority/i);
    assert.doesNotMatch(out, /eager/);
});

test('toMarkdown: title first, absolute links, labels and numbers kept apart, a footer', () => {
    const md = toMarkdown(
        '<main><img src="/hero.webp" alt="An engine"><header><p class="w-label">Kicker</p><h1>Title</h1></header>' +
            '<p><span class="w-label">Funded by</span><strong>ESA</strong></p><ol><li><span>01</span>You tell us.</li></ol>' +
            '<p>Go to <a href="/contact/">Contact</a>.</p><details><summary>Sources</summary><p>A paper.</p></details>' +
            '<p class="legal__address">Line one<br>Line two</p><dl><div><dt>19</dt><dd>rounds</dd></div></dl>' +
            '<span class="plogo" role="img" aria-label="ArianeGroup"></span></main>',
        { path: '/company/', footer: 'The footer.' },
    );
    const lines = md.split('\n');
    assert.equal(lines[0], '# Title');
    assert.doesNotMatch(md, /Kicker/);
    assert.match(md, /!\[An engine\]\(https:\/\/www\.mirdyne\.com\/hero\.webp\)/);
    assert.match(md, /Funded by \*\*ESA\*\*/);
    assert.match(md, /01 You tell us\./);
    assert.match(md, /\[Contact\]\(https:\/\/www\.mirdyne\.com\/contact\/\)\./);
    assert.match(md, /\*Sources:\* A paper\./);
    assert.match(md, /Line one\\\nLine two/);
    assert.match(md, /- {1,3}\*\*19\*\* rounds/);
    assert.match(md, /ArianeGroup/);
    assert.ok(md.endsWith('---\n\nThe footer.\n'));
});

test('toMarkdown refuses a page without <main>', () => {
    assert.throws(() => toMarkdown('<div>No main</div>', { path: '/', footer: '' }), /no <main>/);
});

test('injectPage puts the copy in #root and the head additions before </head>', () => {
    const tpl = '<html><head><title>T</title>\n  </head><body><div id="root"></div></body></html>';
    const html = injectPage(tpl, { markup: '<p>Price: $& $1</p>', markdownHref: '/index.html.md', jsonLd: { name: '</script><x>' } });
    // A "$" in the page's text is kept as it is.
    assert.match(html, /<div id="root"><div data-prerender><p>Price: \$& \$1<\/p><\/div><\/div>/);
    assert.match(html, /<link rel="alternate" type="text\/markdown" href="\/index.html.md" \/>/);
    assert.ok(html.includes(HEAD_SNIPPET));
    // Nothing in the JSON can close its <script> early.
    assert.ok(html.includes(`<script type="application/ld+json">${scriptJson({ name: '</script><x>' })}</script>`));
    assert.doesNotMatch(scriptJson({ name: '</script>' }), /<\//);
    assert.throws(() => injectPage('<head></head><div id="root"><p>already</p></div>', { markup: '' }), /exactly one empty #root/);
});

test('visibleTexts: the text a reader meets, not the parts marked as another language', () => {
    const texts = visibleTexts(
        '<main><h1>Title</h1><img alt="A furnace"><a href="/" aria-label="Home" title="Go home">x</a>' +
            '<input placeholder="Your name"><p>  spaced \n  out </p><div lang="de"><p>Deutsch</p></div>' +
            '<a lang="en" href="/">EN</a></main>',
    );
    assert.deepEqual([...texts].sort(), ['A furnace', 'Go home', 'Home', 'Title', 'Your name', 'spaced out', 'x'].sort());
});

test('untranslated: what a German page shows exactly as its English twin, with words in it', () => {
    const en = '<p>The platform</p><p>PRISM</p><p>01</p><p>km</p><p>Still English</p><img alt="A furnace">';
    const de = '<p>Die Plattform</p><p>PRISM</p><p>01</p><p>km</p><p>Still English</p><img alt="A furnace">';
    // Names the dictionary keeps as they are count as German; numbers and short symbols are not words.
    assert.deepEqual(untranslated(en, de, new Set(['PRISM'])), ['Still English', 'A furnace']);
    assert.deepEqual(untranslated(en, de, new Set(['PRISM', 'Still English', 'A furnace'])), []);
});
