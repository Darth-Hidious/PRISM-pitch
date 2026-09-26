import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { LadderDiagram, LadderList } from './diagrams';
import { fitCanvas, seeded, useInView, useReducedMotion } from './hooks';
import { Idx, Note } from './ui';

/* ── Exhibit A: a laser powder-bed fusion process map ────────────────────
 *
 * Axes are laser power P and scan speed v at a fixed hatch spacing and layer
 * thickness. The regime boundaries follow the usual scaling laws: lack of
 * fusion with line energy P/v, keyholing with P/√v (normalised enthalpy) and
 * balling at high speed. The constants are illustrative, not measured data.
 */

const V_MIN = 200;
const V_MAX = 2000;
const P_MIN = 60;
const P_MAX = 460;
const HATCH = 0.1; // mm
const LAYER = 0.03; // mm
const LOF_EL = 0.16; // J/mm
const KEY_K = 12.5; // W·(s/mm)^0.5
const VAR_P = 0.1;
const VAR_V = 0.08;

type Regime = 'window' | 'lof' | 'keyhole' | 'balling';

function regime(v: number, p: number): Regime {
    if (p / v < LOF_EL) return 'lof';
    if (p / Math.sqrt(v) > KEY_K) return 'keyhole';
    if (v > 1450 + 0.9 * (p - 240)) return 'balling';
    return 'window';
}

/** The first regime other than the window that real variation around (v, p) reaches, if any. */
function escapes(v: number, p: number): Regime | null {
    for (let a = 0; a < 16; a++) {
        const t = (a / 16) * Math.PI * 2;
        const r = regime(v * (1 + VAR_V * Math.cos(t)), p * (1 + VAR_P * Math.sin(t)));
        if (r !== 'window') return r;
    }
    return null;
}

const REGIME_TEXT: Record<Regime, { name: string; text: string }> = {
    window: { name: 'Inside the safe range', text: 'The metal melts into the layer below and comes out solid.' },
    lof: { name: 'Lack of fusion', text: 'Too little energy: the powder does not fully melt and leaves holes.' },
    keyhole: { name: 'Keyholing', text: 'Too much energy: the metal boils, and the collapsing hole traps bubbles.' },
    balling: { name: 'Balling', text: 'Too fast: the melted line breaks up into beads.' },
};

function MeltPool({ r }: { r: Regime }) {
    return (
        <svg className="pool" viewBox="0 0 160 84" aria-hidden="true">
            <rect className="pool__solid" x="0" y="40" width="160" height="44" />
            <line className="pool__layer" x1="0" y1="40" x2="160" y2="40" />
            <line className="pool__prev" x1="0" y1="54" x2="160" y2="54" />
            {r === 'window' && <path className="pool__melt" d="M46 40 Q80 76 114 40 Z" />}
            {r === 'lof' && (
                <>
                    <path className="pool__melt" d="M60 40 Q80 51 100 40 Z" />
                    <ellipse className="pool__pore" cx="36" cy="52" rx="7" ry="3" />
                    <ellipse className="pool__pore" cx="124" cy="50" rx="6" ry="2.6" />
                </>
            )}
            {r === 'keyhole' && (
                <>
                    <path className="pool__melt" d="M58 40 Q64 48 72 76 Q80 82 88 76 Q96 48 102 40 Z" />
                    <circle className="pool__pore" cx="80" cy="72" r="4" />
                </>
            )}
            {r === 'balling' && (
                <>
                    <circle className="pool__melt" cx="42" cy="34" r="8" />
                    <circle className="pool__melt" cx="80" cy="33" r="9" />
                    <circle className="pool__melt" cx="118" cy="34" r="8" />
                </>
            )}
        </svg>
    );
}

const GRID_V = 200;
const GRID_P = 140;

