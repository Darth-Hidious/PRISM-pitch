/**
 * A real lineage from published work: how NIST's CAMEO found a new
 * phase-change material. Every fact on it comes from Kusne et al., Nature
 * Communications 11, 5966 (2020), or NIST's release of 24 November 2020,
 * and each step names where. Drawn with the engraving kit in engrave.tsx.
 */
import type { ComponentType, CSSProperties } from 'react';
import { SourceLine } from '../ds';
import { arc } from './arc';
import { Arrow, Ball, Defs, T } from './engrave';

const ID = 'eg-cameo';

/* ── 01 · The question: glass and crystal, told apart by light ─────────── */

const GLASS: [number, number][] = [
    [20, 56],
    [33, 54],
    [46, 59],
    [58, 55],
    [25, 69],
    [39, 71],
    [53, 68],
    [19, 83],
    [32, 86],
    [46, 82],
    [59, 86],
];
const COLS = [123, 135, 147, 159];
const ROWS = [58, 72, 86];

/** A ray of light coming down onto a block, ending in a straight run for the arrowhead. */
function ray(x: number) {
    let d = `M${x},4`;
    for (let k = 1; k <= 13; k++) d += ` L${(x + 3 * Math.sin(k * 1.15)).toFixed(1)},${4 + k * 2.4}`;
    return `${d} L${x},42`;
}

function Question() {
    const id = `${ID}-1`;
    return (
        <svg className="eg eg--icon" viewBox="0 0 180 120" aria-hidden="true">
            <Defs id={id} />
            <Arrow id={id} d={ray(39)} className="eg-line--thin" />
            <Arrow id={id} d={ray(141)} className="eg-line--thin" />
            <rect className="eg-frame" x={12} y={48} width={54} height={48} />
            {GLASS.map(([x, y]) => (
                <Ball key={`${x}-${y}`} cx={x} cy={y} r={3.4} tone="light" />
            ))}
            <rect className="eg-frame" x={114} y={48} width={54} height={48} />
            {ROWS.map((y) => (
                <line key={y} className="eg-line eg-line--thin" x1={COLS[0]} y1={y} x2={COLS[3]} y2={y} />
            ))}
            {COLS.map((x) => (
                <line key={x} className="eg-line eg-line--thin" x1={x} y1={ROWS[0]} x2={x} y2={ROWS[2]} />
            ))}
            {ROWS.flatMap((y) => COLS.map((x) => <Ball key={`${x}-${y}`} cx={x} cy={y} r={3.4} tone="white" />))}
            <path
                className="eg-line"
                d="M73,74 H107"
                markerStart={`url(#${id}-arrow)`}
                markerEnd={`url(#${id}-arrow)`}
            />
            <T x={90} y={64} kind="sym">
                ΔE<tspan fontSize="12" dy="4">g</tspan>
            </T>
            <T x={39} y={113} kind="small">
                glass
            </T>
            <T x={141} y={113} kind="small">
                crystal
            </T>
        </svg>
    );
}

/* ── 02 · The options: 177 mixes on one wafer ──────────────────────────── */

const WAFER = { cx: 78, cy: 60, r: 46 };

/**
 * The 177 spots: the grid points nearest the wafer's centre, in whole-number
 * grid units so the choice is exact. The 177th and 178th points lie at
 * different distances, so the set is symmetric and the count is exact.
 */
const SPOTS = (() => {
    const pts: { i: number; j: number; d: number; a: number }[] = [];
    for (let i = -12; i <= 12; i++) for (let j = -12; j <= 12; j++) pts.push({ i, j, d: i * i + j * j, a: Math.atan2(j, i) });
    pts.sort((p, q) => p.d - q.d || p.a - q.a);
    return pts.slice(0, 177);
})();
const PITCH = 5.4;

/** The wafer outline, with its flat at the bottom. */
function waferPath({ cx, cy, r }: typeof WAFER) {
    const p = (deg: number) => {
        const a = (deg * Math.PI) / 180;
        return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
    };
    return `M${p(115)} A${r},${r} 0 1 1 ${p(65)} Z`;
}

const SOURCES: [string, number][] = [
    ['Ge', 22],
    ['Sb', 60],
    ['Te', 98],
];

