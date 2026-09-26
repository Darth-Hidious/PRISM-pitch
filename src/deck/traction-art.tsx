import { useEffect, useId, useRef } from 'react';
import { seeded } from '../site/hooks';
import { useLive } from './slideContext';

/*
 * The drawings on the Traction slide, one per programme. Illustrations, not data: no element, no
 * composition and no chemistry is named or implied beyond what the card says.
 */

/** The five hues of the PRISM spectrum; in the crystal, five different elements. */
const HUES = ['#6b4c9e', '#2f7ecf', '#86a23a', '#f6a21f', '#ec3f37'];

function mix(hex: string, to: number, amount: number) {
    const n = parseInt(hex.slice(1), 16);
    const ch = [n >> 16, (n >> 8) & 255, n & 255].map((c) => Math.round(c + (to - c) * amount));
    return `#${ch.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/** A sphere's shading: light from the upper left. */
function SphereFill({ id, hue }: { id: string; hue: string }) {
    return (
        <radialGradient id={id} cx="36%" cy="30%" r="72%">
            <stop offset="0" stopColor={mix(hue, 255, 0.62)} />
            <stop offset="0.5" stopColor={hue} />
            <stop offset="1" stopColor={mix(hue, 0, 0.42)} />
        </radialGradient>
    );
}

/** The id React gives, made safe for url(#…). */
const useSafeId = () => useId().replace(/[^a-zA-Z0-9_-]/g, '');

/* ── Project SPARK: a high-entropy alloy, several elements sharing one crystal ── */

const N = 2; // unit cells along each edge
const TILT = -0.5; // looking a little from above
const THETA0 = 0.62; // the still frame, and where the turn starts
const LCX = 150;
const LCY = 124;
const LS = 50; // pixels per lattice unit
const LR = 0.2; // atom radius, in lattice units

interface Lattice {
    atoms: { p: [number, number, number]; hue: number }[];
    edges: [number, number][];
}

/** Body-centred cubic, N × N × N cells: corner atoms, one in each cell's centre, elements dealt out evenly at random. */
function buildLattice(): Lattice {
    const h = N / 2;
    const atoms: Lattice['atoms'] = [];
    const corner = new Map<string, number>();
    for (let i = 0; i <= N; i++)
        for (let j = 0; j <= N; j++)
            for (let k = 0; k <= N; k++) {
                corner.set(`${i},${j},${k}`, atoms.length);
                atoms.push({ p: [i - h, j - h, k - h], hue: 0 });
            }
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) for (let k = 0; k < N; k++) atoms.push({ p: [i + 0.5 - h, j + 0.5 - h, k + 0.5 - h], hue: 0 });
    // Near-equal shares of five elements, shuffled: a random solid solution.
    const rand = seeded(8);
    const deal = atoms.map((_, i) => i % HUES.length);
    for (let i = deal.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [deal[i], deal[j]] = [deal[j], deal[i]];
    }
    atoms.forEach((a, i) => (a.hue = deal[i]));
    const edges: [number, number][] = [];
    for (let i = 0; i <= N; i++)
        for (let j = 0; j <= N; j++)
            for (let k = 0; k <= N; k++) {
                const a = corner.get(`${i},${j},${k}`)!;
                if (i < N) edges.push([a, corner.get(`${i + 1},${j},${k}`)!]);
                if (j < N) edges.push([a, corner.get(`${i},${j + 1},${k}`)!]);
                if (k < N) edges.push([a, corner.get(`${i},${j},${k + 1}`)!]);
            }
    return { atoms, edges };
}

let LATTICE: Lattice | null = null;
const latticeOnce = () => (LATTICE ??= buildLattice());

/** Turns about the vertical axis, tips towards the viewer, with a little perspective. */
function project([x, y, z]: [number, number, number], theta: number) {
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const x1 = x * c + z * s;
    const z1 = -x * s + z * c;
    const y2 = y * Math.cos(TILT) - z1 * Math.sin(TILT);
    const z2 = y * Math.sin(TILT) + z1 * Math.cos(TILT);
    const f = 8 / (8 - z2);
    return { x: LCX + x1 * LS * f, y: LCY - y2 * LS * f, z: z2, f };
}

function latticeFrame(theta: number) {
    const { atoms } = latticeOnce();
    const pts = atoms.map((a) => project(a.p, theta));
    const order = pts.map((_, i) => i).sort((a, b) => pts[a].z - pts[b].z);
    return { pts, order };
}

export function HeaLattice() {
    const { live } = useLive();
    const id = useSafeId();
    const svg = useRef<SVGSVGElement>(null);
    const { atoms, edges } = latticeOnce();
    const still = latticeFrame(THETA0);

    useEffect(() => {
        const root = svg.current;
        if (!live || !root) return;
        const layer = root.querySelector<SVGGElement>('[data-atoms]')!;
        const balls = [...layer.querySelectorAll<SVGCircleElement>('circle')];
        const byIndex = new Map(balls.map((b) => [Number(b.dataset.i), b]));
        const lines = [...root.querySelectorAll<SVGLineElement>('[data-edges] line')];
        let raf = 0;
        const t0 = performance.now();
        const tick = (now: number) => {
            const { pts, order } = latticeFrame(THETA0 + ((now - t0) / 1000) * 0.2);
            for (const i of order) {
                const b = byIndex.get(i)!;
                b.setAttribute('cx', pts[i].x.toFixed(2));
                b.setAttribute('cy', pts[i].y.toFixed(2));
                b.setAttribute('r', (LR * LS * pts[i].f).toFixed(2));
                layer.appendChild(b); // back to front
            }
            edges.forEach(([a, b], k) => {
                lines[k].setAttribute('x1', pts[a].x.toFixed(2));
                lines[k].setAttribute('y1', pts[a].y.toFixed(2));
                lines[k].setAttribute('x2', pts[b].x.toFixed(2));
                lines[k].setAttribute('y2', pts[b].y.toFixed(2));
            });
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [live, edges]);

    return (
        <svg ref={svg} viewBox="0 0 300 232" role="img" aria-label="Illustration: a high-entropy alloy, several elements sharing one crystal lattice.">
            <defs>
                {HUES.map((h, i) => (
                    <SphereFill key={h} id={`${id}-h${i}`} hue={h} />
                ))}
            </defs>
            <g data-edges stroke="var(--ink-3)" strokeOpacity="0.4" strokeWidth="1">
                {edges.map(([a, b], k) => (
                    <line key={k} x1={still.pts[a].x} y1={still.pts[a].y} x2={still.pts[b].x} y2={still.pts[b].y} />
                ))}
            </g>
            <g data-atoms>
                {still.order.map((i) => (
                    <circle key={i} data-i={i} cx={still.pts[i].x} cy={still.pts[i].y} r={LR * LS * still.pts[i].f} fill={`url(#${id}-h${atoms[i].hue})`} />
                ))}
            </g>
        </svg>
    );
}