/** Regime and robustness on a data grid, computed once. */
function buildMap() {
    const reg = new Uint8Array(GRID_V * GRID_P);
    const robust = new Uint8Array(GRID_V * GRID_P);
    const code: Record<Regime, number> = { window: 0, lof: 1, keyhole: 2, balling: 3 };
    for (let j = 0; j < GRID_P; j++) {
        const p = P_MAX - ((j + 0.5) / GRID_P) * (P_MAX - P_MIN);
        for (let i = 0; i < GRID_V; i++) {
            const v = V_MIN + ((i + 0.5) / GRID_V) * (V_MAX - V_MIN);
            const r = regime(v, p);
            reg[j * GRID_V + i] = code[r];
            robust[j * GRID_V + i] = r === 'window' && !escapes(v, p) ? 1 : 0;
        }
    }
    return { reg, robust };
}

let MAP: ReturnType<typeof buildMap> | null = null;

function ProcessWindow() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [probe, setProbe] = useState({ v: 950, p: 250 });
    const [showRobust, setShowRobust] = useState(true);
    const dragging = useRef(false);

    const r = regime(probe.v, probe.p);
    const esc = r === 'window' ? escapes(probe.v, probe.p) : null;
    const ev = probe.p / (probe.v * HATCH * LAYER);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        const map = (MAP ??= buildMap());
        const { dpr, w, h } = fitCanvas(canvas);
        const css = getComputedStyle(canvas);
        const col = (n: string) => css.getPropertyValue(n).trim();
        const pad = { l: 58 * dpr, r: 14 * dpr, t: 14 * dpr, b: 46 * dpr };
        const pw = w - pad.l - pad.r;
        const ph = h - pad.t - pad.b;
        const X = (v: number) => pad.l + ((v - V_MIN) / (V_MAX - V_MIN)) * pw;
        const Y = (p: number) => pad.t + (1 - (p - P_MIN) / (P_MAX - P_MIN)) * ph;
        ctx.clearRect(0, 0, w, h);

        // Regimes.
        const tint = [col('--teal'), col('--ink-3'), col('--crimson'), col('--steel')];
        const alpha = [0.09, 0.1, 0.12, 0.16];
        const cw = pw / GRID_V;
        const chh = ph / GRID_P;
        for (let k = 0; k < 4; k++) {
            ctx.globalAlpha = alpha[k];
            ctx.fillStyle = tint[k];
            for (let j = 0; j < GRID_P; j++)
                for (let i = 0; i < GRID_V; i++)
                    if (map.reg[j * GRID_V + i] === k)
                        ctx.fillRect(pad.l + i * cw, pad.t + j * chh, Math.ceil(cw + 0.5), Math.ceil(chh + 0.5));
        }
        ctx.globalAlpha = 1;

        // The robust region, hatched: the window shrunk by real variation.
        if (showRobust) {
            const tile = document.createElement('canvas');
            const ts = Math.round(7 * dpr);
            tile.width = ts;
            tile.height = ts;
            const tctx = tile.getContext('2d')!;
            tctx.strokeStyle = col('--teal');
            tctx.globalAlpha = 0.55;
            tctx.lineWidth = Math.max(1, dpr);
            tctx.beginPath();
            tctx.moveTo(0, ts);
            tctx.lineTo(ts, 0);
            tctx.stroke();
            const pattern = ctx.createPattern(tile, 'repeat');
            if (pattern) {
                ctx.globalAlpha = 0.12;
                ctx.fillStyle = col('--teal');
                for (let j = 0; j < GRID_P; j++)
                    for (let i = 0; i < GRID_V; i++)
                        if (map.robust[j * GRID_V + i])
                            ctx.fillRect(pad.l + i * cw, pad.t + j * chh, Math.ceil(cw + 0.5), Math.ceil(chh + 0.5));
                ctx.globalAlpha = 1;
                ctx.fillStyle = pattern;
                for (let j = 0; j < GRID_P; j++)
                    for (let i = 0; i < GRID_V; i++)
                        if (map.robust[j * GRID_V + i])
                            ctx.fillRect(pad.l + i * cw, pad.t + j * chh, Math.ceil(cw + 0.5), Math.ceil(chh + 0.5));
            }
        }

        // Iso-energy lines: E = P / (v·h·t).
        ctx.save();
        ctx.beginPath();
        ctx.rect(pad.l, pad.t, pw, ph);
        ctx.clip();
        ctx.setLineDash([3 * dpr, 4 * dpr]);
        ctx.strokeStyle = col('--ink-3');
        ctx.lineWidth = dpr;
        ctx.font = `${10.5 * dpr}px ${col('--font-mono')}`;
        ctx.fillStyle = col('--ink-2');
        for (const e of [100, 200]) {
            const k = e * HATCH * LAYER;
            ctx.beginPath();
            ctx.moveTo(X(V_MIN), Y(k * V_MIN));
            ctx.lineTo(X(V_MAX), Y(k * V_MAX));
            ctx.stroke();
            // Label just below where the line leaves the top of the plot.
            const vt = (P_MAX - 16) / k;
            ctx.fillText(`${e} J/mm³`, X(vt) + 6 * dpr, Y(P_MAX - 16) + 4 * dpr);
        }
        ctx.setLineDash([]);

        // Boundaries, drawn only where they bound the window.
        ctx.strokeStyle = col('--ink');
        ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath();
        for (let v = 375; v <= 1441.6; v += 8) {
            const p = LOF_EL * v;
            if (v === 375) ctx.moveTo(X(v), Y(p));
            else ctx.lineTo(X(v), Y(p));
        }
        ctx.stroke();
        ctx.beginPath();
        for (let v = V_MIN; v <= 1354; v += 8) {
            const p = KEY_K * Math.sqrt(v);
            if (v === V_MIN) ctx.moveTo(X(v), Y(p));
            else ctx.lineTo(X(v), Y(p));
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(X(1441.6), Y(230.7));
        ctx.lineTo(X(1450 + 0.9 * (P_MAX - 240)), Y(P_MAX));
        ctx.stroke();

        // Region labels.
        ctx.font = `600 ${12.5 * dpr}px ${col('--font-sans')}`;
        ctx.fillStyle = col('--ink-2');
        ctx.textAlign = 'center';
        ctx.fillText('Lack of fusion', X(1560), Y(118));
        ctx.fillText('Keyholing', X(470), Y(410));
        ctx.fillText('Balling', X(1850), Y(380));
        ctx.fillStyle = col('--teal-text');
        ctx.fillText('Window', X(760), Y(228));
        ctx.restore();

        // Axes.
        ctx.strokeStyle = col('--rule');
        ctx.lineWidth = dpr;
        ctx.strokeRect(pad.l, pad.t, pw, ph);
        ctx.fillStyle = col('--ink-2');
        ctx.font = `${11 * dpr}px ${col('--font-mono')}`;
        ctx.textAlign = 'center';
        for (const v of [500, 1000, 1500, 2000]) {
            ctx.fillText(String(v), X(v), pad.t + ph + 18 * dpr);
        }
        ctx.fillText('Scan speed v, mm/s', pad.l + pw / 2, pad.t + ph + 38 * dpr);
        ctx.textAlign = 'right';
        for (const p of [100, 200, 300, 400]) {
            ctx.fillText(String(p), pad.l - 8 * dpr, Y(p) + 4 * dpr);
        }
        ctx.save();
        ctx.translate(16 * dpr, pad.t + ph / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Laser power P, W', 0, 0);
        ctx.restore();

        // Probe with its variation envelope.
        const px = X(probe.v);
        const py = Y(probe.p);
        const rx = X(probe.v * (1 + VAR_V)) - px;
        const ry = py - Y(probe.p * (1 + VAR_P));
        const pr = regime(probe.v, probe.p);
        const bad = pr !== 'window' || escapes(probe.v, probe.p);
        ctx.strokeStyle = bad ? col('--crimson') : col('--ink');
        ctx.fillStyle = bad ? 'rgba(209,47,73,0.08)' : 'rgba(22,23,20,0.05)';
        ctx.lineWidth = 1.25 * dpr;
        ctx.setLineDash([4 * dpr, 3 * dpr]);
        ctx.beginPath();
        ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = col('--emphasis');
        ctx.beginPath();
        ctx.arc(px, py, 6 * dpr, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = col('--ground');
        ctx.lineWidth = 2 * dpr;
        ctx.stroke();
    }, [probe, showRobust]);

    useEffect(() => {
        draw();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ro = new ResizeObserver(() => draw());
        ro.observe(canvas);
        // Labels are drawn in the web fonts; redraw once they have loaded.
        let live = true;
        document.fonts?.ready.then(() => live && draw());
        return () => {
            live = false;
            ro.disconnect();
        };
    }, [draw]);

    const fromPointer = (e: ReactPointerEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pw = rect.width - 58 - 14;
        const ph = rect.height - 14 - 46;
        const fx = Math.min(1, Math.max(0, (e.clientX - rect.left - 58) / pw));
        const fy = Math.min(1, Math.max(0, (e.clientY - rect.top - 14) / ph));
        setProbe({ v: Math.round(V_MIN + fx * (V_MAX - V_MIN)), p: Math.round(P_MAX - fy * (P_MAX - P_MIN)) });
    };

    return (
        <div className="pw">
            <div className="pw__plot">
                <canvas
                    ref={canvasRef}
                    className="pw__canvas"
                    aria-hidden="true"
                    onPointerDown={(e) => {
                        dragging.current = true;
                        e.currentTarget.setPointerCapture(e.pointerId);
                        fromPointer(e);
                    }}
                    onPointerMove={(e) => dragging.current && fromPointer(e)}
                    onPointerUp={() => (dragging.current = false)}
                    onPointerCancel={() => (dragging.current = false)}
                />
            </div>
            <div className="pw__side">
                <div className="pw__controls">
                    <label>
                        <span>
                            Laser power <b>{probe.p} W</b>
                        </span>
                        <input
                            type="range"
                            min={P_MIN}
                            max={P_MAX}
                            step={5}
                            value={probe.p}
                            onChange={(e) => setProbe((s) => ({ ...s, p: Number(e.target.value) }))}
                        />
                    </label>
                    <label>
                        <span>
                            Scan speed <b>{probe.v} mm/s</b>
                        </span>
                        <input
                            type="range"
                            min={V_MIN}
                            max={V_MAX}
                            step={10}
                            value={probe.v}
                            onChange={(e) => setProbe((s) => ({ ...s, v: Number(e.target.value) }))}
                        />
                    </label>
                </div>
                <div className="pw__readout" aria-live="polite">
                    <p className="pw__energy">
                        <span className="w-label">Energy density</span>
                        <b>
                            {Math.round(ev)} J/mm³
                        </b>
                    </p>
                    <div className={`pw__regime pw__regime--${r}`}>
                        <MeltPool r={r} />
                        <div>
                            <p className="pw__regime-name">{REGIME_TEXT[r].name}</p>
                            <p>{REGIME_TEXT[r].text}</p>
                        </div>
                    </div>
                    <p className={`pw__robust${r === 'window' && !esc ? ' is-ok' : ''}`}>
                        {r !== 'window'
                            ? 'Outside the safe range.'
                            : esc
                              ? `Too close to the edge: a drift of 10 % in power or 8 % in speed causes ${REGIME_TEXT[esc].name.toLowerCase()}.`
                              : 'Safe: still works if power drifts 10 % and speed 8 %.'}
                    </p>
                </div>
                <label className="pw__toggle">
                    <input type="checkbox" checked={showRobust} onChange={(e) => setShowRobust(e.target.checked)} />
                    <span>Show the safe region</span>
                </label>
            </div>
        </div>
    );
}

