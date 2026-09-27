/**
 * The two emails a Register interest submission sends: the notice to our inbox, and a short
 * confirmation to the visitor in the language they used. Both wear PRISM by Mirdyne's look (navy band,
 * crimson rule, paper ground) in light and in dark mode: clients that honour `prefers-color-scheme`
 * (Apple Mail, Outlook for Mac and iOS) get our own dark colours, Outlook.com and the Outlook apps get
 * them through their `data-ogsc`/`data-ogsb` hooks, and Outlook for Windows, which inverts on its own,
 * gets a light design that inverts cleanly. Email clients understand little CSS, so the layout is
 * tables with inline styles, and a plain text copy goes with each. Every value from the form is escaped.
 */
import { COMPANY } from '../src/site/legal.js';

const SITE = 'https://prism.mirdyne.com';

const C = {
    navy: '#061832',
    crimson: '#d12f49',
    accent: '#1d4c86',
    ink: '#161714',
    ink2: '#5f625e',
    paper: '#f8f7f1',
    rule: '#e4e0d6',
    onNavy: '#a8b7c9',
};
const FONT = "Arial, 'Helvetica Neue', Helvetica, sans-serif";
const MONO = "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace";

/** Our dark colours, for the clients that let us choose them. Classes carry them; inline styles are the light ones. */
const DARK = {
    page: '#030d1c',
    band: '#0b2447',
    card: '#0b1d36',
    quote: '#081629',
    rule: '#223a5c',
    ink: '#f1efe8',
    ink2: '#a8b7c9',
    accent: '#9fc0ea',
};
const STYLE = `<style>
:root { color-scheme: light dark; supported-color-schemes: light dark; }
@media (prefers-color-scheme: dark) {
  .m-page { background: ${DARK.page} !important; }
  .m-band { background: ${DARK.band} !important; }
  .m-card { background: ${DARK.card} !important; border-color: ${DARK.rule} !important; }
  .m-quote { background: ${DARK.quote} !important; }
  .m-rule { border-color: ${DARK.rule} !important; }
  .m-ink { color: ${DARK.ink} !important; }
  .m-ink2 { color: ${DARK.ink2} !important; }
  .m-accent { color: ${DARK.accent} !important; border-color: ${DARK.accent} !important; }
  .m-btn { background: #ffffff !important; }
  .m-btn a { color: ${C.navy} !important; }
}
[data-ogsb] .m-page { background: ${DARK.page} !important; }
[data-ogsb] .m-band { background: ${DARK.band} !important; }
[data-ogsb] .m-card { background: ${DARK.card} !important; }
[data-ogsb] .m-quote { background: ${DARK.quote} !important; }
[data-ogsb] .m-btn { background: #ffffff !important; }
[data-ogsc] .m-ink { color: ${DARK.ink} !important; }
[data-ogsc] .m-ink2 { color: ${DARK.ink2} !important; }
[data-ogsc] .m-accent { color: ${DARK.accent} !important; }
[data-ogsc] .m-btn a { color: ${C.navy} !important; }
</style>`;

type Lang = 'en' | 'de';

const esc = (v: string) =>
    v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

const link = (href: string, text: string, cls = 'm-accent', colour: string = C.accent) =>
    `<a class="${cls}" href="${esc(href)}" style="color:${colour};text-decoration:underline">${esc(text)}</a>`;

const label = (text: string, colour: string, cls: string) =>
    `<p class="${cls}" style="margin:0 0 10px;font:600 11px/16px ${FONT};letter-spacing:1.5px;text-transform:uppercase;color:${colour}">${esc(text)}</p>`;

const chips = (areas: string[]) =>
    areas
        .map(
            (a) =>
                `<span class="m-accent" style="display:inline-block;margin:0 6px 6px 0;padding:4px 11px;border:1px solid ${C.accent};border-radius:999px;color:${C.accent};font-size:13px;line-height:18px">${esc(a)}</span>`,
        )
        .join('');

const button = (href: string, text: string) =>
    `<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td class="m-btn" style="background:${C.navy};border-radius:6px"><a href="${esc(href)}" style="display:inline-block;padding:12px 22px;font:700 15px/20px ${FONT};color:#ffffff;text-decoration:none">${esc(text)}</a></td>
</tr></table>`;