/* ── PRISM Alpha: technology readiness, from level 3 to 4 ─────────────── */

export function TrlSteps() {
    const { live } = useLive();
    const x = (i: number) => 26 + i * 28;
    const h = (i: number) => 22 + i * 13;
    const base = 176;
    return (
        <svg viewBox="0 0 300 232" role="img" aria-label="Technology readiness levels 1 to 9: levels 1 to 3 reached, level 4 under way.">
            <text x="26" y="222" fill="var(--ink-3)" style={{ font: '600 10.5px var(--font-mono)', letterSpacing: '0.08em' }}>
                TECHNOLOGY READINESS LEVEL
            </text>
            {Array.from({ length: 9 }, (_, i) => {
                const done = i < 3;
                const now = i === 3;
                return (
                    <g key={i}>
                        <rect
                            x={x(i)}
                            y={base - h(i)}
                            width="22"
                            height={h(i)}
                            rx="2"
                            fill={done ? 'var(--accent)' : 'none'}
                            stroke={done || now ? 'var(--accent)' : 'var(--rule)'}
                            strokeWidth={now ? 1.6 : 1}
                            strokeDasharray={done || now ? undefined : '3 3'}
                        />
                        {now && (
                            <rect className={`trl-fill${live ? ' is-live' : ''}`} x={x(i)} y={base - h(i)} width="22" height={h(i)} rx="2" fill="var(--accent)" />
                        )}
                        <text
                            x={x(i) + 11}
                            y={base + 18}
                            textAnchor="middle"
                            fill={done || now ? 'var(--accent)' : 'var(--ink-3)'}
                            style={{ font: `${done || now ? 700 : 500} 12px var(--font-mono)` }}
                        >
                            {i + 1}
                        </text>
                    </g>
                );
            })}
            <path d={`M ${x(2) + 11} ${base - h(2) - 10} C ${x(2) + 14} ${base - h(3) - 34}, ${x(3) + 8} ${base - h(3) - 34}, ${x(3) + 11} ${base - h(3) - 12}`} fill="none" stroke="var(--teal)" strokeWidth="1.6" />
            <path d={`M ${x(3) + 6} ${base - h(3) - 20} L ${x(3) + 11} ${base - h(3) - 11} L ${x(3) + 16} ${base - h(3) - 19}`} fill="none" stroke="var(--teal)" strokeWidth="1.6" strokeLinejoin="round" />
            <text x={x(3) + 26} y={base - h(3) - 30} fill="var(--teal-text)" style={{ font: '700 12px var(--font-sans)' }}>
                12 months
            </text>
        </svg>
    );
}

