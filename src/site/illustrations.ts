/**
 * Scenes drawn in code for the painter (see src/ds/paint.ts). Each draws a
 * simple, high-contrast composition in brand colours; the painter turns it
 * into brush strokes. Keep them as module-level functions so their identity
 * is stable across renders.
 */

function canvas(w: number, h: number) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
}

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, stops: [number, string][]) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    for (const [o, c] of stops) g.addColorStop(o, c);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/** Autonomy: a lab robot arm lifting a glowing crucible towards a furnace port. */
export function autonomyScene(w: number, h: number) {
    const c = canvas(w, h);
    const ctx = c.getContext('2d')!;
    const u = Math.min(w, h * 1.4) / 100;

    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#061832');
    sky.addColorStop(0.62, '#1d3350');
    sky.addColorStop(1, '#0b1626');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Furnace body on the right with a hot port.
    const fx = w * 0.62;
    const fy = h * 0.2;
    ctx.fillStyle = '#2b3d55';
    ctx.fillRect(fx, fy, w * 0.34, h * 0.56);
    ctx.fillStyle = '#3c5372';
    ctx.fillRect(fx, fy, w * 0.34, h * 0.05);
    glow(ctx, fx + w * 0.17, fy + h * 0.28, 26 * u, [
        [0, 'rgba(255,214,150,1)'],
        [0.25, 'rgba(255,138,61,0.95)'],
        [0.6, 'rgba(209,47,73,0.35)'],
        [1, 'rgba(209,47,73,0)'],
    ]);
    ctx.fillStyle = '#ffcf8a';
    ctx.beginPath();
    ctx.ellipse(fx + w * 0.17, fy + h * 0.28, 7 * u, 5 * u, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bench.
    ctx.fillStyle = '#34465f';
    ctx.fillRect(0, h * 0.74, w, h * 0.26);
    ctx.fillStyle = '#9fb1c5';
    ctx.fillRect(0, h * 0.74, w, Math.max(2, 0.8 * u));

    // Arm: base, shoulder, upper arm, forearm, gripper.
    const bx = w * 0.2;
    const by = h * 0.74;
    const sx = bx;
    const sy = by - 14 * u;
    const ex = bx + 18 * u;
    const ey = sy - 26 * u;
    const wx = ex + 22 * u;
    const wy = ey + 10 * u;
    ctx.fillStyle = '#c2cbd7';
    ctx.fillRect(bx - 9 * u, by - 6 * u, 18 * u, 6 * u);
    ctx.lineCap = 'round';
    const limb = (x1: number, y1: number, x2: number, y2: number, wdt: number) => {
        ctx.strokeStyle = '#8d9cae';
        ctx.lineWidth = wdt + 1.6 * u;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.strokeStyle = '#e8edf3';
        ctx.lineWidth = wdt;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    };
    limb(bx, by - 5 * u, sx, sy, 9 * u);
    limb(sx, sy, ex, ey, 7.5 * u);
    limb(ex, ey, wx, wy, 6 * u);
    for (const [x, y, r] of [
        [sx, sy, 5.2],
        [ex, ey, 4.4],
        [wx, wy, 3.6],
    ] as const) {
        ctx.fillStyle = '#6f91ba';
        ctx.beginPath();
        ctx.arc(x, y, r * u, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#061832';
        ctx.beginPath();
        ctx.arc(x, y, r * 0.4 * u, 0, Math.PI * 2);
        ctx.fill();
    }
    // Gripper and crucible.
    ctx.strokeStyle = '#e8edf3';
    ctx.lineWidth = 2 * u;
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx + 2 * u, wy + 8 * u);
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx + 9 * u, wy + 6 * u);
    ctx.stroke();
    const cx = wx + 6 * u;
    const cy = wy + 11 * u;
    glow(ctx, cx, cy, 14 * u, [
        [0, 'rgba(255,190,110,0.95)'],
        [0.4, 'rgba(255,120,50,0.5)'],
        [1, 'rgba(255,120,50,0)'],
    ]);
    ctx.fillStyle = '#5f6b78';
    ctx.fillRect(cx - 4 * u, cy - 2 * u, 8 * u, 6 * u);
    ctx.fillStyle = '#ffb35c';
    ctx.fillRect(cx - 4 * u, cy - 2.6 * u, 8 * u, 1.6 * u);

    // Warm light spilling onto the bench.
    glow(ctx, fx + w * 0.1, h * 0.8, 40 * u, [
        [0, 'rgba(255,150,80,0.35)'],
        [1, 'rgba(255,150,80,0)'],
    ]);
    return c;
}

