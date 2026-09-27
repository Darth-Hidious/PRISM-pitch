/**
 * The email one Register interest submission becomes: PRISM by Mirdyne's look (navy band, crimson rule,
 * paper ground), a button that answers the visitor, and links to the website, Impressum and privacy
 * policy. Email clients understand little CSS, so the layout is tables with inline styles, and a plain
 * text copy goes with it. Every value from the form is escaped.
 */

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

export interface InterestMail {
    name: string;
    email: string;
    organisation: string;
    role: string;
    /** The areas, as the form words them. */
    areas: string[];
    message: string;
    /** The page of our site the visitor came from, if any. */
    from: string;
    /** When it arrived, already written out for Berlin. */
    received: string;
    /** Where the stored copy is, or why there is none. */
    kept: string;
}

const esc = (v: string) =>
    v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

const link = (href: string, text: string, colour: string = C.accent) =>
    `<a href="${esc(href)}" style="color:${colour};text-decoration:underline">${esc(text)}</a>`;

export function interestMail(m: InterestMail) {
    const first = m.name.split(' ')[0] || m.name;
    const german = m.from.startsWith('/de/');
    const reply = `mailto:${m.email}?subject=${encodeURIComponent('Your interest in PRISM')}`;
    const subject = `PRISM enquiry: ${m.name}, ${m.organisation}`;
    const who = m.role ? `${m.role}, ${m.organisation}` : m.organisation;

    const details: [string, string][] = [
        ['Email', link(`mailto:${m.email}`, m.email)],
        ['Organisation', esc(m.organisation)],
        ['Role', m.role ? esc(m.role) : `<span style="color:${C.ink2}">not given</span>`],
        ['Interested in', esc(m.areas.join(', '))],
        ['Came from', m.from ? link(`${SITE}${m.from}`, m.from) : 'the form directly'],
        ['Language', german ? 'German: they used our German pages' : 'English'],
        ['Received', `${esc(m.received)} (Berlin)`],
    ];

    const chips = m.areas
        .map(
            (a) =>
                `<span style="display:inline-block;margin:0 6px 6px 0;padding:4px 11px;border:1px solid ${C.accent};border-radius:999px;color:${C.accent};font-size:13px;line-height:18px">${esc(a)}</span>`,
        )
        .join('');

    const message = m.message
        ? `<tr><td style="padding:24px 0 0">
<p style="margin:0 0 8px;font:600 11px/16px ${FONT};letter-spacing:1.5px;text-transform:uppercase;color:${C.ink2}">Message</p>
<div style="padding:14px 16px;border-left:3px solid ${C.crimson};background:${C.paper};font-size:15px;line-height:23px;color:${C.ink};white-space:pre-wrap">${esc(m.message)}</div>
</td></tr>`
        : '';

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${C.paper}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(`${m.name} (${m.organisation}) is interested in ${m.areas.join(', ')}.`)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper}">
<tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;font-family:${FONT};color:${C.ink}">

<tr><td style="background:${C.navy};padding:22px 28px;border-radius:10px 10px 0 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td valign="middle"><a href="${SITE}/" style="text-decoration:none"><img src="${SITE}/brand/mirdyne-lockup-white.png" width="124" height="34" alt="Mirdyne" style="display:block;border:0;width:124px;height:34px"></a></td>
<td valign="middle" align="right" style="font:600 11px/16px ${MONO};letter-spacing:1.5px;text-transform:uppercase;color:${C.onNavy}">PRISM<br><span style="color:#ffffff">Register interest</span></td>
</tr></table>
</td></tr>
<tr><td style="height:3px;line-height:3px;font-size:0;background:${C.crimson}">&nbsp;</td></tr>

<tr><td style="background:#ffffff;padding:30px 28px 28px;border:1px solid ${C.rule};border-top:0;border-radius:0 0 10px 10px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td>
<p style="margin:0 0 10px;font:600 11px/16px ${FONT};letter-spacing:1.5px;text-transform:uppercase;color:${C.crimson}">New enquiry</p>
<h1 style="margin:0;font:700 24px/30px ${FONT};color:${C.ink}">${esc(m.name)}</h1>
<p style="margin:4px 0 16px;font-size:16px;line-height:22px;color:${C.ink2}">${esc(who)}</p>
${chips}
</td></tr>
${message}
<tr><td style="padding:26px 0 4px">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="background:${C.navy};border-radius:6px"><a href="${esc(reply)}" style="display:inline-block;padding:12px 22px;font:700 15px/20px ${FONT};color:#ffffff;text-decoration:none">Reply to ${esc(first)}</a></td>
</tr></table>
<p style="margin:10px 0 0;font-size:13px;line-height:19px;color:${C.ink2}">Or just press reply: this email answers ${esc(m.email)}.${german ? ' They may prefer German.' : ''}</p>
</td></tr>
<tr><td style="padding:24px 0 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.rule}">
${details
    .map(
        ([k, v]) =>
            `<tr><td valign="top" style="padding:9px 16px 9px 0;border-bottom:1px solid ${C.rule};width:120px;font-size:13px;line-height:20px;color:${C.ink2}">${esc(k)}</td><td valign="top" style="padding:9px 0;border-bottom:1px solid ${C.rule};font-size:14px;line-height:20px;color:${C.ink}">${v}</td></tr>`,
    )
    .join('\n')}
</table>
<p style="margin:14px 0 0;font-size:12px;line-height:18px;color:${C.ink2}">${esc(m.kept)}</p>
</td></tr>
</table>
</td></tr>

<tr><td style="padding:20px 28px 8px;font-size:12px;line-height:19px;color:${C.ink2}">
<b style="color:${C.ink}">PRISM by Mirdyne</b> · Sent by the Register interest form on ${link(`${SITE}/`, 'prism.mirdyne.com', C.ink2)}.<br>
We keep these details for twelve months, as our privacy policy says.<br>
${link(`${SITE}/`, 'Website', C.ink2)} · ${link(`${SITE}/impressum/`, 'Impressum', C.ink2)} · ${link(`${SITE}/privacy/`, 'Privacy', C.ink2)}
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

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