/* ── Exhibit B: active learning, live ────────────────────────────────────
 *
 * A Gaussian-process loop on a synthetic function, running in the browser:
 * the model's mean and uncertainty, and an upper-confidence-bound rule that
 * picks the next of 177 candidate points. Nothing here is material data.
 */

const POINTS = 177;
const XS = Array.from({ length: POINTS }, (_, i) => i / (POINTS - 1));
const ELL = 0.06;
const SIG2 = 0.12;
const NOISE = 1e-4;
const MEAN = 0.3;
const KAPPA = 2;

function makeTruth(seed: number) {
    const rand = seeded(seed);
    const bumps = Array.from({ length: 5 }, () => ({
        c: 0.06 + rand() * 0.88,
        w: 0.03 + rand() * 0.09,
        a: 0.3 + rand() * 0.7,
    }));
    const raw = XS.map((x) => 0.08 + bumps.reduce((s, b) => s + b.a * Math.exp(-((x - b.c) ** 2) / (2 * b.w * b.w)), 0));
    const lo = Math.min(...raw);
    const hi = Math.max(...raw);
    const ys = raw.map((y) => (y - lo) / (hi - lo));
    const best = ys.indexOf(1);
    return { ys, best, first: [Math.floor(rand() * POINTS), Math.floor(rand() * POINTS)] };
}

