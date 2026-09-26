import { useEffect, useRef, type CSSProperties } from 'react';
import { MaturityPill } from '../ds';
import type { Maturity } from '../ds/MaturityPill';
import { Glyph, type GlyphName } from '../site/glyphs';
import { seeded, useReducedMotion } from '../site/hooks';
import { STACKS } from '../site/stacks-data';
import { N_DOTS, YEARS_PER_DOT, fmt, PER_DOT } from './numbers';
import { useSlide } from './slideContext';

/** Motion only on the slide on screen (or in the reader), and never when the viewer asks for less. */
function useLive() {
    const { active, reader } = useSlide();
    const reduced = useReducedMotion();
    return { live: (active || reader) && !reduced, active, reader, reduced };
}

/* ── The problem: every possible alloy, to scale ──────────────────────── */

interface Dots {
    x: Float32Array;
    y: Float32Array;
    delay: Float32Array;
    one: number;
}

/** Clustered like families of alloys. The layout is illustrative; the number of dots is not. */
function buildDots(): Dots {
    const rand = seeded(2026);
    const gauss = () => Math.sqrt(-2 * Math.log(Math.max(1e-9, rand()))) * Math.cos(2 * Math.PI * rand());
    const clusters = Array.from({ length: 14 }, () => ({
        cx: 0.14 + rand() * 0.72,
        cy: 0.16 + rand() * 0.68,
        sx: 0.02 + rand() * 0.07,
        sy: 0.02 + rand() * 0.055,
        w: 0.25 + rand(),
    }));
    const total = clusters.reduce((s, c) => s + c.w, 0);
    const x = new Float32Array(N_DOTS);
    const y = new Float32Array(N_DOTS);
    for (let i = 0; i < N_DOTS; i++) {
        let px = -1;
        let py = -1;
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
    let one = 0;
    let best = Infinity;
    for (let i = 0; i < N_DOTS; i++) {
        const d = (x[i] - 0.3) ** 2 + (y[i] - 0.56) ** 2;
        if (d < best) {
            best = d;
            one = i;
        }
    }
    const delay = new Float32Array(N_DOTS);
    for (let i = 0; i < N_DOTS; i++) delay[i] = rand();
    return { x, y, delay, one };
}

let DOTS: Dots | null = null;
const dotsOnce = () => (DOTS ??= buildDots());

/** The field sits in this part of its canvas, so the dots never touch the edge. */
const INSET = { x: 0.02, y: 0.03, w: 0.96, h: 0.94 };

/** 23,716 dots, one for every 20,000 possible alloys. They appear when the slide does. */
export function DotField() {
    const canvas = useRef<HTMLCanvasElement>(null);
    const dots = dotsOnce();
    const { live, active, reader } = useLive();

    useEffect(() => {
        const c = canvas.current;
        const ctx = c?.getContext('2d');
        if (!c || !ctx) return;
        let raf = 0;
        let start = 0;
        const paint = (t: number) => {
            const r = c.getBoundingClientRect();
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            const w = Math.max(1, Math.round(r.width * dpr));
            const h = Math.max(1, Math.round(r.height * dpr));
            if (c.width !== w) c.width = w;
            if (c.height !== h) c.height = h;
            // Backing pixels per stage pixel: the stage is scaled to the screen.
            const k = w / Math.max(1, c.offsetWidth);
            ctx.clearRect(0, 0, w, h);
            const x0 = INSET.x * w;
            const y0 = INSET.y * h;
            const bw = INSET.w * w;
            const bh = INSET.h * h;
            const size = Math.max(1, 1.5 * k);
            const half = size / 2;
            // Four alpha levels are enough for the fade, and keep the canvas state changes few.
            for (let level = 1; level <= 4; level++) {
                ctx.fillStyle = `rgba(185, 198, 214, ${(0.62 * level) / 4})`;
                for (let i = 0; i < N_DOTS; i++) {
                    if (i === dots.one) continue;
                    const local = Math.min(1, Math.max(0, (t - dots.delay[i] * 0.5) / 0.5));
                    if (Math.ceil(local * 4) !== level) continue;
                    ctx.fillRect(x0 + dots.x[i] * bw - half, y0 + dots.y[i] * bh - half, size, size);
                }
            }
            // The one dot, lit once the field is full.
            const glow = Math.min(1, Math.max(0, (t - 0.8) / 0.2));
            if (glow > 0) {
                const ox = x0 + dots.x[dots.one] * bw;
                const oy = y0 + dots.y[dots.one] * bh;
                const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, 24 * k);
                g.addColorStop(0, `rgba(255, 220, 170, ${0.9 * glow})`);
                g.addColorStop(0.35, `rgba(255, 160, 90, ${0.35 * glow})`);
                g.addColorStop(1, 'rgba(255, 160, 90, 0)');
                ctx.fillStyle = g;
                ctx.fillRect(ox - 24 * k, oy - 24 * k, 48 * k, 48 * k);
                ctx.fillStyle = `rgba(255, 255, 255, ${glow})`;
                ctx.beginPath();
                ctx.arc(ox, oy, 2.6 * k, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * glow})`;
                ctx.lineWidth = 1.2 * k;
                ctx.beginPath();
                ctx.arc(ox, oy, 11 * k, 0, Math.PI * 2);
                ctx.stroke();
            }
        };
        const run = (now: number) => {
            if (!start) start = now;
            const t = Math.min(1, (now - start) / 1600);
            paint(t);
            if (t < 1) raf = requestAnimationFrame(run);
        };
        if (live && active && !reader) raf = requestAnimationFrame(run);
        else paint(1);
        const onResize = () => paint(1);
        window.addEventListener('resize', onResize);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
        };
    }, [dots, live, active, reader]);

    const at = {
        left: `${(INSET.x + dots.x[dots.one] * INSET.w) * 100}%`,
        top: `${(INSET.y + dots.y[dots.one] * INSET.h) * 100}%`,
    };
    return (
        <figure className={`d-dots${live ? ' is-live' : ''}`}>
            <canvas
                ref={canvas}
                className="d-dots__canvas"
                role="img"
                aria-label={`${fmt(N_DOTS)} dots, one for every ${fmt(PER_DOT)} possible alloys.`}
            />
            <figcaption className="d-dots__one" style={at}>
                <b>One dot: {fmt(PER_DOT)} alloys.</b>
                <span>About {YEARS_PER_DOT.toFixed(1)} years of work, at ten a day.</span>
            </figcaption>
        </figure>
    );
}

/* ── The solution: one loop around your requirement ───────────────────── */

export interface LoopStep {
    name: string;
    glyph: GlyphName;
}

const WX = 320;
const WY = 262;
const WR = 178;
const WCIRC = 2 * Math.PI * WR;
const wheelAt = (k: number, r = WR) => {
    const a = ((-90 + k * 72) * Math.PI) / 180;
    return { x: WX + r * Math.cos(a), y: WY + r * Math.sin(a), c: Math.cos(a), s: Math.sin(a) };
};
/** Once round the ring, clockwise from the top, for the light that travels it. */
const WHEEL_PATH = `M${WX} ${WY - WR} A${WR} ${WR} 0 1 1 ${WX} ${WY + WR} A${WR} ${WR} 0 1 1 ${WX} ${WY - WR}`;

/** The requirement in the middle; design, screen, make, test and learn around it. */
export function LoopWheel({ round }: { round: LoopStep[] }) {
    const { live } = useLive();
    return (
        <svg
            className={`d-wheel${live ? ' is-live' : ''}`}
            viewBox="0 0 640 524"
            role="img"
            aria-label={`The PRISM loop: your requirement in the middle; ${round.map((s) => s.name.toLowerCase()).join(', ')} around it, and round again.`}
        >
            <circle className="d-wheel__track" cx={WX} cy={WY} r={WR} />
            <circle
                className="d-wheel__arc"
                cx={WX}
                cy={WY}
                r={WR}
                strokeDasharray={WCIRC.toFixed(1)}
                transform={`rotate(-90 ${WX} ${WY})`}
                style={{ '--circ': WCIRC.toFixed(1) } as CSSProperties}
            />
            {round.map((_, k) => {
                const m = wheelAt(k + 0.5);
                const deg = (k + 0.5) * 72;
                return <path key={k} className="d-wheel__tick" d="M-5,-5 L1,0 L-5,5" transform={`translate(${m.x.toFixed(1)} ${m.y.toFixed(1)}) rotate(${deg.toFixed(1)})`} />;
            })}
            <g className="d-wheel__middle">
                <circle cx={WX} cy={WY} r={74} />
                <g transform={`translate(${WX - 18} ${WY - 50})`}>
                    <Glyph name="target" className="d-glyph" size={36} />
                </g>
                <text x={WX} y={WY + 14} textAnchor="middle">
                    Your
                </text>
                <text x={WX} y={WY + 36} textAnchor="middle">
                    requirement
                </text>
            </g>
            {round.map((st, k) => {
                const n = wheelAt(k);
                const l = wheelAt(k, WR + 54);
                const anchor = Math.abs(l.c) < 0.3 ? 'middle' : l.c > 0 ? 'start' : 'end';
                const dy = Math.abs(l.c) < 0.3 ? (l.s < 0 ? -2 : 18) : 7;
                return (
                    <g key={st.name} className="d-wheel__node" style={{ '--k': k } as CSSProperties}>
                        <circle cx={n.x} cy={n.y} r={36} />
                        <g transform={`translate(${(n.x - 15).toFixed(1)} ${(n.y - 15).toFixed(1)})`}>
                            <Glyph name={st.glyph} className="d-glyph" size={30} />
                        </g>
                        <text x={l.x} y={l.y + dy} textAnchor={anchor}>
                            {st.name}
                        </text>
                    </g>
                );
            })}
            {live && (
                <g className="d-wheel__comet">
                    <circle r={14} className="d-wheel__halo" />
                    <circle r={6} />
                    <animateMotion dur="9s" repeatCount="indefinite" path={WHEEL_PATH} begin="1.6s" />
                </g>
            )}
        </svg>
    );
}

/* ── The platform: five stacks, taken apart ───────────────────────────── */

const PW = 220;
const PH = 110;
const PT = 10;
/** Far enough apart that every plate's parts show; the lower plates peek out below the upper. */
const OPEN = 100;
const CX = 22 + PW / 2;
const Y0 = 8 + 30 + PH / 2;
/** Where each plate's centre sits, top (Research) to bottom (Evidence). */
const PLATE_Y = STACKS.map((_, i) => Y0 + i * OPEN);
const TOWER_H = Math.round(PLATE_Y[PLATE_Y.length - 1] + PH / 2 + PT + 8);
const TALL: Record<Maturity, number> = { 'in-use': 30, prototype: 21, development: 13, target: 0 };

/** A point on a plate's top face: `a` runs to its right corner, `b` to its left, both 0 to 1. */
const onPlate = (a: number, b: number, up = 0) => `${(CX + (a - b) * (PW / 2)).toFixed(1)},${(-PH / 2 + (a + b) * (PH / 2) - up).toFixed(1)}`;

function Part({ a, b, h, maturity }: { a: number; b: number; h: number; maturity: Maturity }) {
    const da = 0.2;
    const db = 0.28;
    if (maturity === 'target') {
        return <polygon className="d-tower__goal" points={[onPlate(a, b), onPlate(a + da, b), onPlate(a + da, b + db), onPlate(a, b + db)].join(' ')} />;
    }
    return (
        <g className={`d-tower__part d-tower__part--${maturity}`}>
            <polygon className="l" points={[onPlate(a, b + db), onPlate(a + da, b + db), onPlate(a + da, b + db, h), onPlate(a, b + db, h)].join(' ')} />
            <polygon className="r" points={[onPlate(a + da, b), onPlate(a + da, b + db), onPlate(a + da, b + db, h), onPlate(a + da, b, h)].join(' ')} />
            <polygon className="t" points={[onPlate(a, b, h), onPlate(a + da, b, h), onPlate(a + da, b + db, h), onPlate(a, b + db, h)].join(' ')} />
        </g>
    );
}

export interface TowerRow {
    name: string;
    text: string;
    maturity: Maturity;
}

/**
 * The five stacks as plates, Research on top and Evidence as the foundation. Each part standing on a
 * plate is one of its components, as tall as it is built: in use, prototype, in development; a goal
 * is only marked out. The names sit level with their plates.
 */
export function StackTower({ rows }: { rows: TowerRow[] }) {
    const { live } = useLive();
    const plate = {
        top: `${CX},${-PH / 2} ${CX + PW / 2},0 ${CX},${PH / 2} ${CX - PW / 2},0`,
        left: `${CX - PW / 2},0 ${CX},${PH / 2} ${CX},${PH / 2 + PT} ${CX - PW / 2},${PT}`,
        right: `${CX},${PH / 2} ${CX + PW / 2},0 ${CX + PW / 2},${PT} ${CX},${PH / 2 + PT}`,
    };
    const order = STACKS.map((_, k) => STACKS.length - 1 - k);
    return (
        <div className={`d-tower${live ? ' is-live' : ''}`} style={{ '--tower-h': `${TOWER_H}px` } as CSSProperties}>
            <svg className="d-tower__art" viewBox={`0 0 ${CX + PW / 2 + 60} ${TOWER_H}`} aria-hidden="true">
                {order.map((i) => (
                    <g key={STACKS[i].id} transform={`translate(0 ${PLATE_Y[i]})`}>
                        <g className="d-tower__plate" style={{ '--k': i } as CSSProperties}>
                            <polygon className="d-tower__side d-tower__side--l" points={plate.left} />
                            <polygon className="d-tower__side d-tower__side--r" points={plate.right} />
                            <polygon className="d-tower__top" points={plate.top} />
                            {STACKS[i].layers
                                .map((l, k) => ({ l, a: 0.1 + (k % 3) * 0.28, b: 0.14 + Math.floor(k / 3) * 0.4 }))
                                .sort((p, q) => p.a + p.b - (q.a + q.b))
                                .map(({ l, a, b }) => (
                                    <Part key={l.name} a={a} b={b} h={TALL[l.maturity]} maturity={l.maturity} />
                                ))}
                            <line className="d-tower__lead" x1={CX + PW / 2 + 8} y1={0} x2={CX + PW / 2 + 56} y2={0} />
                        </g>
                    </g>
                ))}
            </svg>
            <ol className="d-tower__list">
                {rows.map((r, i) => (
                    <li key={r.name} style={{ '--y': `${PLATE_Y[i]}px`, '--k': i } as CSSProperties}>
                        <span className="d-tower__num">{String(i + 1).padStart(2, '0')}</span>
                        <div>
                            <b>{r.name}</b>
                            <span>{r.text}</span>
                        </div>
                        <MaturityPill maturity={r.maturity} />
                    </li>
                ))}
            </ol>
            <p className="d-tower__key" aria-hidden="true">
                <span className="k-in-use">In use</span>
                <span className="k-prototype">Prototype</span>
                <span className="k-development">In development</span>
                <span className="k-target">Goal</span>
            </p>
        </div>
    );
}

/* ── Architecture: four modules, one loop ─────────────────────────────── */

export interface Module {
    id: string;
    type: string;
    title: string;
    lines: string[];
    glyph: GlyphName;
}

const NW = 320;
const NH = 160;
/** The modules in the order the loop visits them: plan, propose, test, remember. */
const SPOTS = [
    { x: 236, y: 8 },
    { x: 756, y: 8 },
    { x: 756, y: 322 },
    { x: 236, y: 322 },
];
const WIRES = [
    { d: 'M556 88 H756', label: 'campaign', lx: 656, ly: 74, anchor: 'middle' },
    { d: 'M916 168 V322', label: 'candidates', lx: 932, ly: 250, anchor: 'start' },
    { d: 'M756 402 H556', label: 'results, sourced', lx: 656, ly: 428, anchor: 'middle' },
    { d: 'M396 322 V168', label: 'what worked, what failed', lx: 380, ly: 250, anchor: 'end' },
] as const;
const PILLS = [
    { x: 0, y: 59, title: 'Your requirement', sub: 'what the part must survive', wire: 'M200 88 H236', flow: 'in' },
    { x: 0, y: 373, title: 'Papers, patents, data', sub: 'linked, each with a source', wire: 'M200 402 H236', flow: 'in' },
    { x: 1112, y: 341, title: 'Simulations and the lab', sub: 'simulate, melt, print, test', wire: 'M1076 370 H1112', flow: 'both' },
    { x: 1112, y: 421, title: 'Engineer sign-off', sub: 'a person decides what leaves', wire: 'M1076 450 H1112', flow: 'out' },
] as const;
/** One turn of the loop: a quarter for each wire. */
const TURN = 6.4;

/**
 * The loop as a working system: the four modules, what flows between them, and what comes in and goes
 * out. A light goes round once every few seconds and each module lights as it arrives.
 */
export function ModuleMap({ modules }: { modules: Module[] }) {
    const { live } = useLive();
    return (
        <svg className={`d-map${live ? ' is-live' : ''}`} viewBox="0 0 1312 490" role="img" aria-label="Four modules on one loop: the campaign planner sends a campaign to the generative samplers; their candidates go to simulation and the lab; results are kept, with sources, in the knowledge graph; what worked and what failed goes back to the planner. Your requirement comes in to the planner, papers and patents to the knowledge graph, and an engineer signs off what leaves.">
            {/* The wires under everything else. */}
            {PILLS.map((p) => (
                <path key={p.title} className="d-map__wire d-map__wire--ext" d={p.wire} />
            ))}
            {WIRES.map((w) => (
                <path key={w.d} className="d-map__wire" d={w.d} markerEnd="url(#d-map-head)" />
            ))}
            <defs>
                <marker id="d-map-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M0 0 L10 5 L0 10 z" fill="#8fa7c4" />
                </marker>
            </defs>
            {WIRES.map((w) => (
                <text key={w.label} className="d-map__label" x={w.lx} y={w.ly} textAnchor={w.anchor}>
                    {w.label}
                </text>
            ))}

            {/* The middle: the loop itself. */}
            <g className="d-map__hub">
                <circle cx={656} cy={245} r={58} className="d-map__hub-ring" />
                <circle cx={656} cy={245} r={44} className="d-map__hub-disc" />
                <g transform="translate(641 222)">
                    <Glyph name="cycle" className="d-glyph" size={30} />
                </g>
                <text x={656} y={272} textAnchor="middle" className="d-map__hub-text">
                    one loop
                </text>
            </g>

            {PILLS.map((p) => (
                <g key={p.title} className="d-map__pill">
                    <rect x={p.x} y={p.y} width={200} height={58} rx={29} />
                    <text x={p.x + 100} y={p.y + 25} textAnchor="middle" className="d-map__pill-title">
                        {p.title}
                    </text>
                    <text x={p.x + 100} y={p.y + 43} textAnchor="middle" className="d-map__pill-sub">
                        {p.sub}
                    </text>
                </g>
            ))}

            {modules.map((m, k) => {
                const { x, y } = SPOTS[k];
                // When the light arrives here: the planner at the start of each turn, then each quarter.
                const at = k / 4;
                return (
                    <g key={m.id} className="d-map__node">
                        <rect x={x} y={y} width={NW} height={NH} rx={12} className="d-map__box" />
                        {live && (
                            <rect x={x} y={y} width={NW} height={NH} rx={12} className="d-map__lit" opacity={0}>
                                <animate
                                    attributeName="opacity"
                                    dur={`${TURN}s`}
                                    repeatCount="indefinite"
                                    calcMode="linear"
                                    values={k === 0 ? '1;0;0;1' : '0;0;1;0;0'}
                                    keyTimes={k === 0 ? '0;0.14;0.96;1' : `0;${(at - 0.02).toFixed(3)};${at.toFixed(3)};${(at + 0.14).toFixed(3)};1`}
                                />
                            </rect>
                        )}
                        <rect x={x + 20} y={y + 18} width={40} height={40} rx={8} className="d-map__icon" />
                        <g transform={`translate(${x + 28} ${y + 26})`}>
                            <Glyph name={m.glyph} className="d-glyph" size={24} />
                        </g>
                        <text x={x + 74} y={y + 43} className="d-map__type">
                            {m.type}
                        </text>
                        <text x={x + 20} y={y + 88} className="d-map__title">
                            {m.title}
                        </text>
                        {m.lines.map((line, j) => (
                            <text key={line} x={x + 20} y={y + 113 + j * 20} className="d-map__text">
                                {line}
                            </text>
                        ))}
                    </g>
                );
            })}

            {live && (
                <g className="d-map__flow">
                    {WIRES.map((w, k) => (
                        <g key={w.d} className="d-map__token" opacity={0}>
                            <circle r={11} className="d-map__halo" />
                            <circle r={5} />
                            <animateMotion
                                dur={`${TURN}s`}
                                repeatCount="indefinite"
                                path={w.d}
                                calcMode="linear"
                                keyPoints={k === 0 ? '0;1;1' : k === 3 ? '0;0;1' : '0;0;1;1'}
                                keyTimes={k === 0 ? '0;0.25;1' : k === 3 ? '0;0.75;1' : `0;${(k / 4).toFixed(2)};${((k + 1) / 4).toFixed(2)};1`}
                            />
                            <animate
                                attributeName="opacity"
                                dur={`${TURN}s`}
                                repeatCount="indefinite"
                                calcMode="discrete"
                                values={k === 0 ? '1;0' : '0;1;0'}
                                keyTimes={k === 0 ? '0;0.25' : `0;${(k / 4).toFixed(2)};${((k + 1) / 4).toFixed(2)}`}
                            />
                        </g>
                    ))}
                    {PILLS.map((p, j) => (
                        <g key={p.title}>
                            {(p.flow === 'both' ? ['out', 'in'] : [p.flow]).map((dir, n) => (
                                <circle key={dir} r={3.5} className="d-map__drop">
                                    <animateMotion
                                        dur="3.2s"
                                        repeatCount="indefinite"
                                        begin={`${(j * 0.7 + n * 1.6).toFixed(1)}s`}
                                        path={p.wire}
                                        keyPoints={(p.x > 600) === (dir === 'out') ? '0;1' : '1;0'}
                                        keyTimes="0;1"
                                        calcMode="linear"
                                    />
                                </circle>
                            ))}
                        </g>
                    ))}
                </g>
            )}
        </svg>
    );
}
