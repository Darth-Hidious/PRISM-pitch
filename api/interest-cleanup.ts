import { del, list } from '@vercel/blob';

/**
 * Runs once a day (see `crons` in vercel.json). The form promises that details are deleted within twelve
 * months, so this deletes every submission older than that. Vercel sends CRON_SECRET with the request;
 * without it, nothing happens.
 */

const TWELVE_MONTHS = 365 * 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
    const secret = process.env.CRON_SECRET;
    if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return new Response('Unauthorized', { status: 401 });

    const cutoff = Date.now() - TWELVE_MONTHS;
    let cursor: string | undefined;
    let deleted = 0;
    do {
        const page = await list({ prefix: 'interest/', cursor, limit: 1000 });
        const old = page.blobs.filter((b) => new Date(b.uploadedAt).getTime() < cutoff).map((b) => b.url);
        if (old.length) {
            await del(old);
            deleted += old.length;
        }
        cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return Response.json({ deleted }, { headers: { 'Cache-Control': 'no-store' } });
}