/** The page every email shares: band with the logo, crimson rule, a white card, and a footer. */
function frame({ lang, title, preheader, tag, body, footer }: { lang: Lang; title: string; preheader: string; tag: string; body: string; footer: string }) {
    return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${esc(title)}</title>
${STYLE}
</head>
<body class="m-page" style="margin:0;padding:0;background:${C.paper}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="m-page" style="background:${C.paper}">
<tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;font-family:${FONT};color:${C.ink}">

<tr><td class="m-band" style="background:${C.navy};padding:22px 28px;border-radius:10px 10px 0 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td valign="middle"><a href="${SITE}${lang === 'de' ? '/de/' : '/'}" style="text-decoration:none"><img src="${SITE}/brand/mirdyne-lockup-white.png" width="124" height="34" alt="Mirdyne" style="display:block;border:0;width:124px;height:34px;color:#ffffff"></a></td>
<td valign="middle" align="right" style="font:600 11px/16px ${MONO};letter-spacing:1.5px;text-transform:uppercase;color:${C.onNavy}">PRISM<br><span style="color:#ffffff">${esc(tag)}</span></td>
</tr></table>
</td></tr>
<tr><td style="height:3px;line-height:3px;font-size:0;background:${C.crimson}">&nbsp;</td></tr>

<tr><td class="m-card" style="background:#ffffff;padding:30px 28px 28px;border:1px solid ${C.rule};border-top:0;border-radius:0 0 10px 10px">
${body}
</td></tr>

<tr><td class="m-ink2" style="padding:20px 28px 8px;font-size:12px;line-height:19px;color:${C.ink2}">
${footer}
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
        ['Role', m.role ? esc(m.role) : `<span class="m-ink2" style="color:${C.ink2}">not given</span>`],
        ['Interested in', esc(m.areas.join(', '))],
        ['Came from', m.from ? link(`${SITE}${m.from}`, m.from) : 'the form directly'],
        ['Language', german ? 'German: they used our German form' : 'English'],
        ['Received', `${esc(m.received)} (Berlin)`],
    ];

    const message = m.message
        ? `<tr><td style="padding:24px 0 0">
${label('Message', C.ink2, 'm-ink2')}
<div class="m-quote m-ink" style="padding:14px 16px;border-left:3px solid ${C.crimson};background:${C.paper};font-size:15px;line-height:23px;color:${C.ink};white-space:pre-wrap">${esc(m.message)}</div>
</td></tr>`
        : '';

    const body = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td>
${label('New enquiry', C.crimson, '')}
<h1 class="m-ink" style="margin:0;font:700 24px/30px ${FONT};color:${C.ink}">${esc(m.name)}</h1>
<p class="m-ink2" style="margin:4px 0 16px;font-size:16px;line-height:22px;color:${C.ink2}">${esc(who)}</p>
${chips(m.areas)}
</td></tr>
${message}
<tr><td style="padding:26px 0 4px">
${button(reply, `Reply to ${first}`)}
<p class="m-ink2" style="margin:10px 0 0;font-size:13px;line-height:19px;color:${C.ink2}">Or just press reply: this email answers ${esc(m.email)}.${german ? ' They wrote in German.' : ''}</p>
</td></tr>
<tr><td style="padding:24px 0 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="m-rule" style="border-top:1px solid ${C.rule}">
${details
    .map(
        ([k, v]) =>
            `<tr><td valign="top" class="m-rule m-ink2" style="padding:9px 16px 9px 0;border-bottom:1px solid ${C.rule};width:120px;font-size:13px;line-height:20px;color:${C.ink2}">${esc(k)}</td><td valign="top" class="m-rule m-ink" style="padding:9px 0;border-bottom:1px solid ${C.rule};font-size:14px;line-height:20px;color:${C.ink}">${v}</td></tr>`,
    )
    .join('\n')}
</table>
<p class="m-ink2" style="margin:14px 0 0;font-size:12px;line-height:18px;color:${C.ink2}">${esc(m.kept)}</p>
</td></tr>
</table>`;

    const footer = `<b class="m-ink" style="color:${C.ink}">PRISM by Mirdyne</b> · Sent by the Register interest form on ${link(`${SITE}/`, 'prism.mirdyne.com', 'm-ink2', C.ink2)}.<br>
We keep these details for twelve months, as our privacy policy says.<br>
${link(`${SITE}/`, 'Website', 'm-ink2', C.ink2)} · ${link(`${SITE}/impressum/`, 'Impressum', 'm-ink2', C.ink2)} · ${link(`${SITE}/privacy/`, 'Privacy', 'm-ink2', C.ink2)}`;

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
${label(w.kicker, C.crimson, '')}
<h1 class="m-ink" style="margin:0 0 12px;font:700 24px/30px ${FONT};color:${C.ink}">${esc(hello)}</h1>
<p class="m-ink" style="margin:0 0 20px;font-size:16px;line-height:24px;color:${C.ink}">${esc(w.have)} <b>${esc(c.email)}</b>.</p>
${label(w.topics, C.ink2, 'm-ink2')}
${chips(c.areas)}
</td></tr>
<tr><td style="padding:22px 0 0">
<p class="m-ink" style="margin:0 0 10px;font-size:15px;line-height:22px;color:${C.ink}">${esc(w.meanwhile)}</p>
${button(`${SITE}${w.pages[0][1]}`, w.pages[0][0])}
<p class="m-ink2" style="margin:12px 0 0;font-size:14px;line-height:22px;color:${C.ink2}">${w.pages
        .slice(1)
        .map(([text, path]) => link(`${SITE}${path}`, text))
        .join(' · ')}</p>
</td></tr>
<tr><td class="m-rule" style="padding:22px 0 0;border-bottom:0">
<p class="m-ink2 m-rule" style="margin:0;padding-top:18px;border-top:1px solid ${C.rule};font-size:13px;line-height:20px;color:${C.ink2}">${esc(w.keep)} ${link(privacy, w.privacyPolicy)}. ${esc(w.replyNote)}</p>
<p class="m-ink2" style="margin:10px 0 0;font-size:13px;line-height:20px;color:${C.ink2}">${esc(w.notYou)}</p>
</td></tr>
</table>`;

    const footer = `<b class="m-ink" style="color:${C.ink}">PRISM by Mirdyne</b><br>
${esc(legal)}${directors ? `<br>${esc(directors)}` : ''}<br>
${link(`${SITE}${root}`, w.links[0], 'm-ink2', C.ink2)} · ${link(`${SITE}${root}impressum/`, w.links[1], 'm-ink2', C.ink2)} · ${link(privacy, w.links[2], 'm-ink2', C.ink2)}`;

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