function posterior(idx: number[], ys: number[]) {
    const n = idx.length;
    const k = (a: number, b: number) => SIG2 * Math.exp(-((a - b) ** 2) / (2 * ELL * ELL));
    const K = new Float64Array(n * n);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) K[i * n + j] = k(XS[idx[i]], XS[idx[j]]) + (i === j ? NOISE : 0);
    // Cholesky, K = L Lᵀ.
    const L = new Float64Array(n * n);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j <= i; j++) {
            let s = K[i * n + j];
            for (let m = 0; m < j; m++) s -= L[i * n + m] * L[j * n + m];
            L[i * n + j] = i === j ? Math.sqrt(Math.max(s, 1e-12)) : s / L[j * n + j];
        }
    }
    const solveL = (b: Float64Array) => {
        const out = new Float64Array(n);
        for (let i = 0; i < n; i++) {
            let s = b[i];
            for (let m = 0; m < i; m++) s -= L[i * n + m] * out[m];
            out[i] = s / L[i * n + i];
        }
        return out;
    };
    const solveLt = (b: Float64Array) => {
        const out = new Float64Array(n);
        for (let i = n - 1; i >= 0; i--) {
            let s = b[i];
            for (let m = i + 1; m < n; m++) s -= L[m * n + i] * out[m];
            out[i] = s / L[i * n + i];
        }
        return out;
    };
    const resid = new Float64Array(n);
    for (let i = 0; i < n; i++) resid[i] = ys[idx[i]] - MEAN;
    const alpha = solveLt(solveL(resid));
    const mu = new Float64Array(POINTS);
    const sd = new Float64Array(POINTS);
    const ks = new Float64Array(n);
    for (let g = 0; g < POINTS; g++) {
        for (let i = 0; i < n; i++) ks[i] = k(XS[g], XS[idx[i]]);
        let m = MEAN;
        for (let i = 0; i < n; i++) m += ks[i] * alpha[i];
        const v = solveL(ks);
        let vv = 0;
        for (let i = 0; i < n; i++) vv += v[i] * v[i];
        mu[g] = m;
        sd[g] = Math.sqrt(Math.max(SIG2 - vv, 0));
    }
    return { mu, sd };
}

