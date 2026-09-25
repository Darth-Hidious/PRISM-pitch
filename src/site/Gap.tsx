import { useEffect, useRef, useState } from 'react';
import { Painting, SourceLine } from '../ds';
import { fitCanvas, seeded, useMediaQuery, useReducedMotion, useStickyValue } from './hooks';
import { plumeScene } from './illustrations';
import { Grain, Idx, Rails } from './ui';

/* ── The gap: 2.2M predicted, 736 made, 0 qualified ───────────────────── */

/** One dot stands for 100 predicted structures, so the field holds the paper's numbers to scale. */
const PER_DOT = 100;
const N = 2_200_000 / PER_DOT; // 22,000
const STABLE = 381_000 / PER_DOT; // 3,810
// 736 made = 7 full dots and one at 36 %.
const MADE_FULL = Math.floor(736 / PER_DOT);
const MADE_PART = (736 % PER_DOT) / PER_DOT;

const STEPS = [
    { value: 2_200_000, label: 'crystal structures predicted by one AI model', short: 'Predicted' },
    { value: 381_000, label: 'of them predicted to be stable', short: 'Stable' },
    { value: 736, label: 'made independently in a laboratory', short: 'Made' },
    { value: 0, label: 'qualified as engineering materials', short: 'Qualified' },
];
const LOG_MAX = Math.log10(STEPS[0].value);

interface Field {
    x: Float32Array;
    y: Float32Array;
    tier: Uint8Array; // 0 predicted, 1 stable, 2 made
    delay: Float32Array;
    made: number[]; // indices, the last one partial
}

/** Builds the dot field once: clustered like families of compounds. Layout is illustrative. */
function buildField(): Field {
    const rand = seeded(2023);
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
    const order = Array.from({ length: N }, (_, i) => i);
    for (let i = N - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
    }
    const tier = new Uint8Array(N);
    for (let k = 0; k < STABLE; k++) tier[order[k]] = 1;
    // Made: stable dots away from the edges and from each other, so each one reads.
    const made: number[] = [];
    for (let k = 0; k < STABLE && made.length < MADE_FULL + 1; k++) {
        const i = order[k];
        if (x[i] < 0.14 || x[i] > 0.86 || y[i] < 0.16 || y[i] > 0.84) continue;
        if (made.some((m) => Math.hypot(x[m] - x[i], y[m] - y[i]) < 0.16)) continue;
        made.push(i);
        tier[i] = 2;
    }
    const delay = new Float32Array(N);
    for (let i = 0; i < N; i++) delay[i] = rand();
    return { x, y, tier, delay, made };
}

let FIELD: Field | null = null;
const field = () => (FIELD ??= buildField());

/** Alpha of the ordinary dots per step (0 = intro) and tier. */
const DOT_ALPHA: [number, number][] = [
    [0.16, 0.16],
    [0.6, 0.6],
    [0.08, 0.95],
    [0.05, 0.07],
    [0.035, 0.05],
];
/** Made dots per step: core, halo, ring. */
const MADE_STATE: [number, number, number][] = [
    [0.16, 0, 0],
    [0.6, 0, 0],
    [0.95, 0, 0],
    [1, 1, 0],
    [0.3, 0, 1],
];

