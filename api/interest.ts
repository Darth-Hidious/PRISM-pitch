import { put } from '@vercel/blob';
import { waitUntil } from '@vercel/functions';
import { createTransport } from 'nodemailer';

/**
 * Register interest. Checks a submission from the form at /interest/, keeps it as one private JSON file
 * in the project's Blob store in Frankfurt, and emails it to info@mirdyne.com through our own Zoho
 * mailbox, with the visitor as the reply-to address. Nothing else is kept: no IP address, no cookies.
 * The areas below must match the form (src/site/Interest.tsx).
 *
 * The email needs SMTP_PASS (an app password for the sending mailbox) in the project's environment.
 * Optional: SMTP_USER (default info@mirdyne.com), SMTP_HOST (default smtppro.zoho.eu, Zoho's server for
 * paid company plans; smtp.zoho.eu on the free plan), SMTP_PORT (default 465), INTEREST_MAIL_TO
 * (default info@mirdyne.com) and INTEREST_MAIL_FROM (default: SMTP_USER).
 */

/** Each area, as the form words it. */
const AREA_NAMES: Record<string, string> = {
    material: 'A new material for a part',
    deployment: 'PRISM on our programme',
    supply: 'Supply of a qualified material',
    research: 'Research collaboration',
    partnership: 'Partnership',
    investment: 'Investment',
    other: 'Something else',
};
const AREAS = Object.keys(AREA_NAMES);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX = { name: 120, email: 254, organisation: 160, role: 120, message: 3000, from: 200 };

type Problem = { field: string; error: string };

const reply = (status: number, body: Record<string, unknown>) =>
    Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/** One line of text: spaces collapsed, ends trimmed. */
const line = (v: unknown) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '');

/** Free text: line breaks kept, at most one blank line in a row. */
const para = (v: unknown) =>
    typeof v === 'string'
        ? v
              .replace(/\r\n?/g, '\n')
              .replace(/[^\S\n]+/g, ' ')
              .replace(/\n{3,}/g, '\n\n')
              .trim()
        : '';

/** A short, safe piece of the file name, so the store is easy to browse. */
const slug = (v: string) =>
    v
        .normalize('NFKD')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, '-')
        .slice(0, 40)
        .replace(/-+$/, '');

/** Only our own pages may send the form. */
function sameSite(request: Request) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
    if (!origin || !host) return false;
    try {
        return new URL(origin).host === host;
    } catch {
        return false;
    }
}

function check(body: Record<string, unknown>) {
    const entry = {
        name: line(body.name),
        email: line(body.email).toLowerCase(),
        organisation: line(body.organisation),
        role: line(body.role),
        areas: Array.isArray(body.areas) ? [...new Set(body.areas.filter((a): a is string => typeof a === 'string'))] : [],
        message: para(body.message),
        // The page they came from on our site, if any.
        from: line(body.from).startsWith('/') ? line(body.from) : '',
    };
    const problems: Problem[] = [];
    if (entry.name.length < 2) problems.push({ field: 'name', error: 'Please enter your name.' });
    else if (entry.name.length > MAX.name) problems.push({ field: 'name', error: `Please keep your name under ${MAX.name} characters.` });
    if (!EMAIL.test(entry.email) || entry.email.length > MAX.email)
        problems.push({ field: 'email', error: 'Please enter a valid email address, like name@company.com.' });
    if (!entry.organisation) problems.push({ field: 'organisation', error: 'Please enter your organisation.' });
    else if (entry.organisation.length > MAX.organisation)
        problems.push({ field: 'organisation', error: `Please keep this under ${MAX.organisation} characters.` });
    if (entry.role.length > MAX.role) problems.push({ field: 'role', error: `Please keep this under ${MAX.role} characters.` });
    if (entry.areas.length === 0 || entry.areas.some((a) => !AREAS.includes(a)))
        problems.push({ field: 'areas', error: 'Please choose at least one.' });
    if (entry.message.length > MAX.message)
        problems.push({ field: 'message', error: `Please keep your message under ${MAX.message} characters.` });
    if (body.consent !== true) problems.push({ field: 'consent', error: 'Please agree, so that we can keep your details and reply.' });
    entry.from = entry.from.slice(0, MAX.from);
    return { entry, problems };
}

