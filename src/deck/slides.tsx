import type { CSSProperties, ReactElement } from 'react';
import { Button, EvidenceLineage, Kicker, MaturityPill, PrismMark, RightsState, SourceLine, StatusPill } from '../ds';
import type { StatusTone } from '../ds/StatusPill';
import type { Maturity } from '../ds/MaturityPill';
import { Glyph } from '../site/glyphs';
import { LINKS } from '../site/links';
import { MarketCards } from '../site/Markets';
import { CONSORTIUM, PartnerLogo } from '../site/partners';
import { ALLOYS, YEARS_ALL, fmt } from './numbers';
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
                    <p>Initial deployment of PRISM, for its first use cases: ESA FLPP, FIRST! Simulation &amp; Intelligence.</p>
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
    { name: 'Make', glyph: 'flame', text: 'We melt and 3D-print the best ideas.', maturity: 'in-use' },
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
    { name: 'Manufacturing and test', text: 'Melting, metal 3D printing and testing, with Bimo Tech and Fraunhofer IAPT.', maturity: 'in-use' },
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

export function Proof() {
    return (
        <>
            <Head kicker="Proof" title="Every result carries its own proof." />
            <div className="d-body d-evidence">
                <EvidenceLineage
                    label="Evidence lineage: NIST CAMEO, published work"
                    nodes={[
                        { type: 'Question', title: 'Largest optical contrast in Ge–Sb–Te', state: 'public' },
                        { type: 'Candidates', title: '177 compositions on one wafer', state: 'public' },
                        { type: 'Measurements', title: '19 closed-loop X-ray rounds', state: 'public' },
                        { type: 'Result', title: 'Ge₄Sb₆Te₇: ΔEg nearly 3× GST225', state: 'public' },
                        { type: 'Check', title: 'Electron microscopy and a working device', state: 'public' },
                    ]}
                    links={['posed over', 'sampled by', 'found', 'confirmed by']}
                />
                <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
                    <p className="pm-lead">
                        Partners share data only when they keep control of it. Provenance and rights travel with every
                        result, and derived results inherit the strictest rights of their inputs.
                    </p>
                    <div className="d-states">
                        <div>
                            <RightsState state="private" />
                            <p>Stays with the organisation that produced it.</p>
                        </div>
                        <div>
                            <RightsState state="computable" />
                            <p>Approved workloads compute on it; nobody inspects it.</p>
                        </div>
                        <div>
                            <RightsState state="released" />
                            <p>An approved derivative, shared with named parties.</p>
                        </div>
                        <div>
                            <RightsState state="public" />
                            <p>Deliberately published.</p>
                        </div>
                    </div>
                    <div className="d-ip">
                        <p className="pm-emphasis">
                            IP: generative sampling conditioned on thermodynamic feasibility reaches metastable alloys
                            that equilibrium screening excludes. Patent filings in progress.
                        </p>
                    </div>
                </div>
            </div>
            <div className="d-foot">
                <SourceLine label="Maturity">
                    Provenance and export classification maintained on ESA work today; machine-enforced rights in
                    development. Lineage shown: NIST's CAMEO, Kusne et al., Nature Communications 11, 5966 (2020),
                    published work by NIST and partners, not PRISM's.
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
        note: 'ESA FLPP · FIRST! Simulation & Intelligence',
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

// From the `EU Market` and `Sources` sheets of the PRISM financial model (research refresh, 27 Jul 2026).
const BRIDGE = [
    { value: '472', label: 'EU aerospace enterprises', sub: '20+ staff · EU27 2024 provisional', tag: 'MKT2', external: true },
    { value: '189', label: 'Filtered technical fit', sub: '40% · materials, propulsion, qualification', tag: 'Model inference', external: false },
    { value: '80', label: 'Reachable accounts', sub: '42% · relationship pool 2026–31', tag: 'Assumptions C8', external: false },
    { value: '€600k', label: 'Annual wallet per account', sub: 'Process development and qualification spend', tag: 'Assumptions C9', external: false },
];

const CONTEXT = [
    { v: '€170.7B', k: 'EU aerospace manufacturing turnover', s: 'MKT3' },
    { v: '€8.84B', k: 'European space manufacturing final sales', s: 'MKT4' },
    { v: '€8.26B', k: 'ESA annual budget, 2026', s: 'MKT6' },
    { v: '69.6%', k: 'Public-customer share of space sales', s: 'MKT5' },
];

const PAID = [
    { name: 'Programme', desc: 'Experimental campaign accepted against customer requirements.' },
    { name: 'Pilot', desc: 'Probe deployment, calibration and a reference run.' },
    { name: 'Deployment', desc: 'PRISM run by us for the customer’s programme, under their sign-off.' },
    { name: 'Support', desc: 'Recalibration, traceability and versioned releases.' },
    { name: 'Supply', desc: 'The qualified material, made at scale by Bimo Tech.' },
];

export function Market() {
    return (
        <>
            <header className="d-head" style={{ marginBottom: 16 }}>
                <Kicker>Market and business</Kicker>
            </header>
            <div className="d-market__head">
                <div className="d-market__wallet">
                    <span className="pm-numeral">€48M</span>
                    <div>
                        <p className="pm-subtitle">Serviceable annual wallet</p>
                        <p className="pm-small">Base case: the upper bound on annual spend across reachable accounts.</p>
                    </div>
                </div>
                <div className="d-context">
                    {CONTEXT.map((c) => (
                        <div key={c.s}>
                            <strong>{c.v}</strong>
                            <span>{c.k}</span>
                            <span className="pm-data-label" style={{ marginTop: 4 }}>
                                {c.s}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <p className="pm-column" style={{ marginBottom: 10 }}>
                Serviceable account bridge
            </p>
            <div className="d-bridge">
                {BRIDGE.map((b) => (
                    <div key={b.label} className={`d-bridge__item${b.external ? ' d-bridge__item--external' : ''}`}>
                        <strong>{b.value}</strong>
                        <b>{b.label}</b>
                        <span>{b.sub}</span>
                        <span className="pm-data-label">{b.tag}</span>
                    </div>
                ))}
            </div>
            <p className="pm-column" style={{ marginBottom: 10 }}>
                Monetisation boundary
            </p>
            <div className="d-boundary">
                <div className="d-boundary__open">
                    <span className="pm-data-label">Free and open source</span>
                    <b>Prediction, ranking, materials informatics</b>
                    <p>€0 in every scenario. Revenue is booked only on delivery.</p>
                </div>
                {PAID.map((p) => (
                    <div key={p.name}>
                        <i aria-hidden="true" />
                        <b>{p.name}</b>
                        <p>{p.desc}</p>
                    </div>
                ))}
            </div>
            <div className="d-foot" style={{ marginTop: 'auto' }}>
                <SourceLine label="Base case">
                    €18.0M revenue by 2035 · EBITDA-positive from 2028 · 61% gross margin. External figures carry their
                    source IDs from the model’s evidence register.
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

export function Financials() {
    const cL = 48;
    // The end values sit to the right of the lines, never across them.
    const cR = 590;
    const cT = 20;
    const cB = 360;
    const hi = Math.max(...UPSIDE.revenue);
    const x = (i: number) => cL + (i * (cR - cL)) / (YEARS.length - 1);
    const y = (v: number) => cB - (v / hi) * (cB - cT);
    const line = (vals: number[]) => 'M ' + vals.map((v, i) => `${x(i)} ${y(v)}`).join(' L ');
    const area = (vals: number[]) => `M ${x(0)} ${cB} ` + vals.map((v, i) => `L ${x(i)} ${y(v)}`).join(' ') + ` L ${x(YEARS.length - 1)} ${cB} Z`;
    const rows = [
        ['Operating revenue 2035', eurM(BASE.revenue[9]), eurM(UPSIDE.revenue[9])],
        ['EBITDA 2035, before grants', eurM(BASE.ebitda2035), eurM(UPSIDE.ebitda2035)],
        ['Gross margin 2035', `${Math.round(BASE.grossMargin * 100)}%`, `${Math.round(UPSIDE.grossMargin * 100)}%`],
        ['EBITDA-positive from', `${BASE.breakeven}`, `${UPSIDE.breakeven}`],
        ['Cumulative equity required', eurM(BASE.equity), eurM(UPSIDE.equity)],
    ];
    return (
        <>
            <Head kicker="Financials" title="Ten-year operating plan." />
            <div className="d-body d-fin">
                <div>
                    <svg viewBox="0 0 740 400" role="img" aria-label="Operating revenue 2026 to 2035, base and upside cases.">
                        <line x1={cL} y1={cB} x2={cR} y2={cB} stroke="var(--rule)" />
                        <path d={area(UPSIDE.revenue)} fill="var(--teal-tint)" />
                        <path d={line(UPSIDE.revenue)} fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinejoin="round" />
                        <path d={area(BASE.revenue)} fill="var(--accent-tint)" />
                        <path d={line(BASE.revenue)} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinejoin="round" />
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
                <div className="d-fin__table">
                    <div className="d-fin__row d-fin__row--head">
                        <span />
                        <span className="pm-column" style={{ color: 'var(--accent)' }}>
                            Base
                        </span>
                        <span className="pm-column" style={{ color: 'var(--teal-text)' }}>
                            Upside
                        </span>
                    </div>
                    {rows.map(([k, b, u]) => (
                        <div key={k} className="d-fin__row">
                            <span>{k}</span>
                            <b>{b}</b>
                            <b style={{ color: 'var(--teal-text)' }}>{u}</b>
                        </div>
                    ))}
                    <p className="pm-small" style={{ marginTop: 16 }}>
                        Revenue is capacity-constrained in both cases: programmes are recognised only up to the delivery
                        capacity left after pilots, deployments and support, so the hiring plan sets the growth rate.
                    </p>
                </div>
            </div>
            <div className="d-foot">
                <SourceLine label="Source">PRISM financial model, research refresh 27 Jul 2026 · checks pass · € nominal.</SourceLine>
            </div>
        </>
    );
}


/* ── 12 Team ──────────────────────────────────────────────────────────── */

const FOUNDERS = [
    {
        name: 'Kevin Grüning',
        initials: 'KG',
        role: 'Managing Director',
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
        role: 'Co-founder',
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
    { id: 'I', months: '6 months', title: 'Computational validation', desc: 'The full discovery loop running the first PRISM campaigns.' },
    { id: 'II', months: '12 months', title: 'Hybrid loop', desc: 'Integration with Fraunhofer IAPT additive-manufacturing data.' },
    { id: 'III', months: '24 months', title: 'Autonomous laboratory', desc: 'Direct instrument control closes the loop with no human in the sequence.' },
];

export function Ask() {
    return (
        <div className="d-ask">
            <div className="d-ask__figure" style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
                <Kicker>The ask</Kicker>
                <span className="pm-numeral">€4M</span>
                <p className="pm-subtitle">Seed round, closing 15 November 2026.</p>
                <p className="pm-body">
                    The plan needs €2.91M never to run out of cash. We are raising €4M so the plan survives being wrong,
                    and so the downside gate closes before the money does.
                </p>
            </div>
            <div style={{ display: 'grid', gap: 20, alignContent: 'start', paddingTop: 36 }}>
                <p className="pm-column">Allocation</p>
                <div className="d-alloc">
                    {ALLOCATION.map((a) => (
                        <div key={a.label} className="d-alloc__row">
                            <div className="d-alloc__top">
                                <span>{a.label}</span>
                                <span className="pm-tabular">{a.pct}%</span>
                            </div>
                            <div className="d-alloc__bar">
                                <i style={{ width: `${a.pct}%` }} />
                            </div>
                            <p>{a.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ display: 'grid', gap: 20, alignContent: 'start', paddingTop: 36 }}>
                <p className="pm-column">Roadmap · 24 months</p>
                <ol className="d-steps">
                    {PHASES.map((p) => (
                        <li key={p.id}>
                            <b>{p.id}</b>
                            <div>
                                <strong>{p.title}</strong>
                                <span>
                                    {p.months}. {p.desc}
                                </span>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}


/* ── 14 Close ─────────────────────────────────────────────────────────── */

export function Close() {
    return (
        <div className="d-close">
            <div className="d-close__copy">
                <Kicker>Mirdyne · Giessen, Germany</Kicker>
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
                    Initial deployment of PRISM, for its first use cases, funded under ESA FLPP, FIRST! Simulation &amp;
                    Intelligence.
                </p>
                <div className="d-close__meta">
                    <span>Mirdyne is a spin-off of Bimo Tech.</span>
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
