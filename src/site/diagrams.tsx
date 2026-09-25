/**
 * Engraved diagrams for the website, drawn with the kit in engrave.tsx.
 * Each one shows a mechanism; none of them shows programme data.
 */
import { seeded } from './hooks';
import { Arrow, Ball, Defs, T } from './engrave';
import type { Tone } from './engrave';

/* ── The procedure: requirement, design, screen, make, test, learn ─────── */

const PX = [110, 355, 600, 845, 1090];
const PANELS = [
    { n: '01', name: 'requirement', sub: 'what the part must survive' },
    { n: '02', name: 'design', sub: 'AI suggests ideas' },
    { n: '03', name: 'screen', sub: 'physics checks; most stop here' },
    { n: '04', name: 'make', sub: 'melted and 3D-printed for real' },
    { n: '05', name: 'test', sub: 'measured against the targets' },
];
const HANDOFFS = ['targets', 'ideas', 'survivors', 'samples'];

function Requirement({ px }: { px: number }) {
    return (
        <g>
            <path className="eg-solid" d={`M${px - 60},128 H${px} L${px + 14},142 V240 H${px - 60} Z`} />
            <path className="eg-line" d={`M${px},128 V142 H${px + 14}`} />
            {[52, 40, 56, 30, 48, 36].map((w, k) => (
                <line key={k} className="eg-line eg-line--thin" x1={px - 50} y1={154 + k * 14} x2={px - 50 + w} y2={154 + k * 14} />
            ))}
            <rect className="eg-solid" x={px + 34} y={124} width={12} height={96} rx={6} />
            <line className="eg-mercury" x1={px + 40} y1={150} x2={px + 40} y2={222} />
            {[136, 148, 160, 172, 184, 196].map((y) => (
                <line key={y} className="eg-line eg-line--thin" x1={px + 48} y1={y} x2={px + 55} y2={y} />
            ))}
            <Ball cx={px + 40} cy={230} r={10} tone="mid" />
        </g>
    );
}

const WALKERS: [number, number, Tone][] = [
    [-8, 152, 'white'],
    [12, 172, 'light'],
    [20, 200, 'white'],
    [-24, 208, 'mid'],
    [36, 226, 'light'],
    [-42, 236, 'white'],
    [2, 238, 'dark'],
];

function Design({ px }: { px: number }) {
    return (
        <g>
            <path className="eg-solid eg-solid--open" d={`M${px},116 L${px - 80},254 L${px + 80},254 Z`} />
            {WALKERS.map(([dx, y, tone], k) => (
                <g key={k}>
                    <path
                        className="eg-line eg-line--trail"
                        d={`M${px + dx},${y} q${k % 2 ? 9 : -9},${6} ${k % 2 ? 4 : -5},${16} t${k % 2 ? 7 : -7},${12}`}
                    />
                    <Ball cx={px + dx} cy={y} r={6.5} tone={tone} />
                </g>
            ))}
            <T x={px} y={108} kind="sym">
                A
            </T>
            <T x={px - 90} y={266} kind="sym">
                B
            </T>
            <T x={px + 90} y={266} kind="sym">
                C
            </T>
        </g>
    );
}

function Screen({ px, id }: { px: number; id: string }) {
    const curve = `M${px - 78},150 C${px - 58},150 ${px - 52},206 ${px - 32},206 C${px - 12},206 ${px - 12},166 ${px + 4},166 C${px + 22},166 ${px + 26},224 ${px + 46},224 C${px + 64},224 ${px + 66},158 ${px + 78},156`;
    return (
        <g>
            <path className="eg-fill" fill={`url(#${id}-hatch)`} d={`${curve} L${px + 78},246 L${px - 78},246 Z`} />
            <path className="eg-line eg-line--bold" d={curve} />
            <rect className="eg-frame" x={px - 78} y={128} width={156} height={118} />
            <Ball cx={px - 62} cy={146} r={6.5} tone="dark" />
            <Ball cx={px - 32} cy={197} r={8} tone="light" />
            <Ball cx={px + 46} cy={214} r={9.5} tone="white" />
        </g>
    );
}

