import type { ComponentType, CSSProperties, ReactElement } from 'react';
import { Button, Kicker, MaturityPill, PrismMark, RightsState, SourceLine, StatusPill } from '../ds';
import type { Visibility } from '../ds/RightsState';
import type { StatusTone } from '../ds/StatusPill';
import type { Maturity } from '../ds/MaturityPill';
import { AnswerIcon, KnownIcon, MeasureIcon, OptionsIcon, ProofIcon, QuestionIcon } from '../site/Cameo';
import { Glyph } from '../site/glyphs';
import { useInView } from '../site/hooks';
import { LINKS } from '../site/links';
import { MarketCards } from '../site/Markets';
import { CONSORTIUM, PartnerLogo } from '../site/partners';
import { ALLOYS, YEARS_ALL, fmt } from './numbers';
import { RightsMerge } from './proof-art';
import { EarnLine, MarketFunnel } from './market-art';
import { MomentumGlobe } from './momentum-globe';
import { useLive } from './slideContext';
import { HeaLattice, PolymerChain, TokamakSection, TrlSteps } from './traction-art';
import { DotField, LoopWheel, ModuleMap, StackTower, type LoopStep, type Module, type TowerRow } from './visuals';

function Head({ kicker, title, lead }: { kicker: string; title: string; lead?: string }) {
    return (
        <header className="d-head">
            <Kicker>{kicker}</Kicker>
            <h2 className="pm-title">{title}</h2>
            {lead && <p className="pm-lead">{lead}</p>}
        </header>
    );
}


/* ── 01 Cover ─────────────────────────────────────────────────────────── */

