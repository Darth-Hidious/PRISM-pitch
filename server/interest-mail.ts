/**
 * The two emails a Register interest submission sends: the notice to our inbox, and a short
 * confirmation to the visitor in the language they used. They set no background and no text colour, so
 * each mail app shows them in its own light or dark theme. Only three things keep a colour of their own,
 * because they read on either: the Mirdyne logo on its navy badge, the crimson accents, and the crimson
 * button. Lines and quieter text are grey with some transparency, for the same reason. Email clients
 * understand little CSS, so the layout is tables with inline styles, and a plain text copy goes with
 * each. Every value from the form is escaped.
 */
import { COMPANY } from '../src/site/legal.js';

const SITE = 'https://prism.mirdyne.com';

const C = {
    navy: '#061832',
    crimson: '#d12f49',
    /** Lines, on light or dark. */
    line: 'rgba(128, 128, 128, 0.35)',
};
const FONT = "Arial, 'Helvetica Neue', Helvetica, sans-serif";
const MONO = "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace";
/** Quieter text: the app's own text colour, a little faded. */
const QUIET = 'opacity:0.72';

type Lang = 'en' | 'de';

const esc = (v: string) =>
    v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

const link = (href: string, text: string) => `<a href="${esc(href)}" style="text-decoration:underline">${esc(text)}</a>`;

const label = (text: string, accent = false) =>
    `<p style="margin:0 0 10px;font:600 11px/16px ${FONT};letter-spacing:1.5px;text-transform:uppercase;${accent ? `color:${C.crimson}` : QUIET}">${esc(text)}</p>`;

const chips = (areas: string[]) =>
    areas
        .map(
            (a) =>
                `<span style="display:inline-block;margin:0 6px 6px 0;padding:4px 11px;border:1px solid ${C.line};border-radius:999px;font-size:13px;line-height:18px">${esc(a)}</span>`,
        )
        .join('');

const button = (href: string, text: string) =>
    `<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="background:${C.crimson};border-radius:6px"><a href="${esc(href)}" style="display:inline-block;padding:12px 22px;font:700 15px/20px ${FONT};color:#ffffff;text-decoration:none">${esc(text)}</a></td>
</tr></table>`;