function Options() {
    const id = `${ID}-2`;
    const { cx, cy, r } = WAFER;
    return (
        <svg className="eg eg--icon" viewBox="0 0 180 120" aria-hidden="true">
            <Defs id={id} />
            <path className="eg-solid" d={waferPath(WAFER)} />
            {SPOTS.map(({ i, j }) => (
                <circle key={`${i}-${j}`} className="eg-spot" cx={cx + i * PITCH} cy={cy - 1.5 + j * PITCH} r={1.55} />
            ))}
            {SOURCES.map(([el, y]) => {
                const dx = 146 - cx;
                const dy = y - cy;
                const len = Math.hypot(dx, dy);
                const ex = cx + (dx / len) * (r + 4);
                const ey = cy + (dy / len) * (r + 4);
                return (
                    <g key={el}>
                        <Arrow id={id} dashed d={`M146,${y} L${ex.toFixed(1)},${ey.toFixed(1)}`} />
                        <T x={152} y={y + 6} kind="sym" anchor="start">
                            {el}
                        </T>
                    </g>
                );
            })}
        </svg>
    );
}

/* ── 03 · What was known: a light scan of every spot ───────────────────── */

function Known() {
    const id = `${ID}-3`;
    // The same wafer seen at a low angle: the spots foreshortened.
    const kx = 70 / WAFER.r;
    const ky = 18 / WAFER.r;
    return (
        <svg className="eg eg--icon" viewBox="0 0 180 120" aria-hidden="true">
            <Defs id={id} />
            <path className="eg-fill" fill={`url(#${id}-fine)`} d="M20,84 V90 A70,18 0 0 0 160,90 V84 A70,18 0 0 1 20,84 Z" />
            <path className="eg-line" d="M20,84 V90 A70,18 0 0 0 160,90 V84" />
            <ellipse className="eg-solid" cx={90} cy={84} rx={70} ry={18} />
            {SPOTS.map(({ i, j }) => (
                <ellipse
                    key={`${i}-${j}`}
                    className="eg-spot"
                    cx={90 + i * PITCH * kx}
                    cy={84 + (j * PITCH - 1.5) * ky}
                    rx={1.25}
                    ry={0.6}
                />
            ))}
            {/* Polarised light in, reflected light out: ellipsometry. */}
            <rect className="eg-solid" x={12} y={11} width={26} height={13} rx={2} transform="rotate(44 25 17.5)" />
            <Arrow id={id} d="M34,28 L86,79" />
            <line className="eg-line" x1={55.5} y1={56.6} x2={62.5} y2={49.4} />
            <path className="eg-line" d="M94,79 L146,28" />
            <ellipse className="eg-line" cx={121} cy={52.5} rx={7} ry={2.6} transform="rotate(46 121 52.5)" />
            <rect className="eg-solid" x={142} y={11} width={26} height={13} rx={2} transform="rotate(-44 155 17.5)" />
            <Arrow id={id} dashed d="M44,114 H136" />
        </svg>
    );
}

/* ── 04 · The measurements: pick, X-ray, learn, nineteen times ─────────── */

function Measure() {
    const id = `${ID}-4`;
    return (
        <svg className="eg eg--icon" viewBox="0 0 180 120" aria-hidden="true">
            <Defs id={id} />
            <rect className="eg-solid" x={6} y={20} width={32} height={18} rx={2} />
            <line className="eg-line eg-line--thin" x1={12} y1={29} x2={30} y2={29} />
            <path className="eg-line eg-line--bold" d="M38,31 L83,47" />
            <path className="eg-solid" d="M66,48 H104 L98,54 H60 Z" />
            {[24, 38, 52].map((rr) => (
                <path key={rr} className="eg-line eg-line--thin" d={arc(83, 47, rr, -72, -8)} />
            ))}
            {[-58, -36, -16].map((a) => (
                <line
                    key={a}
                    className="eg-line eg-line--thin eg-line--dashed"
                    x1={83}
                    y1={47}
                    x2={(83 + 58 * Math.cos((a * Math.PI) / 180)).toFixed(1)}
                    y2={(47 + 58 * Math.sin((a * Math.PI) / 180)).toFixed(1)}
                />
            ))}
            <rect className="eg-solid" x={150} y={2} width={7} height={52} />
            <Arrow id={id} d="M153,64 C153,96 130,104 92,104 C52,104 26,98 22,48" />
            <T x={92} y={95} kind="sym">
                × 19
            </T>
            <circle className="eg-solid" cx={168} cy={82} r={4.5} />
            <path className="eg-solid" d="M160,100 C160,90 176,90 176,100 Z" />
        </svg>
    );
}

