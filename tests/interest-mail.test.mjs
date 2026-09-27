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

test('a visitor from the German pages is marked, so the answer can be in German', () => {
    assert.match(interestMail({ ...base, from: '/de/platform/' }).html, /They may prefer German/);
    assert.doesNotMatch(interestMail(base).html, /prefer German/);
});