interface RunState {
    seed: number;
    sampled: number[];
    found: boolean;
}

function ActiveLearning() {
    const reduce = useReducedMotion();
    const [ref, inView] = useInView<HTMLDivElement>('-10% 0px');
    const [playing, setPlaying] = useState(!reduce);
    const [run, setRun] = useState<RunState>(() => ({ seed: 3, sampled: makeTruth(3).first, found: false }));
    const truth = useMemo(() => makeTruth(run.seed), [run.seed]);
    const post = useMemo(() => posterior(run.sampled, truth.ys), [run.sampled, truth.ys]);

    const next = useCallback(() => {
        setRun((r) => {
            if (r.found) {
                const seed = r.seed + 1;
                return { seed, sampled: makeTruth(seed).first, found: false };
            }
            const t = makeTruth(r.seed);
            const p = posterior(r.sampled, t.ys);
            let pick = -1;
            let bestU = -Infinity;
            for (let g = 0; g < POINTS; g++) {
                if (r.sampled.includes(g)) continue;
                const u = p.mu[g] + KAPPA * p.sd[g];
                if (u > bestU) {
                    bestU = u;
                    pick = g;
                }
            }
            const sampled = [...r.sampled, pick];
            return { ...r, sampled, found: sampled.includes(t.best) || sampled.length >= 60 };
        });
    }, []);

    useEffect(() => {
        if (!playing || !inView) return;
        const id = setTimeout(next, run.found ? 4200 : 950);
        return () => clearTimeout(id);
    }, [playing, inView, run, next]);

    const W = 640;
    const H = 250;
    const top = 16;
    const plotH = 170;
    const x = (i: number) => 8 + (i / (POINTS - 1)) * (W - 16);
    const y = (v: number) => top + (1 - (v + 0.15) / 1.35) * plotH;
    const band =
        XS.map((_, i) => `${x(i)},${y(post.mu[i] + 2 * post.sd[i])}`).join(' ') +
        ' ' +
        XS.map((_, i) => `${x(POINTS - 1 - i)},${y(post.mu[POINTS - 1 - i] - 2 * post.sd[POINTS - 1 - i])}`).join(' ');
    const mean = XS.map((_, i) => `${i ? 'L' : 'M'}${x(i)},${y(post.mu[i])}`).join('');
    const truthPath = XS.map((_, i) => `${i ? 'L' : 'M'}${x(i)},${y(truth.ys[i])}`).join('');
    const last = run.sampled[run.sampled.length - 1];
    const n = run.sampled.length;

    return (
        <div ref={ref} className="al">
            <svg className="al__svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Active learning on a synthetic function: ${n} of ${POINTS} points measured${run.found ? ', optimum found' : ''}.`}>
                <defs>
                    <clipPath id="al-clip">
                        <rect x="0" y={top} width={W} height={plotH} />
                    </clipPath>
                </defs>
                <g clipPath="url(#al-clip)">
                    <polygon className="al__band" points={band} />
                    <path className="al__truth" d={truthPath} />
                    <path className="al__mean" d={mean} />
                </g>
                <line className="al__best" x1={x(truth.best)} x2={x(truth.best)} y1={top} y2={top + plotH} />
                {run.sampled.map((i) => (
                    <circle key={i} className={`al__pt${i === last ? ' is-last' : ''}${i === truth.best ? ' is-best' : ''}`} cx={x(i)} cy={y(truth.ys[i])} r={i === last ? 5.5 : 4} />
                ))}
                <g className="al__strip">
                    {XS.map((_, i) => (
                        <line key={i} className={run.sampled.includes(i) ? 'is-on' : undefined} x1={x(i)} x2={x(i)} y1={H - 44} y2={H - 26} />
                    ))}
                </g>
                <text className="al__axis" x="8" y={H - 6}>
                    177 possible experiments
                </text>
            </svg>
            <div className="al__bar">
                <p className="al__count" aria-live="polite">
                    {run.found ? (
                        <>
                            Best point found after <b>{n}</b> of {POINTS} measurements
                        </>
                    ) : (
                        <>
                            Measured <b>{n}</b> of {POINTS}
                        </>
                    )}
                </p>
                <div className="al__buttons">
                    <button type="button" className="pm-btn pm-btn--secondary al__btn" onClick={() => setPlaying((p) => !p)}>
                        {playing ? 'Pause' : 'Run'}
                    </button>
                    <button type="button" className="pm-btn pm-btn--link al__btn" onClick={next}>
                        Step
                    </button>
                </div>
            </div>
            <ul className="al__legend" aria-hidden="true">
                <li className="al__legend-mean">Model’s best guess</li>
                <li className="al__legend-band">How unsure it is</li>
                <li className="al__legend-truth">The hidden answer</li>
                <li className="al__legend-pt">Measured</li>
            </ul>
        </div>
    );
}