/* ── 05 · The answer: ΔEg of the new material against GST225 ──────────── */

/** Pixels per electronvolt on the bar scale. */
const EV = 95;
const BASE = 100;

function Answer() {
    const id = `${ID}-5`;
    const bars = [
        { name: 'GST225', v: 0.23, x: 50, fill: 'hatch' },
        { name: 'GST467', v: 0.76, x: 102, fill: 'fine' },
    ];
    return (
        <svg className="eg eg--icon" viewBox="0 0 180 120" aria-hidden="true">
            <Defs id={id} />
            <T x={16} y={58} kind="sym">
                ΔE<tspan fontSize="12" dy="4">g</tspan>
            </T>
            {bars.map((b) => {
                const top = BASE - b.v * EV;
                const mid = b.x + 15;
                const e = 0.03 * EV;
                return (
                    <g key={b.name}>
                        <rect className="eg-fill" fill={`url(#${id}-${b.fill})`} x={b.x} y={top} width={30} height={BASE - top} />
                        <rect className="eg-frame" x={b.x} y={top} width={30} height={BASE - top} />
                        <path className="eg-line" d={`M${mid},${top - e} V${top + e} M${mid - 4},${top - e} H${mid + 4} M${mid - 4},${top + e} H${mid + 4}`} />
                        <T x={mid} y={top - e - 6} kind={b.v > 0.5 ? 'plain' : 'small'}>
                            {b.v.toFixed(2)} eV
                        </T>
                        <T x={mid} y={115} kind="small">
                            {b.name}
                        </T>
                    </g>
                );
            })}
            <line className="eg-line" x1={34} y1={BASE} x2={156} y2={BASE} />
        </svg>
    );
}

/* ── 06 · The proof: an electron microscope and a working device ──────── */

function Proof() {
    const id = `${ID}-6`;
    let wave = 'M84,48';
    for (let k = 0; k < 10; k++) wave += ` H${92 + k * 8} V${k % 2 ? 48 : 30}`;
    return (
        <svg className="eg eg--icon" viewBox="0 0 180 120" aria-hidden="true">
            <Defs id={id} />
            <line className="eg-line eg-line--thin eg-line--dashed" x1={36} y1={16} x2={36} y2={86} />
            <rect className="eg-solid" x={26} y={4} width={20} height={12} rx={3} />
            <rect className="eg-solid" x={31} y={16} width={10} height={58} />
            <ellipse className="eg-solid" cx={36} cy={34} rx={13} ry={4} />
            <ellipse className="eg-solid" cx={36} cy={56} rx={13} ry={4} />
            <rect className="eg-fill" fill={`url(#${id}-fine)`} x={20} y={86} width={32} height={5} />
            <rect className="eg-frame" x={20} y={86} width={32} height={5} />
            <path className="eg-line" d={wave} />
            <rect className="eg-fill" fill={`url(#${id}-hatch)`} x={80} y={92} width={90} height={6} />
            <rect className="eg-frame" x={80} y={92} width={90} height={6} />
            <rect className="eg-solid" x={80} y={64} width={90} height={28} />
            <Arrow id={id} d="M66,78 H178" />
            <rect className="eg-fill" fill={`url(#${id}-fine)`} x={114} y={72} width={22} height={12} />
            <rect className="eg-frame" x={114} y={72} width={22} height={12} />
        </svg>
    );
}

/* ── The lineage ──────────────────────────────────────────────────────── */

interface Step {
    title: string;
    text: string;
    meta: string;
    where: string;
    Icon: ComponentType;
}

