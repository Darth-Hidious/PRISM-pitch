/**
 * Scenes for the live painter (src/ds/livepaint.ts). Each draws one frame at
 * time `t` in seconds: a photograph with light that moves on it, or an
 * illustration drawn in code. The painter turns every frame into paint, so
 * shapes here are bold and simple; fine detail would only be smoothed away.
 * Nothing here shows programme data.
 */
import type { LiveScene } from '../ds/livepaint';

type Stop = [number, string];

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, stops: Stop[]) {
    if (r <= 0) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    for (const [o, c] of stops) g.addColorStop(o, c);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/** A repeatable pseudo-random value in [0, 1) for an integer key. */
function rnd(k: number) {
    let x = (k * 0x2c1b3c6d) ^ 0x297a2d39;
    x = Math.imul(x ^ (x >>> 15), 0x85ebca6b);
    x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
    return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

const smooth = (x: number) => {
    const c = Math.min(1, Math.max(0, x));
    return c * c * (3 - 2 * c);
};

const flicker = (t: number) => 0.9 + 0.06 * Math.sin(t * 23) + 0.04 * Math.sin(t * 37 + 1.3);

/**
 * Draws a photograph to cover the canvas around a focal point, with a slow
 * drift so a still photograph breathes. Returns the photo-to-canvas mapping.
 */
function cover(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    w: number,
    h: number,
    fx: number,
    fy: number,
    t: number,
    drift = 1,
) {
    const zoom = 1.045 + 0.015 * drift * Math.sin(t * 0.19);
    const s = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
    const dw = img.naturalWidth * s;
    const dh = img.naturalHeight * s;
    const px = 0.012 * drift * Math.sin(t * 0.13 + 1.1) * w;
    const py = 0.01 * drift * Math.cos(t * 0.11) * h;
    const dx = Math.min(0, Math.max(w - dw, (w - dw) * fx + px));
    const dy = Math.min(0, Math.max(h - dh, (h - dh) * fy + py));
    ctx.drawImage(img, dx, dy, dw, dh);
    return { s, at: (x: number, y: number) => [dx + x * s, dy + y * s] as const };
}

function missing(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = '#10213a';
    ctx.fillRect(0, 0, w, h);
}

/* ── The furnace: vacuum-arc melting, Project SPARK photograph ────────── */

/** The arc strikes every 6.5 s for about 0.9 s; returns its strength, 0 to 1. */
function arcAt(t: number) {
    const c = t % 6.5;
    if (c < 4.6 || c > 5.5) return 0;
    const x = (c - 4.6) / 0.9;
    // A fast strike, a flickering hold and a slower fade.
    return Math.min(1, x * 8) * (1 - smooth((x - 0.55) / 0.45)) * (0.82 + 0.18 * Math.sin(t * 90));
}

export const furnaceScene: LiveScene = {
    images: ['/img/spark-furnace.webp'],
    animated: true,
    direction: -16,
    detail: 0.65,
    draw(ctx, w, h, t, [img]) {
        if (!img) return missing(ctx, w, h);
        const { s, at } = cover(ctx, img, w, h, 0.5, 0.84, t, 0.8);
        const arc = arcAt(t);
        const fl = flicker(t);
        const [bx, by] = at(352, 668);
        const [ex, ey] = at(438, 470);
        ctx.globalCompositeOperation = 'lighter';
        // The molten button breathes, and flares while the arc is on it.
        glow(ctx, bx, by, 120 * s, [
            [0, `rgba(255,176,96,${0.3 * fl + 0.45 * arc})`],
            [0.35, `rgba(255,96,40,${0.16 * fl + 0.3 * arc})`],
            [1, 'rgba(255,70,30,0)'],
        ]);
        glow(ctx, bx, by, 48 * s, [
            [0, `rgba(255,236,190,${0.22 * fl + 0.5 * arc})`],
            [1, 'rgba(255,200,120,0)'],
        ]);
        if (arc > 0.01) {
            // The chamber lights up blue-white.
            glow(ctx, (ex + bx) / 2, (ey + by) / 2, 560 * s, [
                [0, `rgba(170,200,255,${0.42 * arc})`],
                [0.5, `rgba(120,160,230,${0.14 * arc})`],
                [1, 'rgba(120,160,230,0)'],
            ]);
            // The arc itself: a jagged path from the electrode tip to the button, re-drawn 24 times a second.
            const key = Math.floor(t * 24);
            const n = 9;
            const pts: [number, number][] = [];
            for (let i = 0; i <= n; i++) {
                const f = i / n;
                const j = i === 0 || i === n ? 0 : (rnd(key * 31 + i) - 0.5) * 26 * s * Math.sin(f * Math.PI);
                const x = ex + (bx - ex) * f;
                const y = ey + (by - 22 * s - ey) * f;
                const len = Math.hypot(bx - ex, by - ey) || 1;
                pts.push([x + ((by - ey) / len) * j, y - ((bx - ex) / len) * j]);
            }
            for (const [width, a] of [
                [14, 0.16],
                [6, 0.42],
                [2.2, 0.95],
            ] as const) {
                ctx.strokeStyle = `rgba(215,232,255,${a * arc})`;
                ctx.lineWidth = width * s;
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.beginPath();
                pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
                ctx.stroke();
            }
            glow(ctx, ex, ey, 70 * s, [
                [0, `rgba(235,244,255,${0.95 * arc})`],
                [0.3, `rgba(160,200,255,${0.45 * arc})`],
                [1, 'rgba(160,200,255,0)'],
            ]);
        }
        // Sparks thrown off the melt, each on its own ballistic path.
        for (let i = 0; i < 16; i++) {
            const life = 0.9 + rnd(i) * 0.9;
            const age = (t + rnd(i + 50) * 7) % 3.2;
            if (age > life) continue;
            const f = age / life;
            const vx = (rnd(i + 100) - 0.5) * 220;
            const vy = -120 - rnd(i + 200) * 160;
            const x = bx + (vx * age) * s;
            const y = by - 30 * s + (vy * age + 260 * age * age) * s;
            const a = (1 - f) * (0.35 + 0.65 * arc + 0.25 * fl - 0.25);
            if (a <= 0.02) continue;
            ctx.strokeStyle = `rgba(255,${190 + Math.round(50 * (1 - f))},120,${a})`;
            ctx.lineWidth = 2.4 * s;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - vx * 0.018 * s, y - (vy + 520 * age) * 0.018 * s);
            ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
    },
};

/* ── Raptor's first test firing, 25 September 2016 (SpaceX, CC0) ─────── */

/** The plume's centre line in the photograph, which runs slightly uphill. */
const plumeY = (x: number) => 557 - 0.027 * x;

export const raptorScene: LiveScene = {
    images: ['/img/raptor-test.webp'],
    animated: true,
    direction: 2,
    detail: 0.6,
    draw(ctx, w, h, t, [img]) {
        if (!img) return missing(ctx, w, h);
        const wide = w >= h;
        const { s, at } = cover(ctx, img, w, h, wide ? 0.5 : 0, wide ? 0 : 0.42, t, 0.5);
        const fl = flicker(t);
        ctx.globalCompositeOperation = 'lighter';
        // Hot gas flowing down the plume, fastest and whitest at the nozzle.
        for (let k = 0; k < 36; k++) {
            const ph = (k / 36 + t * 0.5) % 1;
            const x = 50 + ph * 1010;
            const y = plumeY(x) + Math.sin(k * 9.1 + t * 5.3) * (3 + 26 * ph);
            const [X, Y] = at(x, y);
            const r = (16 + 64 * ph) * s;
            const [R, G, B] = ph < 0.18 ? [255, 226, 244] : ph < 0.55 ? [255, 176, 160] : [255, 150, 96];
            glow(ctx, X, Y, r, [
                [0, `rgba(${R},${G},${B},${0.11 * (1 - 0.55 * ph) * fl})`],
                [1, `rgba(${R},${G},${B},0)`],
            ]);
        }
        // The Mach disk at the nozzle, and light thrown on the wet ground.
        const [nx, ny] = at(40, 557);
        glow(ctx, nx, ny, 46 * s, [
            [0, `rgba(225,236,255,${0.5 * fl})`],
            [0.4, `rgba(150,180,255,${0.22 * fl})`],
            [1, 'rgba(150,180,255,0)'],
        ]);
        const [gx, gy] = at(300, 770);
        glow(ctx, gx, gy, 300 * s, [
            [0, `rgba(255,170,120,${0.1 + 0.06 * Math.sin(t * 17)})`],
            [1, 'rgba(255,170,120,0)'],
        ]);
        // Sparks shed from the edges of the plume.
        for (let i = 0; i < 22; i++) {
            const life = 0.6 + rnd(i + 40) * 0.8;
            const age = (t + rnd(i + 90) * 4) % 1.9;
            if (age > life) continue;
            const f = age / life;
            const x0 = 150 + rnd(i + 130) * 760;
            const vx = 260 + rnd(i + 170) * 300;
            const vy = (rnd(i + 210) - 0.5) * 240;
            const [X, Y] = at(x0 + vx * age, plumeY(x0) + vy * age + 90 * age * age);
            ctx.strokeStyle = `rgba(255,${200 + Math.round(40 * (1 - f))},170,${0.7 * (1 - f)})`;
            ctx.lineWidth = 2 * s;
            ctx.beginPath();
            ctx.moveTo(X, Y);
            ctx.lineTo(X - vx * 0.03 * s, Y - vy * 0.03 * s);
            ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
        // Smoke rolling slowly away from the plume.
        for (let i = 0; i < 7; i++) {
            const drift = (t * 0.03 + rnd(i + 300)) % 1;
            const [X, Y] = at(480 + rnd(i + 330) * 560 + drift * 60, 260 + rnd(i + 360) * 360 - drift * 50);
            glow(ctx, X, Y, (90 + 60 * rnd(i + 390)) * s, [
                [0, `rgba(170,98,64,${0.07 * Math.sin(drift * Math.PI)})`],
                [1, 'rgba(170,98,64,0)'],
            ]);
        }
    },
};

/* ── Project SPARK laboratory photographs ─────────────────────────────── */

/** A small photograph from the lab, with light drifting slowly across it. */
function labPhoto(src: string, fx: number, fy: number): LiveScene {
    return {
        images: [src],
        animated: true,
        direction: -12,
        brush: 1.35,
        detail: 0.3,
        draw(ctx, w, h, t, [img]) {
            if (!img) return missing(ctx, w, h);
            cover(ctx, img, w, h, fx, fy, t, 0.8);
            ctx.globalCompositeOperation = 'soft-light';
            glow(ctx, w * (0.5 + 0.4 * Math.sin(t * 0.21)), h * 0.3, Math.max(w, h) * 0.6, [
                [0, 'rgba(255,244,226,0.5)'],
                [1, 'rgba(255,244,226,0)'],
            ]);
            ctx.globalCompositeOperation = 'source-over';
        },
    };
}

export const millScene = labPhoto('/img/spark-mill.webp', 0.5, 0.55);
export const melterScene = labPhoto('/img/spark-melter.webp', 0.5, 0.4);
export const polisherScene = labPhoto('/img/spark-polisher.webp', 0.6, 0.55);

/* ── Search landscape: a guided search walking down to the optimum ───── */

type P2 = [number, number];
const lerp2 = (a: P2, b: P2, f: number): P2 => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];

/** The red path in the landscape image, in its pixel coordinates. */
const SEARCH_PATH: P2[] = [
    [426, 160],
    [438, 245],
    [472, 326],
    [556, 378],
    [676, 398],
    [752, 424],
    [860, 448],
    [958, 466],
    [1066, 470],
    [1146, 520],
    [1166, 604],
    [1157, 706],
    [1149, 820],
    [1145, 928],
];
const SAMPLES: P2[] = [
    [698, 251],
    [932, 255],
    [668, 383],
    [320, 418],
    [823, 430],
    [349, 596],
    [959, 608],
    [724, 636],
    [220, 682],
];

function along(path: P2[], f: number): P2 {
    const seg = path.length - 1;
    const x = Math.min(seg - 1e-6, Math.max(0, f * seg));
    const i = Math.floor(x);
    return lerp2(path[i], path[i + 1], x - i);
}

function manifold(fx: number, fy: number, walk: boolean): LiveScene {
    return {
        images: ['/img/search-manifold.webp'],
        animated: true,
        direction: -8,
        detail: 0.55,
        draw(ctx, w, h, t, [img]) {
            if (!img) return missing(ctx, w, h);
            const { s, at } = cover(ctx, img, w, h, fx, fy, t, 1);
            // A slow wash of light across the surface.
            const lx = w * (0.5 + 0.45 * Math.sin(t * 0.23));
            ctx.globalCompositeOperation = 'soft-light';
            glow(ctx, lx, h * 0.35, Math.max(w, h) * 0.55, [
                [0, 'rgba(255,248,230,0.55)'],
                [1, 'rgba(255,248,230,0)'],
            ]);
            ctx.globalCompositeOperation = 'source-over';
            // Measurements light up one after another.
            SAMPLES.forEach(([x, y], i) => {
                const a = Math.max(0, Math.sin(t * 0.9 - i * 0.8)) ** 6;
                if (a < 0.02) return;
                const [X, Y] = at(x, y);
                glow(ctx, X, Y, 46 * s, [
                    [0, `rgba(60,110,230,${0.55 * a})`],
                    [1, 'rgba(60,110,230,0)'],
                ]);
            });
            if (!walk) return;
            // The walker: 9 s down the path, then a ring at the optimum.
            const cyc = t % 12;
            const f = smooth(cyc / 9);
            for (let k = 0; k < 14; k++) {
                const [X, Y] = at(...along(SEARCH_PATH, Math.max(0, f - k * 0.012)));
                glow(ctx, X, Y, (26 - k) * s, [
                    [0, `rgba(235,80,70,${0.5 * (1 - k / 14)})`],
                    [1, 'rgba(235,80,70,0)'],
                ]);
            }
            const [X, Y] = at(...along(SEARCH_PATH, f));
            ctx.fillStyle = '#e8483e';
            ctx.beginPath();
            ctx.arc(X, Y, 11 * s, 0, Math.PI * 2);
            ctx.fill();
            if (cyc > 9) {
                const a = (cyc - 9) / 3;
                ctx.strokeStyle = `rgba(232,72,62,${1 - a})`;
                ctx.lineWidth = 5 * s;
                ctx.beginPath();
                ctx.arc(X, Y, (14 + a * 90) * s, 0, Math.PI * 2);
                ctx.stroke();
            }
        },
    };
}

export const researchScene = manifold(0.4, 0.5, true);
export const contactScene = manifold(0.7, 0.5, false);

/* ── A polished alloy sample, Project SPARK photograph ────────────────── */

export const couponScene: LiveScene = {
    images: ['/img/spark-coupon.webp'],
    animated: true,
    direction: -24,
    brush: 1.2,
    detail: 0.35,
    draw(ctx, w, h, t, [img]) {
        if (!img) return missing(ctx, w, h);
        const { s, at } = cover(ctx, img, w, h, 0.5, 0.45, t, 0.7);
        const [cx, cy] = at(148, 163);
        const r = 19 * s;
        // A highlight sweeps across the polished face every 5 s.
        const c = (t % 5) / 5;
        const pos = -1.4 + c * 2.8;
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.95, 0, 0, Math.PI * 2);
        ctx.clip();
        const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
        const m = (pos + 1) / 2;
        g.addColorStop(Math.max(0, Math.min(1, m - 0.18)), 'rgba(255,255,255,0)');
        g.addColorStop(Math.max(0, Math.min(1, m)), 'rgba(255,255,255,0.75)');
        g.addColorStop(Math.max(0, Math.min(1, m + 0.18)), 'rgba(255,255,255,0)');
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = g;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
        ctx.restore();
        ctx.globalCompositeOperation = 'lighter';
        glow(ctx, cx, cy, r * 2.4, [
            [0, `rgba(220,230,245,${0.1 + 0.08 * Math.sin(t * 1.3)})`],
            [1, 'rgba(220,230,245,0)'],
        ]);
        ctx.globalCompositeOperation = 'source-over';
    },
};