/** Harness: the orchestration loop, five stations on a lit ring. */
export function harnessLoop(w: number, h: number) {
    const c = canvas(w, h);
    const ctx = c.getContext('2d')!;
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#0c274a');
    bg.addColorStop(1, '#061832');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const cx = w * 0.5;
    const cy = h * 0.52;
    const rx = w * 0.34;
    const ry = h * 0.3;
    glow(ctx, cx, cy, Math.max(rx, ry) * 1.3, [
        [0, 'rgba(111,145,186,0.35)'],
        [1, 'rgba(111,145,186,0)'],
    ]);
    ctx.strokeStyle = 'rgba(194,203,215,0.9)';
    ctx.lineWidth = Math.max(3, w * 0.012);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, -0.12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(168,183,201,0.4)';
    ctx.lineWidth = Math.max(2, w * 0.004);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * 0.72, ry * 0.68, -0.12, 0, Math.PI * 2);
    ctx.stroke();

    const colours = ['#ffffff', '#6f91ba', '#2e8781', '#d12f49', '#a8b7c9'];
    for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
        const x = cx + rx * Math.cos(a) * Math.cos(-0.12) - ry * Math.sin(a) * Math.sin(-0.12);
        const y = cy + rx * Math.cos(a) * Math.sin(-0.12) + ry * Math.sin(a) * Math.cos(-0.12);
        const r = Math.max(10, w * 0.045);
        glow(ctx, x, y, r * 2.2, [
            [0, colours[i]],
            [0.45, colours[i] + '66'],
            [1, colours[i] + '00'],
        ]);
        ctx.fillStyle = colours[i];
        ctx.beginPath();
        ctx.arc(x, y, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
    }
    return c;
}

/** Evidence: a lineage chain from requirement (top) to decision (bottom). */
export function evidenceLineage(w: number, h: number) {
    const c = canvas(w, h);
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#f8f7f1';
    ctx.fillRect(0, 0, w, h);
    glow(ctx, w * 0.62, h * 0.45, Math.max(w, h) * 0.55, [
        [0, 'rgba(111,145,186,0.55)'],
        [0.6, 'rgba(182,193,207,0.25)'],
        [1, 'rgba(248,247,241,0)'],
    ]);

    const n = 6;
    const x0 = w * 0.3;
    const cardW = w * 0.42;
    const cardH = h * 0.1;
    const gap = (h * 0.84 - n * cardH) / (n - 1);
    ctx.strokeStyle = '#6f91ba';
    ctx.lineWidth = Math.max(2, w * 0.006);
    ctx.beginPath();
    ctx.moveTo(x0 + cardW * 0.12, h * 0.08);
    ctx.lineTo(x0 + cardW * 0.12, h * 0.92);
    ctx.stroke();
    for (let i = 0; i < n; i++) {
        const y = h * 0.08 + i * (cardH + gap);
        const last = i === n - 1;
        ctx.fillStyle = last ? '#061832' : '#ffffff';
        ctx.fillRect(x0, y, cardW, cardH);
        ctx.strokeStyle = last ? '#061832' : '#d4cfc4';
        ctx.lineWidth = Math.max(1.5, w * 0.003);
        ctx.strokeRect(x0, y, cardW, cardH);
        ctx.fillStyle = last ? '#ffffff' : ['#1d4c86', '#1d4c86', '#2e8781', '#2e8781', '#d12f49'][i];
        ctx.fillRect(x0 + cardW * 0.06, y + cardH * 0.3, cardH * 0.4, cardH * 0.4);
        ctx.fillStyle = last ? '#b6c1cf' : '#5f625e';
        ctx.fillRect(x0 + cardW * 0.22, y + cardH * 0.38, cardW * (0.5 - (i % 3) * 0.08), cardH * 0.22);
    }
    return c;
}
