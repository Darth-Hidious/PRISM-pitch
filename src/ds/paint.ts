/**
 * Painterly renderer: turns a photograph into gouache-like brush strokes.
 *
 * The approach follows Hertzmann's "Painterly Rendering with Curved Brush
 * Strokes of Multiple Sizes" (SIGGRAPH 1998): strokes are laid from large to
 * small, each one follows a flow field and stops when the photo's colour
 * departs from its own. The flow field blends the image's edge tangents
 * (from a smoothed structure tensor, so strokes wrap around forms) with one
 * global motion direction (so open areas smear, like concept-art speed
 * streaks). Everything is driven by a seeded generator: the same photo, size
 * and seed always produce the same painting.
 */

export interface PaintOptions {
    /** Seed for the stroke generator. */
    seed?: number;
    /** Global motion direction in degrees (0 = left to right, negative = rising). */
    direction?: number;
    /** 0–1: how strongly open areas smear along `direction`. */
    motion?: number;
    /** Multiplies stroke counts of the detail layers. */
    detail?: number;
    /** Where the cover-fit crop sits, 0–1 on each axis. */
    focusX?: number;
    focusY?: number;
}

export interface Stroke {
    points: number[]; // x0, y0, x1, y1, … in canvas pixels
    width: number;
    color: string;
    bristles: { dx: number; dy: number; width: number; color: string }[];
}

export interface PaintPlan {
    width: number;
    height: number;
    base: HTMLCanvasElement;
    layers: Stroke[][];
}

function mulberry32(seed: number) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Box blur of a float field, separable, radius r, in place via a scratch buffer. */
function boxBlur(src: Float32Array, w: number, h: number, r: number) {
    const tmp = new Float32Array(src.length);
    const win = 2 * r + 1;
    for (let y = 0; y < h; y++) {
        let acc = 0;
        for (let x = -r; x <= r; x++) acc += src[y * w + Math.min(w - 1, Math.max(0, x))];
        for (let x = 0; x < w; x++) {
            tmp[y * w + x] = acc / win;
            const add = Math.min(w - 1, x + r + 1);
            const sub = Math.max(0, x - r);
            acc += src[y * w + add] - src[y * w + sub];
        }
    }
    for (let x = 0; x < w; x++) {
        let acc = 0;
        for (let y = -r; y <= r; y++) acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
        for (let y = 0; y < h; y++) {
            src[y * w + x] = acc / win;
            const add = Math.min(h - 1, y + r + 1);
            const sub = Math.max(0, y - r);
            acc += tmp[add * w + x] - tmp[sub * w + x];
        }
    }
}

/** Draws `img` into a w×h canvas with a cover-fit crop around the focus point. */
function coverInto(img: CanvasImageSource & { width: number; height: number }, w: number, h: number, fx: number, fy: number) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d')!;
    const iw = img.width;
    const ih = img.height;
    const scale = Math.max(w / iw, h / ih);
    const sw = w / scale;
    const sh = h / scale;
    const sx = (iw - sw) * fx;
    const sy = (ih - sh) * fy;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    return c;
}

function clamp(v: number, lo: number, hi: number) {
    return v < lo ? lo : v > hi ? hi : v;
}

/**
 * Plans every stroke for a painting of `width`×`height` canvas pixels.
 * Planning is separate from drawing so the drawing can be spread over frames.
 */
