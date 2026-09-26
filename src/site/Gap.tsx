import { useEffect, useRef, useState } from 'react';
import { fitCanvas, seeded, useInView, useReducedMotion } from './hooks';
import { Grain, Idx, Note, Rails, Words } from './ui';

/* ── The problem: far too many alloys to make them all ────────────────── */

/*
 * Every number here is arithmetic, not anyone's result. Choose five of nine
 * metals that all melt above 1,650 °C (126 ways) and mix them in whole
 * percent, each at least 1 % (C(99, 4) = 3,764,376 ways).
 */
const ALLOYS = 126 * 3_764_376; // 474,311,376
const PER_DAY = 10;
const YEARS = ALLOYS / PER_DAY / 365.25; // 129,859
const YEARS_SHOWN = Math.round(YEARS / 10_000) * 10_000; // 130,000
/** One dot stands for 20,000 possible alloys, so the field holds the count to scale. */
const PER_DOT = 20_000;
const N = Math.round(ALLOYS / PER_DOT); // 23,716
const YEARS_PER_DOT = PER_DOT / PER_DAY / 365.25; // about 5.5

const fmt = (v: number) => v.toLocaleString('en-GB');

interface Field {
    x: Float32Array;
    y: Float32Array;
    delay: Float32Array;
    one: number; // the dot that stands for a few years of lab work
    path: number[]; // an illustrative guided search, dot indices in order
}