/** The page every email shares: the logo on its badge, a crimson rule, the body, and a footer. */
function frame({ lang, title, preheader, tag, body, footer }: { lang: Lang; title: string; preheader: string; tag: string; body: string; footer: string }) {
    return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;font-family:${FONT}">

<tr><td style="padding:0 0 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td valign="middle"><a href="${SITE}${lang === 'de' ? '/de/' : '/'}" style="display:inline-block;background:${C.navy};border-radius:8px;padding:9px 14px;text-decoration:none"><img src="${SITE}/brand/mirdyne-lockup-white.png" width="102" height="28" alt="Mirdyne" style="display:block;border:0;width:102px;height:28px;color:#ffffff"></a></td>
<td valign="middle" align="right" style="font:600 11px/16px ${MONO};letter-spacing:1.5px;text-transform:uppercase"><span style="${QUIET}">PRISM</span><br>${esc(tag)}</td>
</tr></table>
</td></tr>
<tr><td style="height:3px;line-height:3px;font-size:0;background:${C.crimson}">&nbsp;</td></tr>

<tr><td style="padding:28px 4px 28px">
${body}
</td></tr>

<tr><td style="padding:18px 4px 8px;border-top:1px solid ${C.line};font-size:12px;line-height:19px">
<div style="${QUIET}">
${footer}
</div>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/* ── The notice to our inbox ───────────────────────────────────────────── */

export interface InterestMail {
    name: string;
    email: string;
    organisation: string;
    role: string;
    /** The areas, as the form words them in English. */
    areas: string[];
    message: string;
    /** The page of our site the visitor came from, if any. */
    from: string;
    /** The language of the form they used. */
    lang: Lang;
    /** When it arrived, already written out for Berlin. */
    received: string;
    /** Where the stored copy is, or why there is none. */
    kept: string;
}

export function interestMail(m: InterestMail) {
    const first = m.name.split(' ')[0] || m.name;
    const german = m.lang === 'de';
    const reply = `mailto:${m.email}?subject=${encodeURIComponent(german ? 'Ihr Interesse an PRISM' : 'Your interest in PRISM')}`;
    const subject = `PRISM enquiry: ${m.name}, ${m.organisation}`;
    const who = m.role ? `${m.role}, ${m.organisation}` : m.organisation;

    const details: [string, string][] = [
        ['Email', link(`mailto:${m.email}`, m.email)],
        ['Organisation', esc(m.organisation)],
        ['Role', m.role ? esc(m.role) : `<span style="${QUIET}">not given</span>`],
        ['Interested in', esc(m.areas.join(', '))],
        ['Came from', m.from ? link(`${SITE}${m.from}`, m.from) : 'the form directly'],
        ['Language', german ? 'German: they used our German form' : 'English'],
        ['Received', `${esc(m.received)} (Berlin)`],
    ];

    const message = m.message
        ? `<tr><td style="padding:24px 0 0">
${label('Message')}
<div style="padding:14px 16px;border-left:3px solid ${C.crimson};font-size:15px;line-height:23px;white-space:pre-wrap">${esc(m.message)}</div>
</td></tr>`
        : '';

    const body = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td>
${label('New enquiry', true)}
<h1 style="margin:0;font:700 24px/30px ${FONT}">${esc(m.name)}</h1>
<p style="margin:4px 0 16px;font-size:16px;line-height:22px;${QUIET}">${esc(who)}</p>
${chips(m.areas)}
</td></tr>
${message}
<tr><td style="padding:26px 0 4px">
${button(reply, `Reply to ${first}`)}
<p style="margin:10px 0 0;font-size:13px;line-height:19px;${QUIET}">Or just press reply: this email answers ${esc(m.email)}.${german ? ' They wrote in German.' : ''}</p>
</td></tr>
<tr><td style="padding:24px 0 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.line}">
${details
    .map(
        ([k, v]) =>
            `<tr><td valign="top" style="padding:9px 16px 9px 0;border-bottom:1px solid ${C.line};width:120px;font-size:13px;line-height:20px;${QUIET}">${esc(k)}</td><td valign="top" style="padding:9px 0;border-bottom:1px solid ${C.line};font-size:14px;line-height:20px">${v}</td></tr>`,
    )
    .join('\n')}
</table>
<p style="margin:14px 0 0;font-size:12px;line-height:18px;${QUIET}">${esc(m.kept)}</p>
</td></tr>
</table>`;

    const footer = `<b>PRISM by Mirdyne</b> · Sent by the Register interest form on ${link(`${SITE}/`, 'prism.mirdyne.com')}.<br>
We keep these details for twelve months, as our privacy policy says.<br>
${link(`${SITE}/`, 'Website')} · ${link(`${SITE}/impressum/`, 'Impressum')} · ${link(`${SITE}/privacy/`, 'Privacy')}`;

    const html = frame({
        lang: 'en',
        title: subject,
        preheader: `${m.name} (${m.organisation}) is interested in ${m.areas.join(', ')}.`,
        tag: 'Register interest',
        body,
        footer,
    });

    const text = [
        `New enquiry: ${m.name}, ${who}`,
        '',
        `Email: ${m.email}`,
        `Organisation: ${m.organisation}`,
        `Role: ${m.role || '(not given)'}`,
        `Interested in: ${m.areas.join(', ')}`,
        `Came from: ${m.from ? `${SITE}${m.from}` : 'the form directly'}`,
        `Language: ${german ? 'German' : 'English'}`,
        `Received: ${m.received} (Berlin)`,
        '',
        'Message:',
        m.message || '(none)',
        '',
        `Reply to this email to answer ${m.name}.`,
        m.kept,
        '',
        '--',
        'PRISM by Mirdyne',
        `Website: ${SITE}/`,
        `Impressum: ${SITE}/impressum/`,
        `Privacy: ${SITE}/privacy/`,
    ].join('\n');

    return { subject, html, text };
}

/* ── The confirmation to the visitor ───────────────────────────────────── */

export interface ConfirmationMail {
    lang: Lang;
    name: string;
    email: string;
    /** The areas, as the form words them in the visitor's language. */
    areas: string[];
}

const WORDS = {
    en: {
        subject: 'Thank you for your interest in PRISM',
        tag: 'Message received',
        kicker: 'Message received',
        thanks: 'Thank you',
        have: 'We have your message and will reply to',
        topics: 'You asked about',
        meanwhile: 'In the meantime:',
        pages: [
            ['How PRISM works', '/method/'],
            ['The platform', '/platform/'],
            ['News', '/news/'],
        ],
        keep: 'We keep your details for twelve months and use them only to reply to you. More in our',
        privacyPolicy: 'privacy policy',
        notYou: 'If you did not write to us, please ignore this email. Nothing else will follow.',
        replyNote: 'You can reply to this email; it reaches our team.',
        director: 'Managing director',
        country: 'Germany',
        links: ['Website', 'Impressum', 'Privacy'],
    },
    de: {
        subject: 'Danke für Ihr Interesse an PRISM',
        tag: 'Nachricht erhalten',
        kicker: 'Nachricht erhalten',
        thanks: 'Vielen Dank',
        have: 'Wir haben Ihre Nachricht erhalten und antworten Ihnen an',
        topics: 'Ihr Thema',
        meanwhile: 'Bis dahin:',
        pages: [
            ['So arbeitet PRISM', '/de/method/'],
            ['Die Plattform', '/de/platform/'],
            ['Neuigkeiten', '/de/news/'],
        ],
        keep: 'Wir speichern Ihre Angaben zwölf Monate lang und nutzen sie nur, um Ihnen zu antworten. Mehr dazu in unserer',
        privacyPolicy: 'Datenschutzerklärung',
        notYou: 'Falls Sie uns nicht geschrieben haben, ignorieren Sie diese E-Mail bitte. Es folgt nichts weiter.',
        replyNote: 'Sie können auf diese E-Mail antworten; sie erreicht unser Team.',
        director: 'Geschäftsführer',
        country: 'Deutschland',
        links: ['Website', 'Impressum', 'Datenschutz'],
    },
} as const;

/**
 * The visitor's first name, for the greeting, only when it looks like a name: anyone can type any
 * address into the form, so nothing that reads like a link or an address goes out in our name.
 */
function greetingName(name: string) {
    const first = name.trim().split(/\s+/)[0] ?? '';
    return first.length <= 40 && !/[@/:<>]|www\.|\.(com|net|org|ru|io)\b/i.test(first) ? first : '';
}

export function confirmationMail(c: ConfirmationMail) {
    const w = WORDS[c.lang];
    const root = c.lang === 'de' ? '/de/' : '/';
    const first = greetingName(c.name);
    const hello = first ? `${w.thanks}, ${first}.` : `${w.thanks}.`;
    const privacy = `${SITE}${root}privacy/`;
    const legal = [COMPANY.name, COMPANY.street, COMPANY.town, w.country].filter(Boolean).join(' · ');
    const directors = COMPANY.managingDirectors?.length ? `${w.director}: ${COMPANY.managingDirectors.join(', ')}` : '';

    const body = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td>
${label(w.kicker, true)}
<h1 style="margin:0 0 12px;font:700 24px/30px ${FONT}">${esc(hello)}</h1>
<p style="margin:0 0 20px;font-size:16px;line-height:24px">${esc(w.have)} <b>${esc(c.email)}</b>.</p>
${label(w.topics)}
${chips(c.areas)}
</td></tr>
<tr><td style="padding:22px 0 0">
<p style="margin:0 0 10px;font-size:15px;line-height:22px">${esc(w.meanwhile)}</p>
${button(`${SITE}${w.pages[0][1]}`, w.pages[0][0])}
<p style="margin:12px 0 0;font-size:14px;line-height:22px;${QUIET}">${w.pages
        .slice(1)
        .map(([text, path]) => link(`${SITE}${path}`, text))
        .join(' · ')}</p>
</td></tr>
<tr><td style="padding:22px 0 0;border-bottom:0">
<p style="margin:0;padding-top:18px;border-top:1px solid ${C.line};font-size:13px;line-height:20px;${QUIET}">${esc(w.keep)} ${link(privacy, w.privacyPolicy)}. ${esc(w.replyNote)}</p>
<p style="margin:10px 0 0;font-size:13px;line-height:20px;${QUIET}">${esc(w.notYou)}</p>
</td></tr>
</table>`;

    const footer = `<b>PRISM by Mirdyne</b><br>
${esc(legal)}${directors ? `<br>${esc(directors)}` : ''}<br>
${link(`${SITE}${root}`, w.links[0])} · ${link(`${SITE}${root}impressum/`, w.links[1])} · ${link(privacy, w.links[2])}`;

    const html = frame({ lang: c.lang, title: w.subject, preheader: `${w.have} ${c.email}.`, tag: w.tag, body, footer });

    const text = [
        hello,
        '',
        `${w.have} ${c.email}.`,
        `${w.topics}: ${c.areas.join(', ')}`,
        '',
        w.meanwhile,
        ...w.pages.map(([t, p]) => `${t}: ${SITE}${p}`),
        '',
        `${w.keep} ${w.privacyPolicy}: ${privacy}`,
        w.replyNote,
        w.notYou,
        '',
        '--',
        'PRISM by Mirdyne',
        legal,
        directors,
        `${w.links[1]}: ${SITE}${root}impressum/`,
    ]
        .filter((l, i, all) => l !== '' || all[i - 1] !== '')
        .join('\n');

    return { subject: w.subject, html, text };
}