function DotField({ step }: { step: number }) {
    const ref = useRef<HTMLCanvasElement>(null);
    const reduce = useReducedMotion();
    const compact = useMediaQuery('(max-width: 900px)');
    const api = useRef<{ go: (s: number) => void } | null>(null);
    const stepRef = useRef(step);

    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        const f = field();
        const cur = new Float32Array(N);
        const from = new Float32Array(N);
        const to = new Float32Array(N);
        const mCur = f.made.map(() => [0, 0, 0]);
        let mFrom = mCur.map((m) => [...m]);
        let mTo = mCur.map((m) => [...m]);
        let s = 0;
        let start = 0;
        let raf = 0;
        const LEVELS = 20;
        const lv = new Uint8Array(N);
        const counts = new Uint32Array(LEVELS + 1);
        const offs = new Uint32Array(LEVELS + 2);
        const sorted = new Uint32Array(N);
        const DUR = reduce ? 0 : 1400;

        const box = (w: number, h: number) =>
            compact
                ? { x0: w * 0.04, y0: h * 0.44, bw: w * 0.92, bh: h * 0.5 }
                : { x0: w * 0.5, y0: h * 0.1, bw: w * 0.47, bh: h * 0.8 };

        const draw = (now: number) => {
            raf = 0;
            const t = DUR ? Math.min(1, (now - start) / DUR) : 1;
            const { dpr, w, h } = fitCanvas(canvas);
            ctx.clearRect(0, 0, w, h);
            const { x0, y0, bw, bh } = box(w, h);
            // Ordinary dots, bucketed by alpha so the canvas state changes only twenty times a frame.
            counts.fill(0);
            for (let i = 0; i < N; i++) {
                const local = Math.min(1, Math.max(0, (t - f.delay[i] * 0.45) / 0.55));
                const e = 1 - Math.pow(1 - local, 3);
                cur[i] = from[i] + (to[i] - from[i]) * e;
                const l = f.tier[i] === 2 ? 0 : Math.round(cur[i] * LEVELS);
                lv[i] = l;
                counts[l]++;
            }
            offs[0] = 0;
            for (let l = 0; l <= LEVELS; l++) offs[l + 1] = offs[l] + counts[l];
            const fill = offs.slice(0, LEVELS + 1);
            for (let i = 0; i < N; i++) sorted[fill[lv[i]]++] = i;
            const size = Math.max(1, Math.round(1.45 * dpr));
            const half = size / 2;
            const stableWhite = s >= 2;
            for (const group of [0, 1]) {
                const rgb = group === 1 && stableWhite ? '255,255,255' : '185,198,214';
                for (let l = 1; l <= LEVELS; l++) {
                    let any = false;
                    for (let k = offs[l]; k < offs[l + 1]; k++) {
                        const i = sorted[k];
                        if ((f.tier[i] >= 1 ? 1 : 0) !== group) continue;
                        if (!any) {
                            ctx.fillStyle = `rgba(${rgb},${l / LEVELS})`;
                            any = true;
                        }
                        ctx.fillRect(x0 + f.x[i] * bw - half, y0 + f.y[i] * bh - half, size, size);
                    }
                }
            }
            // Made dots: a warm halo when made, a crimson ring when the count reaches qualification.
            const e = 1 - Math.pow(1 - t, 3);
            f.made.forEach((i, k) => {
                const part = k === f.made.length - 1 ? MADE_PART : 1;
                for (let c = 0; c < 3; c++) mCur[k][c] = mFrom[k][c] + (mTo[k][c] - mFrom[k][c]) * e;
                const [core, halo, ring] = mCur[k];
                const px = x0 + f.x[i] * bw;
                const py = y0 + f.y[i] * bh;
                if (halo > 0.01) {
                    const r = 22 * dpr;
                    const g = ctx.createRadialGradient(px, py, 0, px, py, r);
                    g.addColorStop(0, `rgba(255,220,170,${0.85 * halo * part})`);
                    g.addColorStop(0.35, `rgba(255,160,90,${0.35 * halo * part})`);
                    g.addColorStop(1, 'rgba(255,160,90,0)');
                    ctx.fillStyle = g;
                    ctx.fillRect(px - r, py - r, r * 2, r * 2);
                }
                if (ring > 0.01) {
                    ctx.strokeStyle = `rgba(226,122,139,${ring * (0.35 + 0.65 * part)})`;
                    ctx.lineWidth = 1.5 * dpr;
                    ctx.beginPath();
                    ctx.arc(px, py, 7 * dpr, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.fillStyle = `rgba(255,255,255,${core * part})`;
                ctx.beginPath();
                ctx.arc(px, py, (halo > 0.01 ? 2.6 : 1) * dpr, 0, Math.PI * 2);
                ctx.fill();
            });
            if (t < 1) raf = requestAnimationFrame(draw);
        };
        const schedule = () => {
            if (!raf) raf = requestAnimationFrame(draw);
        };
        const go = (next: number) => {
            s = next;
            from.set(cur);
            const [a0, a1] = DOT_ALPHA[next];
            for (let i = 0; i < N; i++) to[i] = f.tier[i] === 0 ? a0 : a1;
            mFrom = mCur.map((m) => [...m]);
            mTo = f.made.map(() => [...MADE_STATE[next]]);
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
    }, [reduce, compact]);

    useEffect(() => {
        stepRef.current = step;
        api.current?.go(step);
    }, [step]);

    return <canvas ref={ref} className="gap__canvas" aria-hidden="true" />;
}

/** Counts from the previous value to the new one. */
function Counter({ value }: { value: number }) {
    const reduce = useReducedMotion();
    const [shown, setShown] = useState(value);
    const shownRef = useRef(value);
    useEffect(() => {
        const from = shownRef.current;
        if (reduce || from === value) {
            shownRef.current = value;
            const id = requestAnimationFrame(() => setShown(value));
            return () => cancelAnimationFrame(id);
        }
        const start = performance.now();
        let raf = 0;
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / 1100);
            const e = 1 - Math.pow(1 - t, 4);
            // Interpolate in log space so the large drops read as drops of orders of magnitude.
            const la = Math.log10(from + 1);
            const lb = Math.log10(value + 1);
            const v = Math.round(Math.pow(10, la + (lb - la) * e) - 1);
            shownRef.current = v;
            setShown(v);
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value, reduce]);
    return <>{shown.toLocaleString('en-GB')}</>;
}