export function planPainting(
    img: CanvasImageSource & { width: number; height: number },
    width: number,
    height: number,
    opts: PaintOptions = {},
): PaintPlan {
    const { seed = 7, direction = -12, motion = 0.6, detail = 1, focusX = 0.5, focusY = 0.5 } = opts;
    const rand = mulberry32(seed);

    // Sample the photo at a working resolution; strokes are planned there and scaled.
    const sw = 420;
    const sh = Math.max(2, Math.round((sw * height) / width));
    const sample = coverInto(img, sw, sh, focusX, focusY);
    const px = sample.getContext('2d')!.getImageData(0, 0, sw, sh).data;
    const n = sw * sh;

    // Luminance and a softened copy of the colour for the broad layers.
    const L = new Float32Array(n);
    const R = new Float32Array(n);
    const G = new Float32Array(n);
    const B = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        R[i] = px[i * 4];
        G[i] = px[i * 4 + 1];
        B[i] = px[i * 4 + 2];
        L[i] = 0.2126 * R[i] + 0.7152 * G[i] + 0.0722 * B[i];
    }
    const Rs = R.slice();
    const Gs = G.slice();
    const Bs = B.slice();
    boxBlur(Rs, sw, sh, 2);
    boxBlur(Gs, sw, sh, 2);
    boxBlur(Bs, sw, sh, 2);

    // Structure tensor from Sobel gradients, smoothed so strokes flow coherently.
    const Jxx = new Float32Array(n);
    const Jxy = new Float32Array(n);
    const Jyy = new Float32Array(n);
    const mag = new Float32Array(n);
    for (let y = 1; y < sh - 1; y++) {
        for (let x = 1; x < sw - 1; x++) {
            const i = y * sw + x;
            const gx =
                -L[i - sw - 1] - 2 * L[i - 1] - L[i + sw - 1] + L[i - sw + 1] + 2 * L[i + 1] + L[i + sw + 1];
            const gy =
                -L[i - sw - 1] - 2 * L[i - sw] - L[i - sw + 1] + L[i + sw - 1] + 2 * L[i + sw] + L[i + sw + 1];
            Jxx[i] = gx * gx;
            Jxy[i] = gx * gy;
            Jyy[i] = gy * gy;
            mag[i] = Math.sqrt(gx * gx + gy * gy);
        }
    }
    boxBlur(Jxx, sw, sh, 4);
    boxBlur(Jxy, sw, sh, 4);
    boxBlur(Jyy, sw, sh, 4);
    const magS = mag.slice();
    boxBlur(magS, sw, sh, 2);
    let magMax = 1;
    for (let i = 0; i < n; i++) if (magS[i] > magMax) magMax = magS[i];

    const g = (direction * Math.PI) / 180;
    const gcos = Math.cos(2 * g);
    const gsin = Math.sin(2 * g);

    // Low-frequency wobble so parallel strokes do not look ruled.
    const wobble = (x: number, y: number) =>
        0.35 * Math.sin(x * 0.021 + seed) * Math.cos(y * 0.017 - seed * 0.5) + 0.2 * Math.sin((x + y) * 0.009 + seed * 1.3);

    /** Stroke orientation at a sample-space point, blending edge tangent and motion. */
    const flow = (sx: number, sy: number) => {
        const xi = clamp(Math.round(sx), 0, sw - 1);
        const yi = clamp(Math.round(sy), 0, sh - 1);
        const i = yi * sw + xi;
        const a = Jxx[i];
        const b = Jxy[i];
        const d = Jyy[i];
        const tr = a + d;
        const det = Math.sqrt((a - d) * (a - d) + 4 * b * b);
        const coherence = tr > 1e-6 ? det / tr : 0;
        // Doubled-angle vector of the edge tangent (perpendicular to the gradient).
        const tx = -(a - d) / (det || 1);
        const ty = (-2 * b) / (det || 1);
        const w = clamp(coherence * 1.4, 0, 1) * (1 - motion * 0.55);
        const vx = w * tx + (1 - w) * gcos;
        const vy = w * ty + (1 - w) * gsin;
        return 0.5 * Math.atan2(vy, vx) + wobble(sx, sy) * (1 - w);
    };

    const scale = width / sw;
    const toHex = (r: number, gg: number, b: number) =>
        `rgb(${clamp(Math.round(r), 0, 255)},${clamp(Math.round(gg), 0, 255)},${clamp(Math.round(b), 0, 255)})`;

    interface LayerSpec {
        radius: number; // in sample pixels
        density: number; // strokes per radius² of area
        maxLen: number;
        minLen: number;
        threshold: number; // colour distance that ends a stroke
        edgeOnly: number; // 0 = everywhere, otherwise minimum normalised edge strength
        soft: boolean; // sample the softened colour
        alpha: number;
        bristles: number;
    }

    const specs: LayerSpec[] = [
        { radius: 9, density: 0.55, minLen: 5, maxLen: 14, threshold: 70, edgeOnly: 0, soft: true, alpha: 0.9, bristles: 2 },
        { radius: 4.2, density: 0.7 * detail, minLen: 4, maxLen: 16, threshold: 46, edgeOnly: 0, soft: true, alpha: 0.85, bristles: 3 },
        { radius: 1.9, density: 1.1 * detail, minLen: 3, maxLen: 12, threshold: 30, edgeOnly: 0.12, soft: false, alpha: 0.9, bristles: 2 },
        { radius: 0.9, density: 1.2 * detail, minLen: 2, maxLen: 7, threshold: 22, edgeOnly: 0.3, soft: false, alpha: 0.95, bristles: 0 },
    ];

    const layers: Stroke[][] = [];
    for (const spec of specs) {
        const strokes: Stroke[] = [];
        const cell = spec.radius * 1.6;
        const count = Math.round(((sw * sh) / (cell * cell)) * spec.density);
        const Rc = spec.soft ? Rs : R;
        const Gc = spec.soft ? Gs : G;
        const Bc = spec.soft ? Bs : B;
        for (let k = 0; k < count; k++) {
            const x0 = rand() * (sw - 1);
            const y0 = rand() * (sh - 1);
            const i0 = Math.round(y0) * sw + Math.round(x0);
            const edge = magS[i0] / magMax;
            if (spec.edgeOnly > 0 && edge < spec.edgeOnly * (0.6 + rand() * 0.8)) continue;

            const jitter = 1 + (rand() - 0.5) * 0.12;
            const cr = Rc[i0] * jitter;
            const cg = Gc[i0] * jitter;
            const cb = Bc[i0] * jitter;

            let theta = flow(x0, y0);
            // Pick the stroke's travel direction along the orientation at random.
            let dirX = Math.cos(theta);
            let dirY = Math.sin(theta);
            if (rand() < 0.5) {
                dirX = -dirX;
                dirY = -dirY;
            }
            const len = spec.minLen + Math.floor(rand() * (spec.maxLen - spec.minLen + 1));
            const step = spec.radius * 0.9;
            const pts = [x0 * scale, y0 * scale];
            let x = x0;
            let y = y0;
            for (let s = 0; s < len; s++) {
                theta = flow(x, y);
                let nx = Math.cos(theta);
                let ny = Math.sin(theta);
                if (nx * dirX + ny * dirY < 0) {
                    nx = -nx;
                    ny = -ny;
                }
                // Inertia keeps curves smooth.
                dirX = dirX * 0.55 + nx * 0.45;
                dirY = dirY * 0.55 + ny * 0.45;
                const dl = Math.hypot(dirX, dirY) || 1;
                dirX /= dl;
                dirY /= dl;
                x += dirX * step;
                y += dirY * step;
                if (x < 0 || y < 0 || x > sw - 1 || y > sh - 1) break;
                const i = Math.round(y) * sw + Math.round(x);
                const dr = Rc[i] - cr;
                const dg = Gc[i] - cg;
                const db = Bc[i] - cb;
                if (s >= spec.minLen && Math.sqrt(dr * dr + dg * dg + db * db) > spec.threshold) break;
                pts.push(x * scale, y * scale);
            }
            if (pts.length < 4) continue;

            const width = spec.radius * 2 * scale * (0.75 + rand() * 0.45);
            const bristles = [];
            for (let bI = 0; bI < spec.bristles; bI++) {
                const off = (rand() - 0.5) * width * 0.6;
                const shade = 1 + (rand() - 0.5) * 0.22;
                bristles.push({
                    dx: -dirY * off,
                    dy: dirX * off,
                    width: width * (0.12 + rand() * 0.16),
                    color: `rgba(${clamp(Math.round(cr * shade), 0, 255)},${clamp(Math.round(cg * shade), 0, 255)},${clamp(
                        Math.round(cb * shade),
                        0,
                        255,
                    )},0.55)`,
                });
            }
            strokes.push({
                points: pts,
                width,
                color: spec.alpha >= 1 ? toHex(cr, cg, cb) : `rgba(${clamp(Math.round(cr), 0, 255)},${clamp(Math.round(cg), 0, 255)},${clamp(Math.round(cb), 0, 255)},${spec.alpha})`,
                bristles,
            });
        }
        layers.push(strokes);
    }

    // Underpainting: the photo, heavily softened, so no bare canvas shows between strokes.
    const base = document.createElement('canvas');
    base.width = width;
    base.height = height;
    const bctx = base.getContext('2d')!;
    bctx.filter = `blur(${Math.round(width / 90)}px) saturate(1.1)`;
    bctx.drawImage(sample, -width * 0.02, -height * 0.02, width * 1.04, height * 1.04);
    bctx.filter = 'none';

    return { width, height, base, layers };
}