/* ── Exhibit C: a reusable core ───────────────────────────────────────── */

const CORE = [
    'Planner and playbooks',
    'Idea generator',
    'Scorer',
    'Knowledge graph and traceability',
    'Printability check',
    'Evidence file',
];

const MODULES = {
    alloys: {
        label: 'Refractory alloys',
        status: 'Now',
        slots: [
            ['Requirement', 'Where it works, how hot, and the alloy to beat'],
            ['Physics', 'Fast AI simulations, exact quantum calculations and phase diagrams'],
            ['Scored on', 'Stability, resistance to oxidation, and printability'],
            ['Tests', 'Density, inner structure and heat tests'],
        ],
    },
    polymers: {
        label: 'Polymers',
        status: 'Next',
        slots: [
            ['Requirement', 'What the replaced material could do'],
            ['Physics', 'Polymer property models and chemistry rules'],
            ['Scored on', 'Matching those properties, easy processing, and no PFAS'],
            ['Tests', 'The tests the old material had to pass'],
        ],
    },
} as const;

function CoreModules() {
    const [cls, setCls] = useState<keyof typeof MODULES>('alloys');
    const mod = MODULES[cls];
    return (
        <div className="core">
            <div className="seg" role="group" aria-label="Material class">
                {(Object.keys(MODULES) as (keyof typeof MODULES)[]).map((k) => (
                    <button key={k} type="button" aria-pressed={k === cls} onClick={() => setCls(k)}>
                        {MODULES[k].label}
                        <span className="seg__tag">{MODULES[k].status}</span>
                    </button>
                ))}
            </div>
            <div className="core__grid">
                <div className="core__block" data-theme="navy">
                    <p className="w-label">The core · stays the same</p>
                    <ul>
                        {CORE.map((c) => (
                            <li key={c}>{c}</li>
                        ))}
                    </ul>
                    <p className="core__foot">The same core, from one project to the next.</p>
                </div>
                <div className="core__plugs" aria-hidden="true">
                    {mod.slots.map((_, i) => (
                        <span key={i} />
                    ))}
                </div>
                <div className="core__slots" key={cls}>
                    <p className="w-label">Changes with each material</p>
                    {mod.slots.map(([k, v], i) => (
                        <div key={k} className="core__slot" style={{ animationDelay: `${i * 70}ms` }}>
                            <span className="w-label">{k}</span>
                            <p>{v}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ── Section ──────────────────────────────────────────────────────────── */

/** The four demos, one shown at a time; `id` is the address fragment (for example /method#al). */
const EXHIBITS = [
    { id: 'ladder', tag: 'A', name: 'The ladder' },
    { id: 'window', tag: 'B', name: 'Safe settings' },
    { id: 'al', tag: 'C', name: 'Smart experiments' },
    { id: 'core', tag: 'D', name: 'Reuse' },
];

const demoFromHash = () => {
    const i = typeof window === 'undefined' ? -1 : EXHIBITS.findIndex((x) => `#${x.id}` === window.location.hash);
    return i >= 0 ? i : 0;
};

export default function Method({ n = '01', h1 = false }: { n?: string; h1?: boolean }) {
    const H = h1 ? 'h1' : 'h2';
    const Sub = h1 ? 'h2' : 'h3';
    // The build renders the page to plain HTML (scripts/prerender.mjs). Without JavaScript the tabs cannot
    // switch, so that copy shows every exhibit, one after another.
    const all = typeof window === 'undefined';
    const [active, setActive] = useState(demoFromHash);
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);
    const pick = (i: number) => {
        setActive(i);
        window.history.replaceState(null, '', `#${EXHIBITS[i].id}`);
    };
    const onKey = (e: ReactKeyboardEvent) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        const next = (active + d + EXHIBITS.length) % EXHIBITS.length;
        pick(next);
        tabs.current[next]?.focus();
    };
    return (
        <section id="method" className="sec method" data-theme="paper" data-nav="paper" aria-labelledby="method-title">
            <div className="wrap">
                <header className="sec-head rv">
                    <Idx n={n}>The method</Idx>
                    <H id="method-title" className="w-h2">
                        PRISM chooses which experiments to run.
                    </H>
                    <p className="w-lead">
                        Real experiments are slow and expensive, so PRISM runs the ones that will teach us the most.
                    </p>
                </header>

                <figure className="method__photo rv">
                    <img
                        src="/img/dlr-vinci-p41-2000.webp"
                        srcSet="/img/dlr-vinci-p41-1200.webp 1200w, /img/dlr-vinci-p41-2000.webp 2000w"
                        sizes="(max-width: 1400px) 100vw, 1320px"
                        alt="The Vinci upper-stage engine mounted in an altitude test stand: its dark nozzle hangs below a tangle of pipes and cables."
                        width={2000}
                        height={1125}
                        loading="lazy"
                    />
                    <figcaption>
                        <b>A real engine test takes months.</b> Vinci, in an altitude test stand at DLR.
                    </figcaption>
                </figure>

                <div className="method__tabs rv" role="tablist" aria-label="Demos" onKeyDown={onKey}>
                    {EXHIBITS.map((x, i) => (
                        <button
                            key={x.id}
                            ref={(el) => {
                                tabs.current[i] = el;
                            }}
                            type="button"
                            role="tab"
                            id={`demo-tab-${x.id}`}
                            aria-selected={i === active}
                            aria-controls="demo-panel"
                            tabIndex={i === active ? 0 : -1}
                            className="method__tab"
                            onClick={() => pick(i)}
                        >
                            <span className="method__tab-tag">Exhibit {x.tag}</span>
                            <span>{x.name}</span>
                        </button>
                    ))}
                </div>
                <div id="demo-panel" role="tabpanel" aria-labelledby={`demo-tab-${EXHIBITS[active].id}`} className="method__panel">
                    {(all || active === 0) && (
                        <article className="exhibit exhibit--wide" aria-labelledby="ex-ladder">
                            <div className="exhibit__text">
                                <p className="w-label exhibit__tag">Exhibit A · The ladder</p>
                                <Sub id="ex-ladder" className="w-h3">
                                    Cheap checks come first, expensive ones last.
                                </Sub>
                                <p className="a">
                                    <b>Most ideas stop early,</b> in a simulation that takes seconds, long before a test that
                                    takes weeks.
                                </p>
                            </div>
                            <figure className="exhibit__stage">
                                <div className="drawing wide-only">
                                    <LadderDiagram />
                                </div>
                                <LadderList />
                                <figcaption>
                                    <Note label="Illustrative">
                                        Drawn for this site. The counts show the shape, not real results. Times are typical per
                                        idea.
                                    </Note>
                                </figcaption>
                            </figure>
                        </article>
                    )}
                    {(all || active === 1) && (
                        <article className="exhibit" aria-labelledby="ex-window">
                            <div className="exhibit__text">
                                <p className="w-label exhibit__tag">Exhibit B · Safe settings</p>
                                <Sub id="ex-window" className="w-h3">
                                    We look for a safe range of settings.
                                </Sub>
                                <p className="a">
                                    <b>Machines drift, so the recipe needs room to spare.</b> Drag the dot: anywhere in the
                                    hatched area, the metal still comes out solid.
                                </p>
                                <Note label="Illustrative">
                                    Boundaries follow standard scaling rules: lack of fusion with P/v, keyholing with P/√v,
                                    balling at high speed. Not measured data.
                                </Note>
                            </div>
                            <div className="exhibit__stage">
                                <ProcessWindow />
                            </div>
                        </article>
                    )}
                    {(all || active === 2) && (
                        <article className="exhibit" aria-labelledby="ex-al">
                            <div className="exhibit__text">
                                <p className="w-label exhibit__tag">Exhibit C · Smart experiments</p>
                                <Sub id="ex-al" className="w-h3">
                                    Each experiment is chosen for what it will teach us.
                                </Sub>
                                <p className="a">
                                    <b>PRISM tests where the model is least sure,</b> close to the best answer. Press Run to
                                    watch the uncertainty shrink.
                                </p>
                                <dl className="exhibit__stats">
                                    <div>
                                        <dt>19</dt>
                                        <dd>measurements for NIST’s CAMEO system to find the best material</dd>
                                    </div>
                                    <div>
                                        <dt>177</dt>
                                        <dd>points on the full map, most of which it never had to measure</dd>
                                    </div>
                                </dl>
                                <Note>
                                    Kusne et al., Nature Communications 11, 5966 (2020): about 10 hours instead of more than 90.
                                    The demo is a real learning loop (a Gaussian process) on a test function, not material data.
                                </Note>
                            </div>
                            <div className="exhibit__stage">
                                <ActiveLearning />
                            </div>
                        </article>
                    )}
                    {(all || active === 3) && (
                        <article className="exhibit" aria-labelledby="ex-core">
                            <div className="exhibit__text">
                                <p className="w-label exhibit__tag">Exhibit D · Reuse</p>
                                <Sub id="ex-core" className="w-h3">
                                    Only the modules change from one material to the next.
                                </Sub>
                                <p className="a">
                                    The core stays the same. That is how one platform moves from alloys to polymers.
                                </p>
                            </div>
                            <div className="exhibit__stage">
                                <CoreModules />
                            </div>
                        </article>
                    )}
                </div>
            </div>
        </section>
    );
}