function Make({ px, id }: { px: number; id: string }) {
    const powder = [];
    for (let x = px - 70; x <= px + 70; x += 7.4) powder.push(x);
    return (
        <g>
            <rect className="eg-fill" fill={`url(#${id}-dots)`} x={px - 76} y={203} width={152} height={33} />
            <rect className="eg-fill eg-fill--part" fill={`url(#${id}-layers)`} x={px - 42} y={206} width={66} height={30} />
            <rect className="eg-frame" x={px - 42} y={206} width={66} height={30} />
            <rect className="eg-fill" fill={`url(#${id}-fine)`} x={px - 78} y={236} width={156} height={10} />
            <rect className="eg-frame" x={px - 78} y={236} width={156} height={10} />
            {powder.map((x, k) => (
                <Ball key={k} cx={x} cy={199} r={3.4} tone={k % 3 === 0 ? 'light' : 'white'} />
            ))}
            <rect className="eg-solid" x={px + 4} y={116} width={40} height={18} rx={2} />
            <path className="eg-fill eg-beam" fill={`url(#${id}-fine)`} d={`M${px + 16},134 L${px + 32},134 L${px + 9},196 Z`} />
            <path className="eg-line eg-line--thin" d={`M${px + 16},134 L${px + 9},196 L${px + 32},134`} />
            <ellipse className="eg-melt" cx={px + 9} cy={199} rx={7} ry={4} />
        </g>
    );
}

function Test({ px, id }: { px: number; id: string }) {
    const bone = `M${px - 16},134 V160 C${px - 16},170 ${px - 8},168 ${px - 8},178 V214 C${px - 8},224 ${px - 16},222 ${px - 16},232 V244 H${px + 16} V232 C${px + 16},222 ${px + 8},224 ${px + 8},214 V178 C${px + 8},168 ${px + 16},170 ${px + 16},160 V134 Z`;
    return (
        <g>
            <path className="eg-solid" d={bone} />
            {[2.5, 5].map((dx) => (
                <line key={dx} className="eg-line eg-line--thin" x1={px + dx} y1={182} x2={px + dx} y2={210} />
            ))}
            <rect className="eg-fill" fill={`url(#${id}-hatch)`} x={px - 26} y={118} width={52} height={24} />
            <rect className="eg-frame" x={px - 26} y={118} width={52} height={24} />
            <rect className="eg-fill" fill={`url(#${id}-hatch)`} x={px - 26} y={236} width={52} height={24} />
            <rect className="eg-frame" x={px - 26} y={236} width={52} height={24} />
            <Arrow id={id} d={`M${px},118 V100`} />
            <Arrow id={id} d={`M${px},260 V278`} />
            <T x={px + 12} y={108} kind="sym" anchor="start">
                F
            </T>
            <T x={px + 12} y={278} kind="sym" anchor="start">
                F
            </T>
        </g>
    );
}

