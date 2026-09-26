import { put } from '@vercel/blob';

/**
 * Register interest. Checks a submission from the form at /interest/ and keeps it as one private JSON
 * file in the project's Blob store, in Frankfurt. Nothing else is kept: no IP address, no cookies.
 * The areas below must match the form (src/site/Interest.tsx).
 */

const AREAS = ['material', 'deployment', 'supply', 'research', 'partnership', 'investment', 'other'];
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
    try {
        await put(
            `interest/${stamp.slice(0, 7)}/${stamp}-${slug(entry.organisation) || 'submission'}.json`,
            JSON.stringify({ receivedAt: at.toISOString(), ...entry, consent: true }, null, 2),
            { access: 'private', contentType: 'application/json', addRandomSuffix: true },
        );
    } catch (err) {
        console.error('interest: could not store a submission:', err instanceof Error ? err.message : err);
        return reply(500, { ok: false, error: 'We could not save your message. Please try again in a moment.' });
    }
    return reply(201, { ok: true });
}