/* ── PFAS-free polymers: a chain of repeating units ───────────────────── */

const CHAIN = 10;
const cx = (i: number) => 27 + i * 27.3;
/** The zig-zag: odd atoms high, even atoms low, plus the chain's slow wave. */
const cy = (i: number, w: number) => 142 + (i % 2 ? -13 : 13) + w;
/** Side groups on every second atom, all on the same side. */
const SIDES = [1, 3, 5, 7, 9];
const STEM = 40;

function chainFrame(t: number) {
    return Array.from({ length: CHAIN }, (_, i) => Math.sin(t * 1.5 + i * 0.75) * 4);
}

export function PolymerChain() {
    const { live } = useLive();
    const id = useSafeId();
    const svg = useRef<SVGSVGElement>(null);
    const still = chainFrame(0);

    useEffect(() => {
        const root = svg.current;
        if (!live || !root) return;
        const back = [...root.querySelectorAll<SVGCircleElement>('[data-back] circle')];
        const side = [...root.querySelectorAll<SVGCircleElement>('[data-side] circle')];
        const bonds = root.querySelector<SVGPathElement>('[data-bonds]')!;
        const stems = [...root.querySelectorAll<SVGLineElement>('[data-stems] line')];
        let raf = 0;
        const t0 = performance.now();
        const tick = (now: number) => {
            const w = chainFrame((now - t0) / 1000);
            back.forEach((b, i) => b.setAttribute('cy', cy(i, w[i]).toFixed(2)));
            bonds.setAttribute('d', 'M ' + w.map((wi, i) => `${cx(i)} ${cy(i, wi).toFixed(2)}`).join(' L '));
            SIDES.forEach((i, k) => {
                side[k].setAttribute('cy', (cy(i, w[i]) - STEM).toFixed(2));
                stems[k].setAttribute('y1', cy(i, w[i]).toFixed(2));
                stems[k].setAttribute('y2', (cy(i, w[i]) - STEM).toFixed(2));
            });
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [live]);

    // The brackets hold one repeating unit: two chain atoms and the side group on the first.
    const bl = (cx(4) + cx(5)) / 2;
    const br = (cx(6) + cx(7)) / 2;
    return (
        <svg ref={svg} viewBox="0 0 300 232" role="img" aria-label="Illustration: a polymer, one repeating unit along a long chain.">
            <defs>
                <SphereFill id={`${id}-c`} hue="#23395f" />
                <SphereFill id={`${id}-s`} hue="#2e8781" />
            </defs>
            {/* The chain carries on beyond the picture. */}
            <path
                d={`M 2 ${cy(1, 0)} L ${cx(0)} ${cy(0, still[0])} M ${cx(CHAIN - 1)} ${cy(CHAIN - 1, still[CHAIN - 1])} L 298 ${cy(CHAIN, 0)}`}
                stroke="#23395f"
                strokeOpacity="0.45"
                strokeWidth="3"
                strokeDasharray="2 4"
                fill="none"
            />
            <g data-stems stroke="#23395f" strokeWidth="3" strokeLinecap="round">
                {SIDES.map((i) => (
                    <line key={i} x1={cx(i)} y1={cy(i, still[i])} x2={cx(i)} y2={cy(i, still[i]) - STEM} />
                ))}
            </g>
            <path data-bonds d={'M ' + still.map((w, i) => `${cx(i)} ${cy(i, w)}`).join(' L ')} fill="none" stroke="#23395f" strokeWidth="3.4" strokeLinejoin="round" />
            <g data-side>
                {SIDES.map((i) => (
                    <circle key={i} cx={cx(i)} cy={cy(i, still[i]) - STEM} r="10.5" fill={`url(#${id}-s)`} />
                ))}
            </g>
            <g data-back>
                {still.map((w, i) => (
                    <circle key={i} cx={cx(i)} cy={cy(i, w)} r="8.5" fill={`url(#${id}-c)`} />
                ))}
            </g>
            <path d={`M ${bl + 7} 70 h -7 v 102 h 7 M ${br - 7} 70 h 7 v 102 h -7`} fill="none" stroke="var(--ink-2)" strokeWidth="1.6" />
            <text x={br + 4} y="184" fill="var(--ink-2)" style={{ font: 'italic 600 16px Georgia, serif' }}>
                n
            </text>
        </svg>
    );
}

/* ── Fusion heritage: a tokamak in cross-section, the first wall picked out ── */

/** A point on a D-shaped surface (Miller's shaping): centre, minor radius, elongation, triangularity. */
function dPoint(r0: number, a: number, kappa: number, delta: number, t: number) {
    return [r0 + a * Math.cos(t + delta * Math.sin(t)), 116 - kappa * a * Math.sin(t)] as const;
}

function dShape(r0: number, a: number, kappa: number, delta: number, steps = 96) {
    let d = '';
    for (let i = 0; i <= steps; i++) {
        const [px, py] = dPoint(r0, a, kappa, delta, (i / steps) * Math.PI * 2);
        d += `${i ? 'L' : 'M'} ${px.toFixed(2)} ${py.toFixed(2)} `;
    }
    return d + 'Z';
}

const WALL = [168, 70, 1.4, 0.4] as const;

export function TokamakSection() {
    const { live } = useLive();
    const id = useSafeId();
    const surfaces = [1, 0.78, 0.56, 0.34].map((k) => dShape(170 + (1 - k) * 10, 60 * k, 1.5 - (1 - k) * 0.15, 0.42 * k));
    const [lx, ly] = dPoint(...WALL, 0.62);
    return (
        <svg viewBox="0 0 300 232" role="img" aria-label="Illustration: a tokamak in cross-section; the first wall faces the plasma.">
            <defs>
                <radialGradient id={`${id}-core`} cx="50%" cy="50%" r="50%">
                    <stop offset="0" stopColor="#ffd08a" />
                    <stop offset="0.45" stopColor="#f6a21f" stopOpacity="0.75" />
                    <stop offset="1" stopColor="#ec3f37" stopOpacity="0" />
                </radialGradient>
                <pattern id={`${id}-coil`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="5" stroke="var(--ink-3)" strokeWidth="1" />
                </pattern>
            </defs>
            {/* The central column the torus turns around. */}
            <rect x="34" y="50" width="22" height="160" rx="3" fill={`url(#${id}-coil)`} stroke="var(--ink-3)" strokeWidth="1" />
            <path d={dShape(168, 80, 1.3, 0.38)} fill="none" stroke="var(--ink-3)" strokeWidth="1.2" />
            <ellipse className={`tok-core${live ? ' is-live' : ''}`} cx="182" cy="116" rx="48" ry="70" fill={`url(#${id}-core)`} />
            {surfaces.map((d, i) => (
                <path key={i} d={d} fill="none" stroke="var(--accent)" strokeOpacity={i ? 0.55 : 0.8} strokeWidth={i ? 1 : 1.3} className={`tok-flux${live ? ' is-live' : ''}`} />
            ))}
            {/* The first wall: tiles facing the plasma. */}
            <path d={dShape(...WALL)} fill="none" stroke="var(--teal)" strokeWidth="5" strokeDasharray="9 2.5" />
            <path d={`M ${lx + 4} ${ly - 4} L 262 24 H 294`} fill="none" stroke="var(--teal)" strokeWidth="1.2" />
            <text x="294" y="18" textAnchor="end" fill="var(--teal-text)" style={{ font: '700 11.5px var(--font-sans)' }}>
                first wall
            </text>
        </svg>
    );
}