/** `active` 0–4 marks a panel, 5 marks the return arrow (learn). */
export function ProcedureDiagram({ active, onPick }: { active: number; onPick: (i: number) => void }) {
    const id = 'eg-proc';
    return (
        <svg className="eg eg--procedure" viewBox="0 0 1200 400" role="img" aria-labelledby={`${id}-title`}>
            <title id={`${id}-title`}>
                The PRISM loop: a requirement, then design, screen, make and test; every result goes back to design.
                Evidence is recorded at every step.
            </title>
            <Defs id={id} />
            <defs>
                <pattern id={`${id}-dots`} width="5" height="5" patternUnits="userSpaceOnUse">
                    <circle className="eg-dot" cx="2.5" cy="2.5" r="0.8" />
                </pattern>
            </defs>

            <line className="eg-line eg-line--dashed" x1={40} y1={30} x2={1160} y2={30} />
            <T x={40} y={18} kind="small" anchor="start">
                evidence · every step is recorded: what went in, who owns it, who may see it
            </T>
            {PX.map((x) => (
                <line key={x} className="eg-line eg-line--thin" x1={x} y1={30} x2={x} y2={46} />
            ))}

            {PANELS.map((p, i) => (
                <g key={p.name} className={`eg-panel${active === i ? ' is-on' : ''}`} onClick={() => onPick(i)}>
                    <rect className="eg-panel__bg" x={PX[i] - 110} y={50} width={220} height={236} rx={6} />
                    <T x={PX[i]} y={70} kind="strong">
                        {p.n} · {p.name}
                    </T>
                    <T x={PX[i]} y={88} kind="small">
                        {p.sub}
                    </T>
                    {i === 0 && <Requirement px={PX[i]} />}
                    {i === 1 && <Design px={PX[i]} />}
                    {i === 2 && <Screen px={PX[i]} id={id} />}
                    {i === 3 && <Make px={PX[i]} id={id} />}
                    {i === 4 && <Test px={PX[i]} id={id} />}
                </g>
            ))}

            {HANDOFFS.map((h, i) => (
                <g key={h}>
                    <Arrow id={id} d={`M${PX[i] + 86},192 H${PX[i + 1] - 86}`} />
                    <T x={(PX[i] + PX[i + 1]) / 2} y={182} kind="small">
                        {h}
                    </T>
                </g>
            ))}

            <g className={`eg-panel eg-panel--learn${active === 5 ? ' is-on' : ''}`} onClick={() => onPick(5)}>
                <Arrow
                    id={id}
                    className="eg-line--return"
                    d={`M${PX[4]},292 C${PX[4]},332 ${PX[4] - 20},338 ${PX[4] - 50},338 H${PX[1] + 50} C${PX[1] + 20},338 ${PX[1]},332 ${PX[1]},296`}
                />
                <T x={(PX[1] + PX[4]) / 2} y={364} kind="strong">
                    06 · learn
                </T>
                <T x={(PX[1] + PX[4]) / 2} y={382} kind="small">
                    every result, good or bad, updates the models and picks the next experiment
                </T>
            </g>
        </svg>
    );
}

/* ── The ladder: rungs of rising cost ─────────────────────────────────── */

const RUNGS = [
    { q: 'is it stable at all?', how: 'fast AI simulation', time: 'seconds', n: 48, pass: 24, cols: 12, r: 5.2, gap: 15 },
    { q: 'is the energy right?', how: 'exact quantum calculation', time: 'hours', n: 24, pass: 10, cols: 8, r: 7, gap: 19 },
    { q: 'what forms at each temperature?', how: 'phase diagrams', time: 'minutes', n: 10, pass: 5, cols: 5, r: 8.5, gap: 23 },
    { q: 'can it be 3D-printed?', how: 'printability check', time: 'seconds', n: 5, pass: 2, cols: 5, r: 9.5, gap: 26 },
    { q: 'does it meet the requirement?', how: 'make and test', time: 'weeks', n: 2, pass: 1, cols: 2, r: 12, gap: 34 },
];

