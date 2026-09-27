/**
 * The email a Register interest submission becomes (server/interest-mail.ts): everything from the form
 * escaped, a way to reply, and the links to the website, Impressum and privacy policy.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { load } from './load.mjs';

const { interestMail } = await load('server/interest-mail.ts');

const base = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    organisation: 'Analytical Engines',
    role: '',
    areas: ['A new material for a part'],
    message: '',
    from: '/interest/',
    lang: 'en',
    received: '28 September 2026 at 00:15',
    kept: 'A copy is kept in the prism-interest store on Vercel: interest/2026-09/x.json',
};

test('the email escapes what the visitor typed, in every field', () => {
    const evil = '<script>alert(1)</script>"&\'';
    const { html, subject } = interestMail({ ...base, name: evil, organisation: evil, role: evil, message: evil, areas: [evil] });
    assert.ok(!html.includes('<script>'), 'raw markup got through');
    assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;&quot;&amp;&#39;'));
    // The subject is plain text for the mail header, never HTML.
    assert.equal(subject, `PRISM enquiry: ${evil}, ${evil}`);
});

test('the email answers the visitor, and links the website, Impressum and privacy policy', () => {
    const { html, text } = interestMail(base);
    assert.match(html, /href="mailto:ada@example\.com\?subject=Your%20interest%20in%20PRISM"/);
    for (const href of ['https://prism.mirdyne.com/', 'https://prism.mirdyne.com/impressum/', 'https://prism.mirdyne.com/privacy/'])
        assert.ok(html.includes(`href="${href}"`) && text.includes(href), `no link to ${href}`);
    assert.match(html, /src="https:\/\/prism\.mirdyne\.com\/brand\/mirdyne-lockup-white\.png"/);
    assert.match(text, /Role: \(not given\)/);
    assert.match(text, /Message:\n\(none\)/);
});

test('a visitor who used the German form is marked, so the answer can be in German', () => {
    assert.match(interestMail({ ...base, lang: 'de' }).html, /They wrote in German/);
    assert.doesNotMatch(interestMail(base).html, /wrote in German/);
});

const { confirmationMail } = await load('server/interest-mail.ts');

test('the confirmation thanks the visitor in their language, with the legal details and links', () => {
    const en = confirmationMail({ lang: 'en', name: 'Ada Lovelace', email: 'ada@example.com', areas: ['Investment'] });
    assert.equal(en.subject, 'Thank you for your interest in PRISM');
    assert.match(en.html, /Thank you, Ada\./);
    assert.match(en.html, /Managing director: Kevin Grüning/);
    for (const path of ['/impressum/', '/privacy/', '/method/']) assert.ok(en.html.includes(`https://prism.mirdyne.com${path}`), path);
    const de = confirmationMail({ lang: 'de', name: 'Ada Lovelace', email: 'ada@example.com', areas: ['Investition'] });
    assert.equal(de.subject, 'Danke für Ihr Interesse an PRISM');
    assert.match(de.html, /<html lang="de">/);
    assert.match(de.html, /Vielen Dank, Ada\./);
    assert.match(de.html, /Geschäftsführer: Kevin Grüning/);
    for (const path of ['/de/impressum/', '/de/privacy/', '/de/method/']) assert.ok(de.html.includes(`https://prism.mirdyne.com${path}`), path);
    assert.doesNotMatch(de.html + de.text, /Thank you|privacy policy/);
});

test('the confirmation never repeats a link or address typed as a name, and carries nothing else from the form', () => {
    for (const name of ['www.cheap-pills.example win', 'https://spam.example', 'spam@example.com hi']) {
        const { html, text } = confirmationMail({ lang: 'en', name, email: 'victim@example.com', areas: ['Something else'] });
        assert.match(html, /Thank you\.<\/h1>/);
        assert.ok(!html.includes('spam') && !html.includes('pills') && !text.includes('spam'), name);
    }
});

test('both emails leave the colours to the mail app, so they follow its light or dark theme', () => {
    const mails = [
        interestMail(base).html,
        confirmationMail({ lang: 'en', name: 'Ada', email: 'ada@example.com', areas: ['Investment'] }).html,
    ];
    for (const html of mails) {
        assert.match(html, /<meta name="color-scheme" content="light dark">/);
        assert.match(html, /<body style="margin:0;padding:0">/, 'the body sets a colour');
        assert.doesNotMatch(html, /prefers-color-scheme|data-ogs|<style/, 'dark-mode overrides are back');
        // The only fixed colours: the navy logo badge, and crimson for the rule, the labels and the button.
        const colours = new Set(html.match(/#[0-9a-f]{6}\b/gi).map((c) => c.toLowerCase()));
        assert.deepEqual([...colours].sort(), ['#061832', '#d12f49', '#ffffff'], [...colours].join(', '));
    }
});

test('the German area names in the function match the German form', async () => {
    const { DE } = await load('src/site/i18n-de.ts');
    const { AREAS } = await load('src/site/interest-areas.ts');
    const src = (await import('node:fs')).readFileSync(new URL('../api/interest.ts', import.meta.url), 'utf8');
    const block = src.slice(src.indexOf('const AREA_NAMES_DE'), src.indexOf('};', src.indexOf('const AREA_NAMES_DE')));
    for (const a of AREAS) {
        const m = block.match(new RegExp(`${a.id}: '([^']+)'`));
        assert.equal(m?.[1], DE[a.label], a.id);
    }
});