export function Cover() {
    return (
        <div className="d-hero">
            <img
                className="d-hero__img"
                src="/img/dlr-vulcain2-p5.webp"
                alt="A Vulcain 2 rocket engine firing on a test stand: flame pours out beneath the ribbed metal nozzle."
                width={1348}
                height={758}
            />
            <div className="d-hero__top">
                <span className="d-hero__brand">
                    <PrismMark title="" weight={20} />
                    <b>PRISM</b>
                    <span>by Mirdyne</span>
                </span>
                <span className="d-label">Investor briefing · Seed round 2026</span>
            </div>
            <div className="d-hero__copy">
                <h1 className="d-hero__title d-in">Materials built for the extreme.</h1>
                <p className="d-hero__lead d-in" style={{ '--i': 1 } as CSSProperties}>
                    Designed with AI. Made and tested in Europe.
                </p>
            </div>
            <div className="d-hero__foot d-in" style={{ '--i': 2 } as CSSProperties}>
                <div className="d-hero__esa">
                    <span className="d-label">Funded by the European Space Agency</span>
                    <p>PRISM’s first deployment, through ESA’s programme for future launchers (FLPP).</p>
                </div>
                <div className="d-hero__partners">
                    <span className="d-label">PRISM Alpha, with</span>
                    <ul aria-label="PRISM Alpha consortium">
                        {CONSORTIUM.map((p) => (
                            <li key={p.id}>
                                <PartnerLogo p={p} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <p className="d-hero__credit">Vulcain 2 on test stand P5, DLR Lampoldshausen. Photo: DLR, CC BY 3.0.</p>
        </div>
    );
}

/* ── 02 Problem ───────────────────────────────────────────────────────── */

export function Problem() {
    return (
        <div className="d-problem">
            <div className="d-problem__copy">
                <Head kicker="The problem" title="Far too many possible alloys to make them all." />
                <dl className="d-figures">
                    <div className="d-in">
                        <dt>{fmt(ALLOYS)}</dt>
                        <dd>possible alloys from five of nine high-melting metals, mixed in 1% steps</dd>
                    </div>
                    <div className="d-in" style={{ '--i': 1 } as CSSProperties}>
                        <dt>{fmt(YEARS_ALL)} years</dt>
                        <dd>to make each one once, at ten a day</dd>
                    </div>
                    <div className="d-in" style={{ '--i': 2 } as CSSProperties}>
                        <dt>10–20 years</dt>
                        <dd>for a new material to reach service today</dd>
                    </div>
                </dl>
                <SourceLine label="Sources">
                    Arithmetic: 126 ways to pick five of nine metals that melt above 1,650 °C × 3,764,376 mixes in whole
                    percent. The field is to scale; its layout is illustrative.
                </SourceLine>
            </div>
            <DotField />
        </div>
    );
}

/* ── 03 Solution ──────────────────────────────────────────────────────── */

const LOOP: (LoopStep & { text: string; maturity: Maturity })[] = [
    { name: 'Requirement', glyph: 'target', text: 'You tell us what the part must survive.', maturity: 'prototype' },
    { name: 'Design', glyph: 'lattice', text: 'AI suggests new mixes, from the whole range.', maturity: 'prototype' },
    { name: 'Screen', glyph: 'funnel', text: 'Simulations rule most out, before anything is melted.', maturity: 'prototype' },
    { name: 'Make', glyph: 'flame', text: 'We melt the best ideas, make powder and print them.', maturity: 'in-use' },
    { name: 'Test', glyph: 'gauge', text: 'Each sample is measured against your targets.', maturity: 'in-use' },
    { name: 'Learn', glyph: 'cycle', text: 'Every result goes back into the models.', maturity: 'prototype' },
];

export function Solution() {
    return (
        <>
            <Head kicker="The solution" title="One loop: design, make, test, learn." />
            <div className="d-body d-solution">
                <LoopWheel round={LOOP.slice(1)} />
                <div className="d-solution__side">
                    <ol className="d-loopsteps">
                        {LOOP.map((s, i) => (
                            <li key={s.name} className="d-in" style={{ '--i': i } as CSSProperties}>
                                <span className="d-loopsteps__icon">
                                    <Glyph name={s.glyph} className="d-glyph" size={22} />
                                </span>
                                <div>
                                    <b>{s.name}</b>
                                    <span>{s.text}</span>
                                </div>
                                <MaturityPill maturity={s.maturity} />
                            </li>
                        ))}
                    </ol>
                    <p className="d-solution__target">
                        <span className="d-label">First target</span>
                        Refractory high-entropy alloys for oxygen-rich preburners in rocket engines, to replace Monel K500
                        and other legacy alloys.
                    </p>
                </div>
            </div>
        </>
    );
}

/* ── 04 The stacks ────────────────────────────────────────────────────── */

const TOWER: TowerRow[] = [
    { name: 'Research', text: 'AI suggests mixes; physics simulations throw out what cannot work.', maturity: 'prototype' },
    { name: 'Harness', text: 'Plans each round, runs the tools, scores the results, remembers failures.', maturity: 'prototype' },
    { name: 'Autonomy', text: 'Robots weigh, melt and measure. People stay in charge.', maturity: 'development' },
    { name: 'Manufacturing and test', text: 'Melting, powder, laser printing and testing, with Bimo Tech and Fraunhofer IAPT.', maturity: 'in-use' },
    { name: 'Evidence', text: 'Every result keeps its source, its owner and its rules.', maturity: 'in-use' },
];

export function Stacks() {
    return (
        <>
            <Head kicker="The platform" title="Five stacks, one system." />
            <div className="d-body">
                <StackTower rows={TOWER} />
            </div>
            <div className="d-foot">
                <SourceLine label="Maturity">
                    Each block on a plate is one component, as tall as it is built. In use: runs in current programmes.
                    Prototype: PRISM software, being taken from TRL 3 to 4 in PRISM Alpha. In development: being built.
                </SourceLine>
            </div>
        </>
    );
}

/* ── 05 Architecture ──────────────────────────────────────────────────── */

const MODULES: Module[] = [
    { id: 'evolver', type: 'EVOLVER', title: 'Campaign planner', glyph: 'curve', lines: ['Plans each round from the scores', 'of the last. Keeps what failed.'] },
    { id: 'mutators', type: 'MUTATOR FLEET', title: 'Generative samplers', glyph: 'lattice', lines: ['Propose new candidates, spread', 'wide across the trade-offs.'] },
    { id: 'evaluator', type: 'EVALUATOR', title: 'Simulation and lab', glyph: 'gauge', lines: ['Fast simulations screen, exact', 'ones confirm, the lab decides.'] },
    { id: 'mkg', type: 'MKG', title: 'Knowledge graph', glyph: 'net', lines: ['Papers, patents and lab data,', 'linked with sources. Opens new', 'searches when progress stalls.'] },
];

export function Architecture() {
    return (
        <>
            <Head kicker="Architecture" title="Four modules, one loop." />
            <div className="d-body d-arch">
                <ModuleMap modules={MODULES} />
                <ol className="d-arch__list">
                    {MODULES.map((m) => (
                        <li key={m.id}>
                            <span className="d-arch__icon">
                                <Glyph name={m.glyph} className="d-glyph" size={22} />
                            </span>
                            <div>
                                <span className="d-label">{m.type}</span>
                                <b>{m.title}</b>
                                <span>{m.lines.join(' ')}</span>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
            <div className="d-foot">
                <SourceLine label="Loop">
                    The planner sends a campaign; the samplers propose candidates; simulation and the lab test them;
                    results are kept, with sources; what worked and what failed plans the next round. An engineer signs
                    off what leaves.
                </SourceLine>
            </div>
        </>
    );
}

/* ── 06 Autonomous lab ────────────────────────────────────────────────── */

export function Lab() {
    const steps = [
        ['Recipe translation', 'PRISM outputs target recipes: precursors, temperatures and thermal profiles.'],
        ['Robotic synthesis', 'Robot arms dose powder and move samples through heating profiles.'],
        ['Automated characterisation', 'Diffraction patterns are captured from every synthesised sample.'],
        ['Phase identification', 'Neural networks compare patterns against structure databases to confirm phases.'],
        ['Feedback', 'Structured results return to the Evolver’s reflector and change the next campaign.'],
    ];
    return (
        <div className="d-lab">
            <figure className="d-lab__media">
                <img
                    className="d-photo d-lab__photo"
                    src="/img/lab-melt-spinner-tall.webp"
                    alt="A melt spinner in a university materials lab: a steel vacuum sphere with a round window above its control cabinet."
                    width={900}
                    height={1260}
                />
                <figcaption>The melt spinner in the materials lab at WUST, Wrocław, where our alloys are melted. We rent the equipment.</figcaption>
            </figure>
            <div style={{ display: 'grid', alignContent: 'center', gap: 24 }}>
                <Head kicker="Autonomous laboratory" title="Physical synthesis supplies the reward signal the models train on." />
                <ol className="d-steps">
                    {steps.map(([t, d], i) => (
                        <li key={t}>
                            <b>{String(i + 1).padStart(2, '0')}</b>
                            <div>
                                <strong>{t}</strong>
                                <span>{d}</span>
                            </div>
                        </li>
                    ))}
                </ol>
                <SourceLine label="Maturity">In development. Direct instrument control closes the loop in phase III of the plan.</SourceLine>
            </div>
        </div>
    );
}


/* ── 07 Proof ─────────────────────────────────────────────────────────── */

/**
 * NIST's CAMEO, told the way the website tells it (src/site/Cameo.tsx, the same drawings): six steps that
 * play out one after another when the slide comes up. Every fact is from Kusne et al., Nature
 * Communications 11, 5966 (2020), and NIST's release of 24 November 2020.
 */
const LINEAGE: { title: string; text: string; Icon: ComponentType }[] = [
    { title: 'The question', text: 'Which Ge–Sb–Te mix changes most between glass and crystal?', Icon: QuestionIcon },
    { title: 'The options', text: '177 mixes, side by side on one wafer.', Icon: OptionsIcon },
    { title: 'What was known', text: 'A light scan of every spot, before the run.', Icon: KnownIcon },
    { title: 'The measurements', text: '19 rounds. Each time, the AI picked what to X-ray.', Icon: MeasureIcon },
    { title: 'The answer', text: 'Ge₄Sb₆Te₇: about three times the contrast of GST225.', Icon: AnswerIcon },
    { title: 'The proof', text: 'Confirmed under an electron microscope and in a working device.', Icon: ProofIcon },
];

/** The time the 19 rounds took, against measuring every mix; the bars fill at speeds in proportion. */
const RACE = [
    { label: 'CAMEO, 19 rounds', value: 'about 10 hours', hours: 10 },
    { label: 'Measuring all 177', value: 'more than 90 hours', hours: 90 },
];

const SHARING: { state: Visibility; text: string }[] = [
    { state: 'private', text: 'Stays with its owner.' },
    { state: 'computable', text: 'Software may use it. No person reads it.' },
    { state: 'released', text: 'Shared with named partners.' },
    { state: 'public', text: 'Published on purpose.' },
];

export function Proof() {
    const { live, reader, reduced } = useLive();
    // On the stage the slide plays when it comes up; in the phone reader, when it scrolls into view.
    const [ref, seen] = useInView<HTMLDivElement>('0px 0px -20% 0px', true);
    const play = live && (!reader || seen);
    const waiting = reader && !seen && !reduced;
    return (
        <>
            <Head kicker="Proof" title="Every result carries its own proof." />
            <div ref={ref} className={`d-body d-proof${play ? ' is-live' : ''}${waiting ? ' is-waiting' : ''}`}>
                <figure className="d-proof__plate" data-theme="paper">
                    <figcaption className="d-label">A real lineage, published by NIST in 2020</figcaption>
                    <ol className="d-proof__steps">
                        {LINEAGE.map(({ title, text, Icon }, i) => (
                            <li key={title} className="d-proof__step" style={{ '--i': i } as CSSProperties}>
                                <div className="d-proof__icon">
                                    <Icon />
                                    {i < LINEAGE.length - 1 && (
                                        <svg className="d-proof__arrow" viewBox="0 0 28 10" aria-hidden="true">
                                            <path pathLength={1} d="M1,5 H24" />
                                            <path className="d-proof__tip" d="M20,1.5 L27,5 L20,8.5 Z" />
                                        </svg>
                                    )}
                                </div>
                                <p className="d-proof__n">
                                    {String(i + 1).padStart(2, '0')} · {title}
                                </p>
                                <p className="d-proof__text">{text}</p>
                                <RightsState state="public" />
                            </li>
                        ))}
                    </ol>
                    <div
                        className="d-proof__race"
                        role="img"
                        aria-label="CAMEO took 19 rounds and about 10 hours. Measuring all 177 mixes takes more than 90 hours."
                    >
                        {RACE.map((r) => (
                            <div
                                key={r.label}
                                className={`d-proof__row${r.hours === 90 ? ' d-proof__row--all' : ''}`}
                                style={{ '--w': `${(r.hours / 90) * 100}%`, '--t': `${(r.hours / 90) * 5.4}s` } as CSSProperties}
                                aria-hidden="true"
                            >
                                <span className="d-proof__label">{r.label}</span>
                                <span className="d-proof__val">{r.value}</span>
                                <span className="d-proof__track">
                                    <i className="d-proof__fill" />
                                </span>
                            </div>
                        ))}
                    </div>
                </figure>
                <div className="d-proof__rights">
                    <div className="d-proof__rule">
                        <p className="d-label">Rights travel with every record</p>
                        <RightsMerge />
                        <p className="d-proof__note">A result keeps the strictest rights of its inputs.</p>
                    </div>
                    <div className="d-proof__levels">
                        <p className="d-label">Four levels of sharing</p>
                        <ul className="d-proof__states">
                            {SHARING.map((st, i) => (
                                <li key={st.state} style={{ '--i': i } as CSSProperties}>
                                    <RightsState state={st.state} />
                                    <span className="d-proof__caption">{st.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="d-proof__ip">
                        <p className="d-label">What we protect</p>
                        <p className="d-proof__ip-text">
                            Generative sampling, conditioned on thermodynamic feasibility, reaches metastable alloys that
                            equilibrium screening excludes.
                        </p>
                        <StatusPill tone="crimson">Patent filings in progress</StatusPill>
                    </div>
                </div>
            </div>
            <div className="d-foot">
                <SourceLine label="Sources">
                    CAMEO is the work of NIST and its partners, not ours: Kusne et al., Nature Communications 11, 5966
                    (2020). PRISM keeps the same record for every result: provenance and export labels on ESA work today,
                    automatic enforcement of sharing rules in development.
                </SourceLine>
            </div>
        </>
    );
}


/* ── 08 Traction ──────────────────────────────────────────────────────── */

const PARTNERS_ALPHA = ['ariane', 'iapt', 'amsight'].map((id) => CONSORTIUM.find((p) => p.id === id)!);

const PROGRAMMES: {
    name: string;
    note: string;
    status: string;
    tone: StatusTone;
    art: ReactElement;
    figure: string;
    text: string;
    partners?: typeof PARTNERS_ALPHA;
}[] = [
    {
        name: 'Project SPARK',
        note: 'ESA activity · Bimo Tech',
        status: 'Active',
        tone: 'accent',
        art: <HeaLattice />,
        figure: '8',
        text: 'Refractory high-entropy alloy candidates, taken to two physical down-selections.',
    },
    {
        name: 'PRISM Alpha',
        note: 'ESA · future launchers programme (FLPP)',
        status: 'Running',
        tone: 'accent',
        art: <TrlSteps />,
        figure: 'TRL 3 → 4',
        text: 'In 12 months: at least three candidates and one complete closed loop.',
        partners: PARTNERS_ALPHA,
    },
    {
        name: 'PFAS-free polymers',
        note: 'Industrial partner · under NDA',
        status: 'Contracted',
        tone: 'teal',
        art: <PolymerChain />,
        figure: '1st',
        text: 'Privately funded programme, and our first polymer class. Contract and NDA signed; start pending.',
    },
    {
        name: 'Fusion heritage',
        note: 'Bimo Tech · ITER',
        status: 'Delivered',
        tone: 'accent',
        art: <TokamakSection />,
        figure: 'ITER',
        text: 'Titanium first-wall materials and rhodium targets, supplied by Bimo Tech.',
    },
];

export function Traction() {
    return (
        <>
            <Head kicker="Traction" title="Funded, contracted and in the lab." />
            <div className="d-body d-prog">
                {PROGRAMMES.map((p) => (
                    <article key={p.name} className="d-prog__card">
                        <div className="d-prog__art">
                            {p.art}
                            <StatusPill tone={p.tone}>{p.status}</StatusPill>
                        </div>
                        <div className="d-prog__body">
                            <h3 className="d-prog__name">{p.name}</h3>
                            <p className="d-prog__note">{p.note}</p>
                            <p className="d-prog__figure">{p.figure}</p>
                            <p className="d-prog__text">{p.text}</p>
                            {p.partners && (
                                <p className="d-prog__with">
                                    <span>With</span>
                                    {p.partners.map((q) => (
                                        <PartnerLogo key={q.id} p={q} />
                                    ))}
                                </p>
                            )}
                        </div>
                    </article>
                ))}
            </div>
            <div className="d-foot">
                <SourceLine label="Sources">ESA contract records; Mirdyne and Bimo Tech programme records.</SourceLine>
            </div>
        </>
    );
}


/* ── 09 Where PRISM goes first ────────────────────────────────────────── */

export function Markets() {
    return (
        <>
            <Head kicker="Markets" title="Where PRISM goes first." />
            <div className="d-body d-markets">
                <MarketCards />
            </div>
            <div className="d-foot">
                <SourceLine label="Photos">
                    Aestus engine in test stand P4.2: DLR, CC BY 3.0 · EJ200 afterburner: Julian Herzog, CC BY 4.0 ·
                    Wendelstein 7-X wall tiles: Christopher Roux, EUROfusion, CC BY 4.0 · Tungsten crystals:
                    Alchemist-hp (pse-mendelejew.de), Free Art License. All cropped.
                </SourceLine>
            </div>
        </>
    );
}

/* ── 10 Market ────────────────────────────────────────────────────────── */

export function Market() {
    return (
        <>
            <Head kicker="Market and business" title="80 companies we can reach spend €48M a year." />
            <div className="d-body d-market">
                <MarketFunnel />
                <EarnLine />
            </div>
            <div className="d-foot">
                <SourceLine label="Sources">
                    Companies: EU27, 2024 (provisional), from the evidence register of the PRISM financial model. Fit, reach and
                    spend per company are the model’s assumptions (research refresh, 27 Jul 2026).
                </SourceLine>
            </div>
        </>
    );
}


/* ── 11 Financials ────────────────────────────────────────────────────── */

// PRISM financial model, research refresh 27 Jul 2026, checks pass. Upside re-evaluates the workbook's own formulas.
const YEARS = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035];
const BASE = {
    revenue: [310000, 1237512, 2051171, 3152596, 4733979, 6695281, 8864410, 11672867, 14657526, 18024503],
    ebitda2035: 4707052,
    grossMargin: 0.608,
    equity: 2907256,
    breakeven: 2028,
};
const UPSIDE = {
    revenue: [330000, 2862740, 6161133, 9560026, 14515409, 20767730, 28557824, 38326004, 50236280, 63827289],
    ebitda2035: 40844893,
    grossMargin: 0.808,
    equity: 579952,
    breakeven: 2027,
};
const eurM = (n: number) => `${n < 0 ? '−' : ''}€${Math.abs(n / 1_000_000).toFixed(2)}M`;
const eurM1 = (n: number) => `€${(n / 1_000_000).toFixed(1)}M`;

export function Financials() {
    const { live, reader } = useLive();
    const [ref, seen] = useInView<HTMLDivElement>('0px 0px -20% 0px', true);
    const play = live && (!reader || seen);
    const cL = 48;
    // The end values sit to the right of the lines, never across them.
    const cR = 590;
    const cT = 40;
    const cB = 360;
    const hi = Math.max(...UPSIDE.revenue);
    const x = (i: number) => cL + (i * (cR - cL)) / (YEARS.length - 1);
    const y = (v: number) => cB - (v / hi) * (cB - cT);
    const line = (vals: number[]) => 'M ' + vals.map((v, i) => `${x(i)} ${y(v)}`).join(' L ');
    const area = (vals: number[]) => `M ${x(0)} ${cB} ` + vals.map((v, i) => `L ${x(i)} ${y(v)}`).join(' ') + ` L ${x(YEARS.length - 1)} ${cB} Z`;
    const even = x(YEARS.indexOf(BASE.breakeven));
    const pct = (v: number) => `${Math.round(v * 100)}%`;
    return (
        <>
            <Head kicker="Financials" title="Ten-year operating plan." />
            <div ref={ref} className={`d-body d-fin${play ? ' is-live' : ''}`}>
                <div>
                    <svg viewBox="0 0 740 400" role="img" aria-label="Operating revenue 2026 to 2035, base and upside cases, and the year the base case turns profitable.">
                        <line x1={cL} y1={cB} x2={cR} y2={cB} stroke="var(--rule)" />
                        <g className="d-fin__even">
                            <line x1={even} y1={cB} x2={even} y2={cT - 8} stroke="var(--ink-3)" strokeDasharray="3 4" />
                            <text x={even + 8} y={cT - 2} fill="var(--ink-2)" style={{ font: '600 13px var(--font-sans)' }}>
                                EBITDA-positive from {BASE.breakeven}
                            </text>
                        </g>
                        <path className="d-fin__area" d={area(UPSIDE.revenue)} fill="var(--teal-tint)" />
                        <path className="d-fin__line" pathLength={1} d={line(UPSIDE.revenue)} fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinejoin="round" />
                        <path className="d-fin__area" d={area(BASE.revenue)} fill="var(--accent-tint)" />
                        <path className="d-fin__line" pathLength={1} d={line(BASE.revenue)} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinejoin="round" />
                        <g className="d-fin__end">
                            <circle cx={x(9)} cy={y(UPSIDE.revenue[9])} r="4.5" fill="var(--teal)" />
                            <text x={x(9) + 16} y={y(UPSIDE.revenue[9]) - 2} fill="var(--teal-text)" style={{ font: '600 13px var(--font-sans)' }}>
                                Upside
                            </text>
                            <text x={x(9) + 16} y={y(UPSIDE.revenue[9]) + 19} fill="var(--teal-text)" style={{ font: '700 19px var(--font-sans)' }}>
                                {eurM(UPSIDE.revenue[9])}
                            </text>
                            <circle cx={x(9)} cy={y(BASE.revenue[9])} r="4.5" fill="var(--accent)" />
                            <text x={x(9) + 16} y={y(BASE.revenue[9]) - 2} fill="var(--accent)" style={{ font: '600 13px var(--font-sans)' }}>
                                Base
                            </text>
                            <text x={x(9) + 16} y={y(BASE.revenue[9]) + 19} fill="var(--accent)" style={{ font: '700 19px var(--font-sans)' }}>
                                {eurM(BASE.revenue[9])}
                            </text>
                        </g>
                        {YEARS.map((yr, i) =>
                            i % 3 === 0 || i === YEARS.length - 1 ? (
                                <text key={yr} x={x(i)} y={cB + 26} textAnchor="middle" fill="var(--ink-2)" style={{ font: '500 13px var(--font-mono)' }}>
                                    {yr}
                                </text>
                            ) : null,
                        )}
                    </svg>
                    <p className="pm-column">Operating revenue, excluding grants</p>
                </div>
                <div className="d-fin__facts">
                    <div className="d-fin__fact d-in" style={{ '--i': 2 } as CSSProperties}>
                        <svg className="d-fin__ring" viewBox="0 0 120 120" aria-hidden="true">
                            <circle cx="60" cy="60" r="52" className="d-fin__track" />
                            <circle cx="60" cy="60" r="52" pathLength={1} className="d-fin__arc d-fin__arc--up" style={{ '--v': UPSIDE.grossMargin } as CSSProperties} />
                            <circle cx="60" cy="60" r="38" className="d-fin__track" />
                            <circle cx="60" cy="60" r="38" pathLength={1} className="d-fin__arc" style={{ '--v': BASE.grossMargin } as CSSProperties} />
                        </svg>
                        <div>
                            <strong>{pct(BASE.grossMargin)}</strong>
                            <span>gross margin in 2035</span>
                            <em>Upside {pct(UPSIDE.grossMargin)}</em>
                        </div>
                    </div>
                    <div className="d-fin__fact d-in" style={{ '--i': 3 } as CSSProperties}>
                        <strong>{BASE.breakeven}</strong>
                        <span>the first year with a positive EBITDA</span>
                        <em>Upside {UPSIDE.breakeven}</em>
                    </div>
                    <div className="d-fin__fact d-in" style={{ '--i': 4 } as CSSProperties}>
                        <strong>{eurM1(BASE.equity)}</strong>
                        <span>equity needed in total</span>
                        <em>Upside {eurM1(UPSIDE.equity)}</em>
                    </div>
                    <p className="pm-small">
                        Growth is set by the hiring plan: programmes count as revenue only up to the delivery capacity left after
                        pilots, deployments and support.
                    </p>
                </div>
            </div>
            <div className="d-foot">
                <SourceLine label="Source">
                    PRISM financial model, research refresh 27 Jul 2026 · checks pass · € nominal. EBITDA 2035, before grants:{' '}
                    {eurM(BASE.ebitda2035)} base, {eurM(UPSIDE.ebitda2035)} upside.
                </SourceLine>
            </div>
        </>
    );
}


/* ── 11 Momentum: the market is moving ────────────────────────────────── */

const MOMENTUM: { when: string; who: string; figure?: string; text: string; ours?: boolean; href?: string }[] = [
    { when: '2024', who: 'PRISM', text: 'The idea and the first concept.', ours: true },
    { when: 'Jul 2025', who: 'PRISM to ESA', text: 'Put to ESA through OSIP, its platform for new ideas.', ours: true, href: LINKS.osip },
    { when: 'Jul 2025', who: 'Radical AI', figure: '$55M', text: 'Seed round, for AI and self-driving labs for materials.' },
    { when: 'Sep 2025', who: 'Periodic Labs', figure: '$300M', text: 'Seed round, to automate scientific discovery.' },
    { when: 'Oct 2025', who: 'Lila Sciences', figure: '$550M', text: 'Raised in total, for AI science factories.' },
    { when: 'Nov 2025', who: 'Genesis Mission', text: 'A US government programme for AI-driven science and automated labs.' },
    { when: 'Jul 2026', who: 'PRISM Alpha', text: 'A full ESA project in FLPP, the programme for Europe’s next launchers.', ours: true, href: LINKS.flpp },
    { when: 'Aug 2026', who: 'Discovery Loop', text: 'Founded by top Google researchers to automate experiments. Raised hundreds of millions.' },
    { when: 'Aug 2026', who: 'First private project', text: 'PFAS-free polymers, with an industrial partner under NDA.', ours: true },
];

export function Momentum() {
    return (
        <>
            <Head kicker="Market momentum" title="The money is moving into AI that makes materials." />
            <div className="d-body d-momentum__body">
                <MomentumGlobe />
                <div className="d-momentum__side">
                <ol className="d-momentum">
                    {MOMENTUM.map((m, i) => (
                        <li key={m.who} className={`d-in${m.ours ? ' d-momentum--ours' : ''}`} style={{ '--i': i } as CSSProperties}>
                            <span className="pm-data-label">{m.when}</span>
                            <b>
                                {m.href ? (
                                    <a href={m.href} target="_blank" rel="noopener noreferrer">
                                        {m.who}
                                    </a>
                                ) : (
                                    m.who
                                )}
                            </b>
                            {m.figure && <strong>{m.figure}</strong>}
                            <p>{m.text}</p>
                        </li>
                    ))}
                </ol>
                <p className="pm-lead d-momentum__close">Almost all this money is in the US. PRISM designs, makes and tests in Europe.</p>
                </div>
            </div>
            <div className="d-foot">
                <SourceLine label="Sources">
                    Company announcements: Radical AI, July 2025; Periodic Labs, 30 September 2025; Lila Sciences, October 2025 (seed and
                    Series A in total). The White House, “Launching the Genesis Mission”, 24 November 2025. Discovery Loop: TechCrunch, 5
                    August 2026.
                </SourceLine>
            </div>
        </>
    );
}

/* ── 12 Team ──────────────────────────────────────────────────────────── */

const FOUNDERS = [
    {
        name: 'Kevin Grüning',
        initials: 'KG',
        role: 'CEO and Managing Director',
        text: 'Space Systems Lead at Bimo Tech. Physics and technology for space applications, JLU Giessen and THM.',
    },
    {
        name: 'Siddhartha Yash Kovid',
        initials: 'SK',
        role: 'Technical Lead',
        text: 'Technical lead of the ESA projects SPARK and PRISM Alpha at Bimo Tech. Applied AI and data science, MIT Professional Education; biomedical engineering, THM.',
    },
    {
        name: 'Marcin Orzechowski',
        initials: 'MO',
        role: 'CFO',
        text: 'CEO and Head of R&D at Bimo Tech, which supplies special metals and precision parts for space, energy and science. Wrocław University of Technology.',
    },
];

const BIMO = CONSORTIUM.find((p) => p.id === 'bimo')!;

export function Team() {
    return (
        <>
            <Head kicker="Team" title="The team that runs PRISM’s ESA work." />
            <div className="d-body d-team">
                <ul className="d-team__people">
                    {FOUNDERS.map((f, i) => (
                        <li key={f.name} className="d-in" style={{ '--i': i } as CSSProperties}>
                            <span className="d-team__mono" aria-hidden="true">
                                {f.initials}
                            </span>
                            <b>{f.name}</b>
                            <span className="d-team__role">{f.role}, Mirdyne</span>
                            <p>{f.text}</p>
                        </li>
                    ))}
                </ul>
                <div className="d-team__bimo">
                    <PartnerLogo p={BIMO} />
                    <p>Mirdyne is a spin-off of Bimo Tech, which makes special metals and precision parts and supplies ITER.</p>
                </div>
                <div className="d-team__experts">
                    <span className="pm-data-label">Advisors</span>
                    <p>Prof. Jan Wróbel, Warsaw University of Technology · Prof. Dariusz Jarząbek, IPPT PAN</p>
                </div>
                <div className="d-team__side">
                    <figure className="d-team__award">
                        <img
                            src="/img/news-hessen-ideen-2026.webp"
                            alt="Team PRISM on stage at the Hessen Ideen awards, holding the KI-Sonderpreis certificate, with the organisers."
                            width={1600}
                            height={1066}
                        />
                        <figcaption>
                            <b>KI-Sonderpreis, Hessen Ideen 2026</b>
                            <span>The special prize for artificial intelligence. Photo: Hessen Ideen.</span>
                        </figcaption>
                    </figure>
                </div>
            </div>
        </>
    );
}

/* ── 13 Ask ───────────────────────────────────────────────────────────── */

// The model's own cost mix over the years that need funding (2026–2032), consolidated into four buckets.
const ALLOCATION = [
    { label: 'Team', pct: 65, desc: 'Delivery, materials science, product and security headcount' },
    { label: 'Go-to-market, IP and export control', pct: 16, desc: 'Bids, consortia, field selling, patents, dual-use compliance' },
    { label: 'Compute, infrastructure and lab access', pct: 13, desc: 'Controlled core, per-site secure compute, partner-lab access' },
    { label: 'Probe hardware, tools and testing', pct: 6, desc: 'Probe builds, calibration, R&D tooling' },
];

const PHASES = [
    { id: 'I', months: '6 months', at: 0.25, title: 'Computational validation', desc: 'The full discovery loop running the first PRISM campaigns.' },
    { id: 'II', months: '12 months', at: 0.5, title: 'Hybrid loop', desc: 'Integration with Fraunhofer IAPT additive-manufacturing data.' },
    { id: 'III', months: '24 months', at: 1, title: 'Autonomous laboratory', desc: 'Direct instrument control closes the loop with no human in the sequence.' },
];

/** Where the €4M goes, as a ring: each share is a slice of the circle, in the order of the list. */
const ALLOC_COLOURS = ['var(--ink)', 'var(--teal)', 'var(--accent)', 'var(--crimson)'];

export function Ask() {
    const { live, reader } = useLive();
    const [ref, seen] = useInView<HTMLDivElement>('0px 0px -20% 0px', true);
    const play = live && (!reader || seen);
    const slices = ALLOCATION.map((a, i) => ({
        ...a,
        from: ALLOCATION.slice(0, i).reduce((sum, b) => sum + b.pct, 0) / 100,
        colour: ALLOC_COLOURS[i],
    }));
    return (
        <div ref={ref} className={`d-ask${play ? ' is-live' : ''}`}>
            <div className="d-ask__figure" style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
                <Kicker>The ask</Kicker>
                <span className="pm-numeral">€4M</span>
                <p className="pm-subtitle">Seed round, closing 15 November 2026.</p>
                <p className="pm-body">
                    The plan needs €2.91M never to run out of cash. We are raising €4M so the plan survives being wrong,
                    and so the downside gate closes before the money does.
                </p>
            </div>
            <div className="d-ask__col">
                <p className="pm-column">Where the money goes</p>
                <div className="d-alloc">
                    <svg className="d-alloc__ring" viewBox="0 0 200 200" role="img" aria-label={ALLOCATION.map((a) => `${a.label} ${a.pct}%`).join(', ')}>
                        <circle cx="100" cy="100" r="80" className="d-alloc__track" />
                        {slices.map((a, i) => (
                            <circle
                                key={a.label}
                                cx="100"
                                cy="100"
                                r="80"
                                pathLength={1}
                                className="d-alloc__slice"
                                stroke={a.colour}
                                style={{ '--v': a.pct / 100 - 0.008, '--o': -a.from, '--i': i } as CSSProperties}
                            />
                        ))}
                        <text x="100" y="108" textAnchor="middle" className="d-alloc__sum">
                            €4M
                        </text>
                    </svg>
                    <ul className="d-alloc__list">
                        {slices.map((a, i) => (
                            <li key={a.label} className="d-in" style={{ '--i': i + 2 } as CSSProperties}>
                                <i style={{ background: a.colour }} aria-hidden="true" />
                                <b>{a.label}</b>
                                <span className="pm-tabular">{a.pct}%</span>
                                <p>{a.desc}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="d-ask__col">
                <p className="pm-column">Roadmap · 24 months</p>
                <div className="d-road">
                    <span className="d-road__track" aria-hidden="true">
                        <i />
                    </span>
                    <span className="d-road__now">Now</span>
                    <ol>
                        {PHASES.map((p) => (
                            <li key={p.id} style={{ '--at': p.at, '--i': p.at * 4 } as CSSProperties}>
                                <span className="d-road__when">{p.months}</span>
                                <strong>{p.title}</strong>
                                <span>{p.desc}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
}


/* ── 14 Close ─────────────────────────────────────────────────────────── */

export function Close() {
    return (
        <div className="d-close">
            <div className="d-close__copy">
                <span className="d-hero__brand d-close__brand">
                    <PrismMark title="" weight={20} />
                    <b>PRISM</b>
                    <span>by Mirdyne</span>
                </span>
                <div className="d-close__main">
                    <h2 className="d-close__title d-in">Start with the capability you need.</h2>
                    <p className="d-close__lead d-in" style={{ '--i': 1 } as CSSProperties}>
                        Alloys and polymers, designed, made and tested in one loop, with the proof attached.
                    </p>
                    <div className="d-close__actions d-in" style={{ '--i': 2 } as CSSProperties}>
                        <Button href={`${LINKS.interest}?topic=investment`}>Register interest</Button>
                        <Button variant="secondary" href="/">
                            mirdyne.com
                        </Button>
                    </div>
                    <p className="d-close__esa">
                        The European Space Agency funds PRISM’s first deployment, through its programme for future
                        launchers (FLPP).
                    </p>
                </div>
                <div className="d-close__logos">
                    <img className="d-close__mirdyne" src="/brand/mirdyne-lockup-white.png" alt="Mirdyne" width={355} height={97} />
                    <span className="d-close__parent">
                        A spin-off of <PartnerLogo p={BIMO} />
                    </span>
                    <a href={LINKS.marc27} target="_blank" rel="noopener noreferrer">
                        Technology concept by marc27
                    </a>
                </div>
            </div>
            <figure className="d-close__media">
                <img
                    className="d-photo"
                    src="/img/spark-melt.webp"
                    alt="An alloy melting in the vacuum-arc furnace, glowing orange through the viewport."
                    width={1000}
                    height={1000}
                />
            </figure>
        </div>
    );
}