export function LadderDiagram() {
    const id = 'eg-ladder';
    const rand = seeded(41);
    const base = 330;
    const layout = RUNGS.map((g, i) => {
        const x = 40 + i * 232;
        const w = 196;
        const top = base - (50 + i * 45);
        const rows = Math.ceil(g.n / g.cols);
        const passing = new Set<number>();
        while (passing.size < g.pass) passing.add(Math.floor(rand() * g.n));
        const balls = Array.from({ length: g.n }, (_, k) => {
            const row = Math.floor(k / g.cols);
            const inRow = Math.min(g.cols, g.n - row * g.cols);
            const col = k % g.cols;
            return {
                cx: x + w / 2 + (col - (inRow - 1) / 2) * g.gap,
                cy: top - g.r - 2 - row * g.gap * 0.86,
                pass: passing.has(k),
            };
        });
        const half = ((Math.min(g.cols, g.n) - 1) / 2) * g.gap + g.r;
        const topY = top - g.r - 2 - (rows - 1) * g.gap * 0.86 - g.r;
        return { ...g, x, w, top, balls, half, topY };
    });
    const last = layout[layout.length - 1];
    const chosen = last.balls.find((b) => b.pass)!;
    return (
        <svg className="eg eg--ladder" viewBox="0 0 1200 474" role="img" aria-labelledby={`${id}-title`}>
            <title id={`${id}-title`}>
                The PRISM ladder: a fast AI simulation, an exact quantum calculation, phase diagrams, a printability
                check, then make and test. Each step costs more than the one before, and most ideas stop early. Counts
                are illustrative.
            </title>
            <Defs id={id} />
            <Ball cx={50} cy={34} r={7} tone="white" />
            <T x={66} y={39} kind="plain" anchor="start">
                passes this step
            </T>
            <Ball cx={50} cy={58} r={7} tone="dark" />
            <T x={66} y={63} kind="plain" anchor="start">
                stops here
            </T>

            {layout.map((g, i) => (
                <g key={g.q}>
                    <rect className="eg-fill" fill={`url(#${id}-hatch)`} x={g.x} y={g.top} width={g.w} height={base - g.top} />
                    <rect className="eg-frame" x={g.x} y={g.top} width={g.w} height={base - g.top} />
                    {g.balls.map((b, k) => (
                        <Ball key={k} cx={b.cx} cy={b.cy} r={g.r} tone={b.pass ? 'white' : 'dark'} />
                    ))}
                    <T x={g.x + g.w / 2} y={356} kind="strong">
                        {i} · {g.q}
                    </T>
                    <T x={g.x + g.w / 2} y={375} kind="plain">
                        {g.how}
                    </T>
                    <T x={g.x + g.w / 2} y={394} kind="small">
                        {g.time}
                    </T>
                    {i < layout.length - 1 && (
                        <Arrow
                            id={id}
                            d={`M${g.x + g.w / 2 + g.half + 6},${g.topY + 4} L${layout[i + 1].x + g.w / 2 - layout[i + 1].half - 10},${layout[i + 1].topY + 2}`}
                        />
                    )}
                </g>
            ))}
            <circle className="eg-halo" cx={chosen.cx} cy={chosen.cy} r={last.r + 6} />
            <T x={last.x + last.w / 2} y={last.topY - 18} kind="strong">
                a material, with its evidence
            </T>

            <Arrow id={id} d="M40,418 H1160" />
            <T x={600} y={444} kind="plain">
                each step checks something the step before cannot see
            </T>
            <T x={600} y={463} kind="small">
                heights show the order, not the cost · times are typical per idea · counts are illustrative
            </T>
        </svg>
    );
}

/* ── What a part gives away, and what it cannot carry ─────────────────── */

/** The ladder for phones: the same rungs, top to bottom, each bar as long as the ideas that reach it. */
export function LadderList() {
    const most = RUNGS[0].n;
    return (
        <ol className="ladder-m" aria-label="The ladder, step by step. Counts are illustrative.">
            {RUNGS.map((g, i) => (
                <li key={g.q}>
                    <p className="ladder-m__q">
                        <span>{i}</span> {g.q.charAt(0).toUpperCase() + g.q.slice(1)}
                    </p>
                    <p className="ladder-m__how">
                        {g.how} · {g.time}
                    </p>
                    <span className="ladder-m__bar" style={{ ['--w' as string]: `${(g.n / most) * 100}%` }}>
                        <i style={{ ['--p' as string]: `${(g.pass / g.n) * 100}%` }} />
                    </span>
                    <p className="ladder-m__n">
                        {g.n} in, {g.pass} {i === RUNGS.length - 1 ? 'chosen' : 'pass'}
                    </p>
                </li>
            ))}
        </ol>
    );
}

function wave(x0: number, y0: number, x1: number, y1: number) {
    const n = Math.round(Math.hypot(x1 - x0, y1 - y0) / 7);
    const nx = -(y1 - y0) / Math.hypot(x1 - x0, y1 - y0);
    const ny = (x1 - x0) / Math.hypot(x1 - x0, y1 - y0);
    let d = `M${x0},${y0}`;
    for (let k = 1; k <= n; k++) {
        const t = k / n;
        const s = Math.sin(k * 1.4) * 3;
        d += ` L${(x0 + (x1 - x0) * t + nx * s).toFixed(1)},${(y0 + (y1 - y0) * t + ny * s).toFixed(1)}`;
    }
    return d;
}