export async function POST(request: Request) {
    if (!sameSite(request)) return reply(403, { ok: false, error: 'Please use the form on our website.' });
    if (!(request.headers.get('content-type') ?? '').includes('application/json'))
        return reply(415, { ok: false, error: 'Please use the form on our website.' });

    const raw = await request.text();
    if (raw.length > 20_000) return reply(413, { ok: false, error: 'That is too long to send. Please shorten your message.' });
    let body: unknown;
    try {
        body = JSON.parse(raw);
    } catch {
        return reply(400, { ok: false, error: 'Please use the form on our website.' });
    }
    if (!body || typeof body !== 'object' || Array.isArray(body))
        return reply(400, { ok: false, error: 'Please use the form on our website.' });
    const data = body as Record<string, unknown>;

    // Bots fill the hidden field, or send the form within two seconds of opening it. Thank them; keep nothing.
    if (line(data.website) || !(Number(data.elapsed) >= 2000)) return reply(200, { ok: true });

    const { entry, problems } = check(data);
    if (problems.length) return reply(422, { ok: false, error: problems[0].error, field: problems[0].field, problems });

    const at = new Date();
    const stamp = at.toISOString().replace(/[:.]/g, '-');
    let saved: string | null = null;
    try {
        const blob = await put(
            `interest/${stamp.slice(0, 7)}/${stamp}-${slug(entry.organisation) || 'submission'}.json`,
            JSON.stringify({ receivedAt: at.toISOString(), ...entry, consent: true }, null, 2),
            { access: 'private', contentType: 'application/json', addRandomSuffix: true },
        );
        saved = blob.pathname;
    } catch (err) {
        console.error('interest: could not store a submission:', why(err));
    }

    if (saved) {
        // Saved: the visitor gets their answer now, and the email goes out after it.
        waitUntil(mail(entry, at, saved).catch((err) => console.error('interest: could not email a submission:', why(err))));
        return reply(201, { ok: true });
    }
    // Not saved: the email is the only copy, so it has to go before we say thank you.
    try {
        if ((await mail(entry, at, null)) === 'sent') return reply(201, { ok: true });
    } catch (err) {
        console.error('interest: could not email a submission either:', why(err));
    }
    return reply(500, { ok: false, error: 'We could not save your message. Please try again in a moment.' });
}

const why = (err: unknown) => (err instanceof Error ? err.message : String(err));

type Entry = ReturnType<typeof check>['entry'];

const esc = (v: string) =>
    v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

/**
 * Emails one submission to our inbox. Replying to the email answers the visitor. Returns 'off' when no
 * mail password is set, so the site works (storing only) before the mailbox is connected.
 */
async function mail(entry: Entry, at: Date, saved: string | null): Promise<'sent' | 'off'> {
    const pass = process.env.SMTP_PASS;
    if (!pass) {
        console.warn('interest: SMTP_PASS is not set, so no email was sent.');
        return 'off';
    }
    const user = process.env.SMTP_USER || 'info@mirdyne.com';
    const port = Number(process.env.SMTP_PORT) || 465;
    const transport = createTransport({
        host: process.env.SMTP_HOST || 'smtppro.zoho.eu',
        port,
        secure: port === 465,
        auth: { user, pass },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 12000,
    });
    const when = at.toLocaleString('en-GB', { timeZone: 'Europe/Berlin', dateStyle: 'long', timeStyle: 'short' });
    const rows: [string, string][] = [
        ['Name', entry.name],
        ['Email', entry.email],
        ['Organisation', entry.organisation],
        ['Role', entry.role || '(not given)'],
        ['Interested in', entry.areas.map((a) => AREA_NAMES[a] ?? a).join(', ')],
        ['Sent from', entry.from ? `the page ${entry.from}` : 'the form directly'],
        ['Received', `${when} (Berlin)`],
    ];
    const kept = saved
        ? `A copy is kept in the prism-interest store on Vercel: ${saved}`
        : 'The store on Vercel could not save it, so this email is the only copy.';
    const text = [
        ...rows.map(([k, v]) => `${k}: ${v}`),
        '',
        'Message:',
        entry.message || '(none)',
        '',
        `Reply to this email to answer ${entry.name}.`,
        kept,
    ].join('\n');
    const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#161714">
<p style="margin:0 0 16px;font-size:18px"><b>New interest from ${esc(entry.name)}</b>, ${esc(entry.organisation)}</p>
<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">
${rows.map(([k, v]) => `<tr><td style="padding:4px 20px 4px 0;color:#5f625e;vertical-align:top">${esc(k)}</td><td style="padding:4px 0">${esc(v)}</td></tr>`).join('\n')}
</table>
<p style="margin:20px 0 6px;color:#5f625e">Message</p>
<p style="margin:0;white-space:pre-wrap">${esc(entry.message || '(none)')}</p>
<p style="margin:24px 0 0;font-size:13px;color:#5f625e">Reply to this email to answer ${esc(entry.name)}. ${esc(kept)}</p>
</div>`;
    await transport.sendMail({
        from: { name: 'PRISM website', address: process.env.INTEREST_MAIL_FROM || user },
        to: process.env.INTEREST_MAIL_TO || 'info@mirdyne.com',
        replyTo: { name: entry.name, address: entry.email },
        subject: `Register interest: ${entry.name}, ${entry.organisation}`,
        text,
        html,
    });
    return 'sent';
}