/** Builds the dot field once: clustered like families of alloys. Layout is illustrative. */
function buildField(): Field {
    const rand = seeded(2026);
    const gauss = () => {
        const u = Math.max(1e-9, rand());
        const v = rand();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    const clusters = Array.from({ length: 14 }, () => ({
        cx: 0.14 + rand() * 0.72,
        cy: 0.16 + rand() * 0.68,
        sx: 0.02 + rand() * 0.07,
        sy: 0.02 + rand() * 0.055,
        w: 0.25 + rand(),
    }));
    const total = clusters.reduce((s, c) => s + c.w, 0);
    const x = new Float32Array(N);
    const y = new Float32Array(N);
    for (let i = 0; i < N; i++) {
        let px = -1;
        let py = -1;
        // Resample anything outside the field rather than clamping it, so no edge lines form.
        while (px < 0 || px > 1 || py < 0 || py > 1 || (px - 0.5) ** 2 / 0.25 + (py - 0.5) ** 2 / 0.25 > 1) {
            if (rand() < 0.22) {
                px = 0.5 + gauss() * 0.2;
                py = 0.5 + gauss() * 0.19;
            } else {
                let r = rand() * total;
                let c = clusters[0];
                for (const k of clusters) {
                    r -= k.w;
                    if (r <= 0) {
                        c = k;
                        break;
                    }
                }
                px = c.cx + gauss() * c.sx;
                py = c.cy + gauss() * c.sy;
            }
        }
        x[i] = px;
        y[i] = py;
    }
    const nearest = (nx: number, ny: number, skip: number[]) => {
        let best = 0;
        let bd = Infinity;
        for (let i = 0; i < N; i++) {
            const d = (x[i] - nx) ** 2 + (y[i] - ny) ** 2;
            if (d < bd && !skip.includes(i)) {
                bd = d;
                best = i;
            }
        }
        return best;
    };
    const one = nearest(0.3, 0.52, []);
    // A guided search: long jumps while the model knows little, shorter ones as it closes in.
    const path: number[] = [];
    let px = 0.22;
    let py = 0.74;
    const goal = { x: 0.68, y: 0.36 };
    for (let k = 0; k < 11; k++) {
        const t = k / 10;
        const pull = 0.3 + 0.45 * t;
        const spread = 0.42 * (1 - t) + 0.02;
        const i = nearest(
            px + (goal.x - px) * pull + (rand() - 0.5) * spread,
            py + (goal.y - py) * pull + (rand() - 0.5) * spread,
            path,
        );
        path.push(i);
        px = x[i];
        py = y[i];
    }
    const delay = new Float32Array(N);
    for (let i = 0; i < N; i++) delay[i] = rand();
    return { x, y, delay, one, path };
}

let FIELD: Field | null = null;
const field = () => (FIELD ??= buildField());

/** Alpha of the ordinary dots per step (0 = intro). */
const DOT_ALPHA = [0.16, 0.62, 0.28, 0.22, 0.07];
/** The highlighted dot per step: core, halo, ring and its label. */
const ONE_STATE: [number, number, number, number][] = [
    [0.16, 0, 0, 0],
    [0.62, 0, 0, 0],
    [1, 1, 1, 1],
    [1, 0.45, 1, 1],
    [0.12, 0, 0, 0],
];
const HOP_MS = 150;

function DotField({ step }: { step: number }) {
    const ref = useRef<HTMLCanvasElement>(null);
    const reduce = useReducedMotion();
    const api = useRef<{ go: (s: number) => void } | null>(null);
    const stepRef = useRef(step);

    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        const f = field();
        const mono = getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim() || 'monospace';
        const cur = new Float32Array(N);
        const from = new Float32Array(N);
        const to = new Float32Array(N);
        const oneCur = [0, 0, 0, 0];
        let oneFrom = [...oneCur];
        let oneTo = [...oneCur];
        let s = 0;
        let start = 0;
        let raf = 0;
        const LEVELS = 20;
        const lv = new Uint8Array(N);
        const counts = new Uint32Array(LEVELS + 1);
        const offs = new Uint32Array(LEVELS + 2);
        const sorted = new Uint32Array(N);
        const DUR = reduce ? 0 : 1400;
        const PATH_MS = reduce ? 0 : HOP_MS * f.path.length + 600;

        const box = (w: number, h: number) => ({ x0: w * 0.02, y0: h * 0.03, bw: w * 0.96, bh: h * 0.94 });

        const draw = (now: number) => {
            raf = 0;
            const el = now - start;
            const t = DUR ? Math.min(1, el / DUR) : 1;
            const { dpr, w, h } = fitCanvas(canvas);
            ctx.clearRect(0, 0, w, h);
            const { x0, y0, bw, bh } = box(w, h);
            const at = (i: number) => [x0 + f.x[i] * bw, y0 + f.y[i] * bh] as const;

            // Ordinary dots, bucketed by alpha so the canvas state changes only twenty times a frame.
            counts.fill(0);
            for (let i = 0; i < N; i++) {
                const local = Math.min(1, Math.max(0, (t - f.delay[i] * 0.45) / 0.55));
                const e = 1 - Math.pow(1 - local, 3);
                cur[i] = from[i] + (to[i] - from[i]) * e;
                const l = i === f.one ? 0 : Math.round(cur[i] * LEVELS);
                lv[i] = l;
                counts[l]++;
            }
            offs[0] = 0;
            for (let l = 0; l <= LEVELS; l++) offs[l + 1] = offs[l] + counts[l];
            const fill = offs.slice(0, LEVELS + 1);
            for (let i = 0; i < N; i++) sorted[fill[lv[i]]++] = i;
            const size = Math.max(1, Math.round(1.45 * dpr));
            const half = size / 2;
            for (let l = 1; l <= LEVELS; l++) {
                if (offs[l] === offs[l + 1]) continue;
                ctx.fillStyle = `rgba(185,198,214,${l / LEVELS})`;
                for (let k = offs[l]; k < offs[l + 1]; k++) {
                    const i = sorted[k];
                    ctx.fillRect(x0 + f.x[i] * bw - half, y0 + f.y[i] * bh - half, size, size);
                }
            }

            // The one dot: 20,000 alloys, about five and a half years of lab work.
            const e = 1 - Math.pow(1 - t, 3);
            for (let c = 0; c < 4; c++) oneCur[c] = oneFrom[c] + (oneTo[c] - oneFrom[c]) * e;
            const [core, halo, ring, label] = oneCur;
            const [ox, oy] = at(f.one);
            if (halo > 0.01) {
                const r = 26 * dpr;
                const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
                g.addColorStop(0, `rgba(255,220,170,${0.85 * halo})`);
                g.addColorStop(0.35, `rgba(255,160,90,${0.35 * halo})`);
                g.addColorStop(1, 'rgba(255,160,90,0)');
                ctx.fillStyle = g;
                ctx.fillRect(ox - r, oy - r, r * 2, r * 2);
            }
            if (ring > 0.01) {
                ctx.strokeStyle = `rgba(255,214,170,${ring})`;
                ctx.lineWidth = 1.5 * dpr;
                ctx.beginPath();
                ctx.arc(ox, oy, 8 * dpr, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.fillStyle = `rgba(255,255,255,${core})`;
            ctx.beginPath();
            ctx.arc(ox, oy, (halo > 0.01 ? 2.6 : 0.8) * dpr, 0, Math.PI * 2);
            ctx.fill();
            if (label > 0.01) {
                const right = ox + 230 * dpr < w;
                const dir = right ? 1 : -1;
                const lx = ox + dir * 34 * dpr;
                const ly = oy - 30 * dpr;
                ctx.strokeStyle = `rgba(255,255,255,${0.5 * label})`;
                ctx.lineWidth = dpr;
                ctx.beginPath();
                ctx.moveTo(ox + dir * 10 * dpr, oy - 6 * dpr);
                ctx.lineTo(lx - dir * 4 * dpr, ly + 8 * dpr);
                ctx.stroke();
                ctx.textAlign = right ? 'left' : 'right';
                ctx.textBaseline = 'alphabetic';
                ctx.font = `600 ${12 * dpr}px ${mono}`;
                ctx.fillStyle = `rgba(255,255,255,${label})`;
                ctx.fillText(`1 dot = ${fmt(PER_DOT)} alloys`, lx, ly);
                ctx.font = `${11.5 * dpr}px ${mono}`;
                ctx.fillStyle = `rgba(214,224,236,${0.85 * label})`;
                ctx.fillText(`≈ ${YEARS_PER_DOT.toFixed(1)} years of lab work`, lx, ly + 17 * dpr);
            }

            // The guided search, in the last step: hop by hop towards the answer.
            let pathDone = true;
            if (s === 4) {
                const shown = PATH_MS ? (el / HOP_MS) : f.path.length;
                pathDone = el >= PATH_MS;
                ctx.lineWidth = dpr;
                for (let k = 0; k < f.path.length; k++) {
                    const a = Math.min(1, Math.max(0, shown - k));
                    if (a <= 0) break;
                    const [hx, hy] = at(f.path[k]);
                    if (k > 0) {
                        const [px, py] = at(f.path[k - 1]);
                        ctx.strokeStyle = `rgba(255,255,255,${0.42 * a})`;
                        ctx.beginPath();
                        ctx.moveTo(px, py);
                        ctx.lineTo(px + (hx - px) * a, py + (hy - py) * a);
                        ctx.stroke();
                    }
                    const last = k === f.path.length - 1;
                    if (last) {
                        const r = 30 * dpr;
                        const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, r);
                        g.addColorStop(0, `rgba(255,220,170,${0.9 * a})`);
                        g.addColorStop(0.35, `rgba(255,160,90,${0.35 * a})`);
                        g.addColorStop(1, 'rgba(255,160,90,0)');
                        ctx.fillStyle = g;
                        ctx.fillRect(hx - r, hy - r, r * 2, r * 2);
                        ctx.strokeStyle = `rgba(255,214,170,${a})`;
                        ctx.lineWidth = 1.5 * dpr;
                        ctx.beginPath();
                        ctx.arc(hx, hy, 9 * dpr, 0, Math.PI * 2);
                        ctx.stroke();
                        ctx.lineWidth = dpr;
                    }
                    ctx.fillStyle = `rgba(255,255,255,${(last ? 1 : 0.85) * a})`;
                    ctx.beginPath();
                    ctx.arc(hx, hy, (last ? 3 : 2.1) * dpr, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            if (t < 1 || !pathDone) raf = requestAnimationFrame(draw);
        };
        const schedule = () => {
            if (!raf) raf = requestAnimationFrame(draw);
        };
        const go = (next: number) => {
            s = next;
            from.set(cur);
            to.fill(DOT_ALPHA[next]);
            oneFrom = [...oneCur];
            oneTo = [...ONE_STATE[next]];
            start = performance.now();
            schedule();
        };
        api.current = { go };
        go(stepRef.current);
        const ro = new ResizeObserver(schedule);
        ro.observe(canvas);
        return () => {
            api.current = null;
            ro.disconnect();
            cancelAnimationFrame(raf);
        };
    }, [reduce]);

    useEffect(() => {
        stepRef.current = step;
        api.current?.go(step);
    }, [step]);

    return <canvas ref={ref} className="gap__canvas" aria-hidden="true" />;
}

/** Counts up from 1 to the value, in log space so big numbers read as orders of magnitude. */
function Counter({ value }: { value: number }) {
    const reduce = useReducedMotion();
    const [shown, setShown] = useState(reduce ? value : 1);
    useEffect(() => {
        if (reduce) {
            const id = requestAnimationFrame(() => setShown(value));
            return () => cancelAnimationFrame(id);
        }
        const start = performance.now();
        const lb = Math.log10(value + 1);
        let raf = 0;
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / 1100);
            const e = 1 - Math.pow(1 - t, 4);
            setShown(Math.round(Math.pow(10, Math.log10(2) + (lb - Math.log10(2)) * e) - 1));
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value, reduce]);
    return <>{fmt(shown)}</>;
}

/** Seconds after the section comes into view at which the field moves to each step. */
const PLAY: [number, number][] = [
    [1, 0.15],
    [2, 2.4],
    [4, 6],
];

export function Gap({ n = '01' }: { n?: string }) {
    const [ref, inView] = useInView<HTMLElement>('0px 0px -25% 0px', true);
    const reduce = useReducedMotion();
    const [played, setPlayed] = useState(0);

    // Once on screen, play the field through once: dots in, one dot singled out, then a guided search.
    useEffect(() => {
        if (!inView || reduce) return;
        const ids = PLAY.map(([s, at]) => window.setTimeout(() => setPlayed(s), at * 1000));
        return () => ids.forEach((id) => window.clearTimeout(id));
    }, [inView, reduce]);
    const step = reduce ? (inView ? 4 : 0) : played;

    return (
        <section id="gap" ref={ref} className="sec gap" data-theme="navy" data-nav="navy" aria-labelledby="gap-title">
            <Rails />
            <Grain />
            <div className="wrap gap__inner">
                <Idx n={n} tail={<span className="gap__legend"><i /> = {fmt(PER_DOT)} possible alloys</span>}>
                    The problem
                </Idx>
                <div className="gap__grid">
                    <div className="gap__copy rv">
                        <h2 id="gap-title" className="w-h2">
                            <Words>Materials decide what we can build.</Words>
                        </h2>
                        <p className="w-lead">
                            Materials discovery is accelerating. Materials development is not: a new material still
                            takes ten to twenty years to reach service.
                        </p>
                        <dl className="gap__stats">
                            <div className="gap__big">
                                <dt>
                                    <Counter key={String(inView)} value={ALLOYS} />
                                </dt>
                                <dd>possible alloys from just five of nine high-melting metals</dd>
                            </div>
                            <div>
                                <dt>
                                    <span className="gap__op">÷</span>
                                    {PER_DAY}
                                </dt>
                                <dd>alloys a fast lab can make in a day</dd>
                            </div>
                            <div>
                                <dt>
                                    <span className="gap__op">≈</span>
                                    {fmt(YEARS_SHOWN)}
                                </dt>
                                <dd>years to make them all</dd>
                            </div>
                        </dl>
                        <p className="gap__close">
                            <b>Nobody can make them all.</b> PRISM picks the few worth making.
                        </p>
                    </div>
                    <div className="gap__field" aria-hidden="true">
                        <DotField step={step} />
                    </div>
                </div>
                <div className="gap__foot">
                    <Note label="How we counted">
                        126 ways to pick five of nine metals that all melt above 1,650&nbsp;°C, × 3,764,376 ways to mix
                        five in whole percent. Ten a day, every day. Each dot is 20,000 alloys; their positions are
                        illustrative.
                    </Note>
                </div>
            </div>
        </section>
    );
}