export function PartDiagram() {
    const id = 'eg-part';
    return (
        <svg className="eg eg--part" viewBox="0 0 1000 330" role="img" aria-labelledby={`${id}-title`}>
            <title id={`${id}-title`}>
                What testing a part reveals: what it is made of, its trace gases and its inner structure. What stays with
                the owner: the safe settings, the failures, the history and the proof.
            </title>
            <Defs id={id} />
            <T x={40} y={26} kind="head" anchor="start">
                what testing a part reveals
            </T>
            <T x={640} y={26} kind="head" anchor="start">
                what stays with its owner
            </T>

            {/* X-ray fluorescence */}
            <rect className="eg-solid" x={48} y={66} width={70} height={28} rx={4} />
            <rect className="eg-solid" x={118} y={73} width={14} height={14} />
            <path className="eg-line eg-line--thin" d={wave(132, 80, 426, 110)} />
            <T x={48} y={116} kind="strong" anchor="start">
                what it is made of
            </T>
            <T x={48} y={133} kind="small" anchor="start">
                standard lab analysis
            </T>

            {/* Gas fusion */}
            <path className="eg-solid" d="M56,150 H112 L104,184 H64 Z" />
            <path className="eg-line eg-line--thin" d="M60,192 q6,-5 12,0 t12,0 t12,0 t12,0" />
            <Arrow id={id} dashed d="M120,168 L424,172" />
            <T x={48} y={214} kind="strong" anchor="start">
                trace gases
            </T>
            <T x={48} y={231} kind="small" anchor="start">
                oxygen, nitrogen and carbon
            </T>

            {/* Electron column */}
            <rect className="eg-solid" x={48} y={250} width={62} height={24} rx={3} />
            <path className="eg-solid" d="M110,250 L128,262 L110,274 Z" />
            <path className="eg-line eg-line--thin" d="M128,262 L426,232" />
            <T x={48} y={296} kind="strong" anchor="start">
                inner structure
            </T>
            <T x={48} y={313} kind="small" anchor="start">
                X-ray and electron microscopes
            </T>

            {/* The part */}
            <path className="eg-solid" d="M430,72 V262 A50,12 0 0 0 530,262 V72 Z" />
            {[492, 502, 510, 517, 522, 526].map((x) => (
                <line key={x} className="eg-line eg-line--thin" x1={x} y1={82} x2={x} y2={270 - (x - 480) / 6} />
            ))}
            <ellipse className="eg-solid eg-solid--top" cx={480} cy={72} rx={50} ry={12} />
            <T x={480} y={300} kind="strong">
                a part
            </T>
            <T x={480} y={317} kind="small">
                what anyone can hold
            </T>

            <line className="eg-line eg-line--dashed" x1={596} y1={44} x2={596} y2={316} />

            {/* The window */}
            <rect className="eg-frame" x={640} y={60} width={62} height={34} />
            <path className="eg-fill" fill={`url(#${id}-hatch)`} d="M646,90 L666,64 L697,64 L677,90 Z" />
            <path className="eg-line eg-line--thin" d="M646,90 L666,64 L697,64 L677,90 Z" />
            <T x={722} y={74} kind="strong" anchor="start">
                the safe settings
            </T>
            <T x={722} y={91} kind="small" anchor="start">
                what still works when powder and machine vary
            </T>

            {/* The failures */}
            <Ball cx={651} cy={144} r={9} tone="dark" />
            <Ball cx={672} cy={144} r={9} tone="dark" />
            <Ball cx={693} cy={144} r={9} tone="white" />
            <T x={722} y={140} kind="strong" anchor="start">
                the failures
            </T>
            <T x={722} y={157} kind="small" anchor="start">
                every idea that did not work, and why
            </T>

            {/* The lineage */}
            <path className="eg-line" d="M644,208 H700" />
            {[644, 663, 682, 701].map((x, k) => (
                <Ball key={x} cx={x} cy={208} r={6} tone={k === 3 ? 'mid' : 'white'} />
            ))}
            <T x={722} y={204} kind="strong" anchor="start">
                the history
            </T>
            <T x={722} y={221} kind="small" anchor="start">
                from requirement to decision, with owners
            </T>

            {/* The proof */}
            <path className="eg-solid" d="M640,254 H692 L702,268 L692,282 H640 Z" />
            <circle className="eg-solid" cx={692} cy={268} r={2.5} />
            <path className="eg-line eg-line--bold" d="M652,268 L660,275 L675,259" />
            <T x={722} y={266} kind="strong" anchor="start">
                the proof
            </T>
            <T x={722} y={283} kind="small" anchor="start">
                the test results, and the know-how to make it again
            </T>
        </svg>
    );
}

/* ── A known answer, reproduced (Forager) ─────────────────────────────── */