const STEPS: Step[] = [
    {
        title: 'The question',
        text: 'Which mix of germanium, antimony and tellurium looks most different to light as glass and as crystal?',
        meta: 'The score: ΔEg, how much its optical bandgap changes between the two.',
        where: 'Paper · Results',
        Icon: Question,
    },
    {
        title: 'The options',
        text: '177 different mixes, made side by side on one 3-inch wafer.',
        meta: 'Sputtered from all three elements at once. Materials from the University of Maryland.',
        where: 'Paper · Methods · NIST release',
        Icon: Options,
    },
    {
        title: 'What was known',
        text: 'Light scans of every spot, as glass and as crystal, taken before the run.',
        meta: 'CAMEO used them as a first guess at where the crystal structure changes.',
        where: 'Paper · Results, Fig. 2c',
        Icon: Known,
    },
    {
        title: 'The measurements',
        text: '19 rounds. In each, CAMEO picked one spot to X-ray and learned from the result.',
        meta: 'A scientist worked out each ΔEg from the light scans. 20–25 minutes a round, at SLAC’s synchrotron.',
        where: 'Paper · Fig. 2c, Methods',
        Icon: Measure,
    },
    {
        title: 'The answer',
        text: 'Ge₄Sb₆Te₇ (GST467), found in round 19.',
        meta: 'ΔEg of 0.76 eV: nearly three times the 0.23 eV of GST225, the best-known material of its kind.',
        where: 'Paper · Fig. 3',
        Icon: Answer,
    },
    {
        title: 'The proof',
        text: 'Checked two more ways: under an electron microscope, and in a working device.',
        meta: 'The microscope showed why: tiny pockets of a second crystal. The device beat one made of GST225 and stayed stable over 30,000 switches.',
        where: 'Paper · Fig. 4',
        Icon: Proof,
    },
];

const HOURS = [
    { label: 'CAMEO, 19 rounds', value: 'about 10 hours', h: 10 },
    { label: 'Measuring all 177', value: 'more than 90 hours', h: 90 },
];

export default function CameoLineage() {
    return (
        <div id="lineage" className="cameo" aria-labelledby="cameo-title">
            <header className="cameo__head rv">
                <p className="w-label trust__label">A real lineage</p>
                <h3 id="cameo-title" className="w-h2 cameo__title">
                    Every result should trace back like this.
                </h3>
                <p className="w-lead">
                    <b>What does a result you can trust look like?</b> Here is a public one: in 2020, NIST’s AI system
                    CAMEO found a better material for memory that works with light. Every step is on record. PRISM keeps
                    the same record for every result.
                </p>
            </header>

            <figure className="cameo__plate" data-theme="paper">
                <ol className="cameo__steps">
                    {STEPS.map(({ title, text, meta, where, Icon }, i) => (
                        <li key={title} className="cameo__step rv" style={{ '--d': `${i * 90}ms` } as CSSProperties}>
                            <div className="cameo__icon">
                                <Icon />
                                {i < STEPS.length - 1 && (
                                    <svg className="cameo__arrow" viewBox="0 0 28 10" aria-hidden="true">
                                        <path d="M1,5 H24" />
                                        <path className="cameo__tip" d="M20,1.5 L27,5 L20,8.5 Z" />
                                    </svg>
                                )}
                            </div>
                            <p className="cameo__n">
                                {String(i + 1).padStart(2, '0')} · {title}
                            </p>
                            <p className="cameo__text">{text}</p>
                            <p className="cameo__meta">{meta}</p>
                            <p className="cameo__where">{where}</p>
                        </li>
                    ))}
                </ol>

                <div className="cameo__time rv" role="img" aria-label="CAMEO took 19 rounds and about 10 hours. Measuring all 177 mixes took more than 90 hours.">
                    {HOURS.map((r) => (
                        <div key={r.label} className={`cameo__row${r.h === 90 ? ' cameo__row--all' : ''}`} aria-hidden="true">
                            <span className="cameo__label">{r.label}</span>
                            <span className="cameo__val">{r.value}</span>
                            <span className="cameo__track">
                                <i
                                    className="cameo__fill"
                                    style={{ '--w': `${(r.h / 90) * 100}%`, '--t': `${(r.h / 90) * 5.4}s` } as CSSProperties}
                                />
                            </span>
                        </div>
                    ))}
                    <p className="cameo__where">Paper · Results</p>
                </div>
            </figure>

            <div className="evidence__src">
                <SourceLine label="Sources">
                    Kusne et al., Nature Communications 11, 5966 (2020); NIST news release, 24 November 2020. CAMEO is the
                    work of NIST and its partners, not ours. We show it because it is the clearest public example of a
                    full lineage.
                </SourceLine>
            </div>
        </div>
    );
}