function tracePath(ctx: CanvasRenderingContext2D, pts: number[], dx = 0, dy = 0) {
    ctx.beginPath();
    ctx.moveTo(pts[0] + dx, pts[1] + dy);
    if (pts.length === 4) {
        ctx.lineTo(pts[2] + dx, pts[3] + dy);
        return;
    }
    for (let i = 2; i < pts.length - 2; i += 2) {
        const mx = (pts[i] + pts[i + 2]) / 2;
        const my = (pts[i + 1] + pts[i + 3]) / 2;
        ctx.quadraticCurveTo(pts[i] + dx, pts[i + 1] + dy, mx + dx, my + dy);
    }
    ctx.lineTo(pts[pts.length - 2] + dx, pts[pts.length - 1] + dy);
}

export function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.width;
    tracePath(ctx, s.points);
    ctx.stroke();
    for (const b of s.bristles) {
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.width;
        tracePath(ctx, s.points, b.dx, b.dy);
        ctx.stroke();
    }
}

/** A faint grain laid over the finished painting so it reads as a surface, not a filter. */
export function drawGrain(ctx: CanvasRenderingContext2D, width: number, height: number, seed: number) {
    const rand = mulberry32(seed ^ 0x9e3779b9);
    const tile = document.createElement('canvas');
    tile.width = 96;
    tile.height = 96;
    const tctx = tile.getContext('2d')!;
    const img = tctx.createImageData(96, 96);
    for (let i = 0; i < img.data.length; i += 4) {
        const v = 110 + rand() * 60;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 34;
    }
    tctx.putImageData(img, 0, 0);
    const pattern = ctx.createPattern(tile, 'repeat');
    if (!pattern) return;
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
}
