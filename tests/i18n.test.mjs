/**
 * The two languages (src/site/i18n.ts): English text as written, German from the dictionary
 * (src/site/i18n-de.ts), addresses and numbers in the page's language, and a dictionary that keeps what
 * the English says.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from './load.mjs';

const i18n = await load('src/site/i18n.ts');
const { DE } = await load('src/site/i18n-de.ts');
const { MARKDOWN_PAGES } = await load('server/negotiate.ts');

const html = (nodes) => renderToStaticMarkup(createElement('p', null, nodes));
const link = (href) => (inner) => createElement('a', { href }, inner);

test('English pages show the text as written; German pages show its German', () => {
    i18n.setDictionary({ Platform: 'Plattform' });
    assert.equal(i18n.translate('en', 'Platform'), 'Platform');
    assert.equal(i18n.translate('de', 'Platform'), 'Plattform');
});

test('text with no German is shown as it is, and noted for the build to refuse', () => {
    i18n.setDictionary({});
    i18n.MISSING.clear();
    assert.equal(i18n.translate('de', 'Not in the dictionary'), 'Not in the dictionary');
    assert.deepEqual([...i18n.MISSING], ['Not in the dictionary']);
    // English pages ask the dictionary nothing.
    i18n.translate('en', 'Nor this');
    assert.deepEqual([...i18n.MISSING], ['Not in the dictionary']);
    i18n.MISSING.clear();
});

test('rich text: numbered tags become elements, in the order the translation puts them', () => {
    const parts = [link('mailto:info@mirdyne.com'), link('/interest/')];
    assert.equal(
        html(i18n.richText('Write to <0>us</0> or use <1>the form</1>.', parts)),
        '<p>Write to <a href="mailto:info@mirdyne.com">us</a> or use <a href="/interest/">the form</a>.</p>',
    );
    assert.equal(
        html(i18n.richText('Nutzen Sie <1>das Formular</1> oder schreiben Sie <0>uns</0>.', parts)),
        '<p>Nutzen Sie <a href="/interest/">das Formular</a> oder schreiben Sie <a href="mailto:info@mirdyne.com">uns</a>.</p>',
    );
    assert.equal(html(i18n.richText('No tags at all.', [])), '<p>No tags at all.</p>');
    assert.throws(() => i18n.richText('A <2>third</2> part.', parts), /no part <2>/);
});

test('addresses inside the site stay in the page’s language', () => {
    const { localPath } = i18n;
    assert.equal(localPath('de', '/'), '/de/');
    assert.equal(localPath('de', '/company/'), '/de/company/');
    assert.equal(localPath('de', '/company/#team'), '/de/company/#team');
    assert.equal(localPath('de', '/interest/?topic=invest'), '/de/interest/?topic=invest');
    // Only the site's pages have a German version.
    for (const href of ['/deck/', '/llms.txt', '/og/prism.jpg', 'https://www.esa.int/', '//example.com/x', 'mailto:info@mirdyne.com', '#proof']) {
        assert.equal(localPath('de', href), href);
    }
    assert.equal(localPath('en', '/company/'), '/company/');
});

test('the language switch leads to the same page in the other language', () => {
    assert.deepEqual(i18n.otherLanguage('en', '/platform/'), { lang: 'de', href: '/de/platform/' });
    assert.deepEqual(i18n.otherLanguage('de', '/platform/'), { lang: 'en', href: '/platform/' });
    assert.deepEqual(i18n.otherLanguage('en', '/'), { lang: 'de', href: '/de/' });
});

test('a translator for each language: text, rich text, addresses and numbers', () => {
    i18n.setDictionary({ 'Use <0>the form</0>.': 'Nutzen Sie <0>das Formular</0>.', Contact: 'Kontakt' });
    const en = i18n.makeTranslator('en');
    const de = i18n.makeTranslator('de');
    assert.equal(en.lang, 'en');
    assert.equal(de.lang, 'de');
    assert.equal(en('Contact'), 'Contact');
    assert.equal(de('Contact'), 'Kontakt');
    assert.equal(html(de.rich('Use <0>the form</0>.', link('/de/interest/'))), '<p>Nutzen Sie <a href="/de/interest/">das Formular</a>.</p>');
    assert.equal(en.link('/news/'), '/news/');
    assert.equal(de.link('/news/'), '/de/news/');
    assert.equal(en.num(474311376), '474,311,376');
    assert.equal(de.num(474311376), '474.311.376');
    assert.equal(de.num(0.5), '0,5');
});

test('the pages the switch knows are the pages the site serves in both languages', () => {
    assert.deepEqual(
        i18n.PAGE_PATHS,
        MARKDOWN_PAGES.filter((p) => !p.startsWith('/de/')),
    );
});

test('the German dictionary: every entry has German, with the same tags as its English', () => {
    const entries = Object.entries(DE);
    assert.ok(entries.length > 0);
    const tags = (s) => [...s.matchAll(/<\/?\d+>/g)].map((m) => m[0]).sort();
    for (const [en, de] of entries) {
        assert.equal(typeof de, 'string', en);
        assert.ok(de.trim(), `no German for ${JSON.stringify(en)}`);
        assert.equal(de, de.trim(), `spaces around the German for ${JSON.stringify(en)}`);
        assert.deepEqual(tags(de), tags(en), `tags in the German for ${JSON.stringify(en)}`);
    }
});

test('the German dictionary keeps every number of the English', () => {
    // Digits only: "3,764,376" is "3.764.376" in German and "0.5" is "0,5"; both read as their digits.
    const numbers = (s) => [...s.matchAll(/\d+(?:[.,   ]\d{3})*(?:[.,]\d+)?/g)].map((m) => m[0].replace(/\D/g, '')).sort();
    for (const [en, de] of Object.entries(DE)) {
        assert.deepEqual(numbers(de), numbers(en), `numbers in the German for ${JSON.stringify(en)}: ${JSON.stringify(de)}`);
    }
});