export function KnownAnswer() {
    const id = 'eg-known';
    const X = (t: number) => 70 + (t / 3000) * 860;
    const bar = (t: number, e: number, y: number, open: boolean) => (
        <g>
            <path className="eg-line" d={`M${X(t - e)},${y} H${X(t + e)} M${X(t - e)},${y - 6} V${y + 6} M${X(t + e)},${y - 6} V${y + 6}`} />
            <circle className={open ? 'eg-point eg-point--open' : 'eg-point'} cx={X(t)} cy={y} r={6} />
        </g>
    );
    return (
        <svg className="eg eg--known" viewBox="0 0 1000 222" role="img" aria-labelledby={`${id}-title`}>
            <title id={`${id}-title`}>
                A known answer, checked: for a 50/50 mix of molybdenum and tantalum, Forager gives 1149 plus or minus 114
                kelvin, inside the pass band of 500 to 2600 kelvin agreed before the run. The published value is 2020
                kelvin.
            </title>
            <Defs id={id} />
            <path className="eg-line eg-line--bold" d="M40,22 L48,30 L62,14" />
            <T x={74} y={28} kind="strong" anchor="start">
                a known answer, checked first: a 50/50 mix of molybdenum and tantalum (Mo–Ta)
            </T>
            <T x={X(1149)} y={82} kind="strong">
                this model: 1149 ± 114 K
            </T>
            {bar(1149, 114, 104, false)}
            <T x={X(2020)} y={82} kind="plain">
                published: 2020 K (± 545 K)
            </T>
            {bar(2020, 545, 104, true)}
            <rect className="eg-fill" fill={`url(#${id}-hatch)`} x={X(500)} y={136} width={X(2600) - X(500)} height={12} />
            <rect className="eg-frame" x={X(500)} y={136} width={X(2600) - X(500)} height={12} />
            <Arrow id={id} d={`M${X(0)},148 H${X(3000) + 20}`} />
            {[0, 1000, 2000, 3000].map((t) => (
                <g key={t}>
                    <line className="eg-line" x1={X(t)} y1={148} x2={X(t)} y2={155} />
                    <T x={X(t)} y={174} kind="small">
                        {t === 3000 ? '3000 K' : String(t)}
                    </T>
                </g>
            ))}
            <T x={(X(500) + X(2600)) / 2} y={202} kind="plain">
                agreed before the run: a pass if it lands between 500 and 2600 K
            </T>
        </svg>
    );
}

/** The known answer for phones: one scale, the pass band agreed first, both results placed on it. */
export function KnownAnswerList() {
    const at = (t: number) => `${(t / 3000) * 100}%`;
    return (
        <div className="known-m" role="img" aria-label="A known answer, checked: for a 50/50 mix of molybdenum and tantalum, Forager gives 1149 plus or minus 114 kelvin, inside the pass band of 500 to 2600 kelvin agreed before the run. The published value is 2020 kelvin.">
            <p className="known-m__head">
                <span aria-hidden="true">✓</span> A known answer, checked first: a 50/50 mix of molybdenum and tantalum
            </p>
            <div className="known-m__scale" aria-hidden="true">
                <span className="known-m__band" style={{ left: at(500), width: at(2100) }} />
                <span className="known-m__dot known-m__dot--ours" style={{ left: at(1149) }} />
                <span className="known-m__dot" style={{ left: at(2020) }} />
                <span className="known-m__tick" style={{ left: '0%' }}>0</span>
                <span className="known-m__tick" style={{ left: at(1000) }}>1000</span>
                <span className="known-m__tick" style={{ left: at(2000) }}>2000</span>
                <span className="known-m__tick" style={{ left: '100%' }}>3000 K</span>
            </div>
            <dl className="known-m__list" aria-hidden="true">
                <div>
                    <dt><i className="known-m__key known-m__key--ours" /> This model</dt>
                    <dd>1149 ± 114 K</dd>
                </div>
                <div>
                    <dt><i className="known-m__key" /> Published</dt>
                    <dd>2020 ± 545 K</dd>
                </div>
                <div>
                    <dt><i className="known-m__key known-m__key--band" /> Pass, agreed before the run</dt>
                    <dd>500 to 2600 K</dd>
                </div>
            </dl>
        </div>
    );
}