const stepFor = (p: number) => (p < 0.13 ? 0 : p < 0.33 ? 1 : p < 0.53 ? 2 : p < 0.73 ? 3 : 4);

export function Gap() {
    const [ref, step] = useStickyValue<HTMLElement, number>(stepFor, 0);
    const active = step > 0 ? STEPS[step - 1] : null;
    return (
        <section id="gap" ref={ref} className="gap" data-theme="navy" data-nav="navy" aria-labelledby="gap-title">
            <div className="gap__stage">
                <Rails />
                <DotField step={step} />
                <Grain />
                <div className="wrap gap__inner">
                    <Idx n="01" tail={<span className="gap__legend"><i /> = {PER_DOT} predicted structures</span>}>
                        The gap
                    </Idx>
                    <div className="gap__copy">
                        <div className={`gap__intro${step === 0 ? ' is-on' : ''}`}>
                            <h2 id="gap-title" className="w-h2">
                                Materials decide what engineers are free to build.
                            </h2>
                            <p className="w-lead">
                                An engine or a reactor can work on paper and still be impossible to build, because no
                                available material survives its environment. Bringing a new material into service
                                still takes ten to twenty years.
                            </p>
                        </div>
                        <div className={`gap__figure${step > 0 ? ' is-on' : ''}`} aria-hidden="true">
                            <p className={`w-num gap__num${active?.value === 0 ? ' is-zero' : ''}`}>
                                <Counter value={active?.value ?? STEPS[0].value} />
                            </p>
                            <p className="gap__label">{active?.label ?? STEPS[0].label}</p>
                            <ol className="gap__bars">
                                {STEPS.map((s, i) => {
                                    const width = s.value > 0 ? (Math.log10(s.value) / LOG_MAX) * 100 : 0;
                                    const state = i + 1 === step ? 'is-on' : i + 1 < step ? 'is-past' : '';
                                    return (
                                        <li key={s.short} className={state}>
                                            <span className="gap__bar-name">{s.short}</span>
                                            <span className="gap__bar">
                                                <i style={{ width: `${width}%` }} />
                                            </span>
                                            <span className="gap__bar-value">{s.value.toLocaleString('en-GB')}</span>
                                        </li>
                                    );
                                })}
                            </ol>
                            <p className={`gap__close${step === 4 ? ' is-on' : ''}`}>
                                Prediction has outrun validation. PRISM is built for the half that is still slow:
                                making, testing and proving.
                            </p>
                        </div>
                    </div>
                    <div className="gap__foot">
                        <SourceLine label="Sources">
                            Merchant et al., “Scaling deep learning for materials discovery”, Nature 624, 80–85 (2023).
                            Qualification count: Mirdyne. Bars on a log scale; dot positions are illustrative.
                        </SourceLine>
                    </div>
                </div>
                <ul className="pm-visually-hidden">
                    {STEPS.map((s) => (
                        <li key={s.short}>
                            {s.value.toLocaleString('en-GB')} {s.label}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

/* ── A precedent: the foundry behind an engine ────────────────────────── */

export function Precedent() {
    return (
        <section className="precedent" data-theme="navy" data-nav="navy" aria-labelledby="precedent-title">
            <div className="precedent__art">
                <Painting
                    source={plumeScene}
                    alt="Painted illustration of a rocket engine firing: a bell nozzle, a white-hot core with shock diamonds and a plume rolling into exhaust cloud."
                    seed={19}
                    direction={84}
                    motion={0.62}
                />
            </div>
            <div className="precedent__shade" aria-hidden="true" />
            <Grain />
            <div className="wrap precedent__inner">
                <div className="precedent__copy rv">
                    <p className="w-label precedent__kicker">A precedent</p>
                    <h2 id="precedent-title" className="w-h2">
                        SpaceX built a foundry. Europe needs the same capability.
                    </h2>
                    <p className="w-lead">
                        When no available alloy survived the hot, oxygen-rich gas inside Raptor, SpaceX developed its
                        own superalloy, SX500, and built a foundry so materials could iterate at the speed of the engine
                        programme. European propulsion faces the same bottleneck. PRISM builds that capability in
                        Europe, for any programme that needs it.
                    </p>
                    <dl className="precedent__figs">
                        <div>
                            <dt>SX500</dt>
                            <dd>An in-house superalloy that became engine infrastructure</dd>
                        </div>
                        <div>
                            <dt>~12,000&nbsp;psi</dt>
                            <dd>Hot oxygen-rich gas, the stated operating condition</dd>
                        </div>
                    </dl>
                    <SourceLine>Elon Musk, 23 December 2018 and 25 May 2019. Illustration drawn and painted in code.</SourceLine>
                </div>
            </div>
        </section>
    );
}
