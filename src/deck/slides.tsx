import { Button, CapabilityStack, EvidenceLineage, Kicker, ObjectCard, ProcessChain, RightsState, SourceLine, Stat, StatusTable } from '../ds';
import VideoBackground from '../components/VideoBackground';
import { LINKS } from '../site/links';
import { CONSORTIUM, PartnerLogo } from '../site/partners';

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
        <div className="d-cover">
            <div className="d-cover__copy">
                <Kicker>Investor briefing · Seed round 2026</Kicker>
                <h1 className="pm-display">PRISM</h1>
                <p className="pm-subtitle">Freedom to build beyond today’s materials.</p>
                <p className="pm-lead">
                    Specify the capability. PRISM designs the material, has it made and tested, and keeps the evidence
                    attached.
                </p>
                <div className="d-cover__meta">
                    <img src="/brand/mirdyne-lockup-ink.png" alt="Mirdyne" width={170} height={46} />
                    <SourceLine label="">Initial deployment of PRISM, for its first use cases, funded under ESA FLPP, FIRST! Simulation &amp; Intelligence.</SourceLine>
                </div>
            </div>
            <figure className="d-cover__media" style={{ margin: 0 }}>
                <img
                    className="d-photo"
                    src="/img/spark-furnace.webp"
                    alt="View through the window of a vacuum-arc melting furnace: a glowing alloy button on the hearth."
                    width={989}
                    height={1144}
                />
                <figcaption className="d-cover__caption">Vacuum-arc melting, Project SPARK.</figcaption>
            </figure>
        </div>
    );
}

/* ── 02 Problem ───────────────────────────────────────────────────────── */

export function Problem() {
    return (
        <>
            <Head
                kicker="The problem"
                title="There are far too many possible alloys to make them all."
                lead="Pick five of nine high-melting metals and mix them in steps of 1%: 474 million possible alloys. Even at ten a day, making each one once would take about 130,000 years. And a new material still takes ten to twenty years to reach service."
            />
            <div className="d-body" style={{ display: 'grid', alignContent: 'center' }}>
                <div className="d-stats-row">
                    <Stat size="lg" value="10–20" label="Years to bring a material into service" />
                    <Stat size="lg" value="474M" label="Possible alloys from five of nine metals" note="About 130,000 years to make, at ten a day" />
                    <Stat size="lg" value="€170.7B" label="EU aerospace manufacturing turnover" note="The industry that waits on its materials" />
                </div>
            </div>
            <div className="d-foot">
                <SourceLine label="Sources">
                    Arithmetic: 126 ways to pick five of nine metals × 3,764,376 mixes in whole percent. Eurostat, EU
                    aerospace manufacturing turnover 2023 (MKT3).
                </SourceLine>
            </div>
        </>
    );
}

/* ── 03 Solution ──────────────────────────────────────────────────────── */

export function Solution() {
    return (
        <>
            <Head
                kicker="The solution"
                title="Replace trial and error with a loop that learns from every batch."
                lead="PRISM screens candidates computationally before any powder is weighed, so most failures happen in simulation. First target: refractory high-entropy alloys for liquid rocket engine preburners."
            />
            <div className="d-body" style={{ display: 'grid', gap: 36, alignContent: 'center' }}>
                <div className="d-grid-3">
                    <div className="d-card">
                        <p className="pm-column">Target</p>
                        <strong>Refractory high-entropy alloys for oxygen-rich preburners</strong>
                    </div>
                    <div className="d-card">
                        <p className="pm-column">Replaces</p>
                        <strong>Monel K500 and other legacy alloys</strong>
                    </div>
                    <div className="d-card">
                        <p className="pm-column">Method</p>
                        <strong>Two loops: computational inside, physical outside</strong>
                    </div>
                </div>
                <ProcessChain
                    label="The PRISM loop"
                    steps={[
                        { label: 'Requirement' },
                        { label: 'Candidate' },
                        { label: 'Physics' },
                        { label: 'Coupon' },
                        { label: 'Evidence' },
                    ]}
                    loop="Learn: test data changes the next prediction"
                />
            </div>
        </>
    );
}

/* ── 04 The stacks ────────────────────────────────────────────────────── */

export function Stacks() {
    return (
        <>
            <Head
                kicker="The platform"
                title="Five stacks. One system, from requirement to qualified part."
            />
            <div className="d-body">
                <CapabilityStack
                    label="PRISM stacks"
                    layers={[
                        { name: 'Research', detail: 'Knowledge graph, generative samplers, physics funnel and active learning find the few candidates worth making.', maturity: 'prototype' },
                        { name: 'Harness', detail: 'Campaign planner, playbooks, tool adapters and evaluator run the science as one system. Engineers sign off.', maturity: 'prototype' },
                        { name: 'Autonomy', detail: 'Robotic synthesis, automated characterisation, Probes and instrument control take the human out of the sequence.', maturity: 'development' },
                        { name: 'Manufacturing and test', detail: 'Powder, melting and laser powder-bed fusion with Bimo Tech and Fraunhofer IAPT; tests against the incumbent alloy.', maturity: 'in-use' },
                        { name: 'Evidence', detail: 'Provenance and export classification today; machine-enforced data rights and controlled release next.', maturity: 'in-use' },
                    ]}
                />
            </div>
            <div className="d-foot">
                <SourceLine label="Maturity">
                    In use: runs in current programmes. Prototype: PRISM software matured from TRL 3 to 4 within PRISM
                    Alpha. In development: being built.
                </SourceLine>
            </div>
        </>
    );
}

/* ── 05 Architecture ──────────────────────────────────────────────────── */

function LoopGraphic() {
    // Four modules on a loop; the dashes flow clockwise.
    const nodes = [
        { x: 100, y: 90, name: 'Evolver', c: '#a8b7c9' },
        { x: 460, y: 90, name: 'Knowledge graph', c: '#ffffff' },
        { x: 460, y: 330, name: 'Evaluator', c: '#2e8781' },
        { x: 100, y: 330, name: 'Mutator fleet', c: '#6f91ba' },
    ];
    return (
        <svg viewBox="0 0 560 420" role="img" aria-label="Four modules on one loop: Evolver, knowledge graph, evaluator and mutator fleet.">
            <g fill="none" stroke="#6f91ba" strokeWidth="1.5" strokeDasharray="6 7">
                <path d="M150 90 H410 M460 140 V280 M410 330 H150 M100 280 V140">
                    <animate attributeName="stroke-dashoffset" from="26" to="0" dur="1.6s" repeatCount="indefinite" />
                </path>
            </g>
            {nodes.map((n) => (
                <g key={n.name}>
                    <circle cx={n.x} cy={n.y} r="44" fill="#152333" stroke={n.c} strokeWidth="2" />
                    <circle cx={n.x} cy={n.y} r="7" fill={n.c} />
                    <text
                        x={n.x}
                        y={n.y > 200 ? n.y + 72 : n.y - 60}
                        textAnchor="middle"
                        fill="#ffffff"
                        style={{ font: '700 17px var(--font-sans)' }}
                    >
                        {n.name}
                    </text>
                </g>
            ))}
            <text x="280" y="216" textAnchor="middle" fill="#c2cbd7" style={{ font: '700 15px var(--font-sans)', letterSpacing: '0.17em' }}>
                PRISM
            </text>
        </svg>
    );
}

export function Architecture() {
    return (
        <>
            <Head kicker="Architecture" title="Four modules, one loop." />
            <div className="d-body d-loop">
                <LoopGraphic />
                <div className="d-modules">
                    <ObjectCard type="Module · Evolver" title="Campaign planner" properties={[['How', 'Generator proposes, reflector scores the last batch, curator updates the playbook']]} />
                    <ObjectCard type="Module · Mutator fleet" title="Generative samplers" properties={[['How', 'Diversity-weighted sampling so each batch spans the Pareto front']]} />
                    <ObjectCard type="Module · Evaluator" title="Evaluator and laboratory" properties={[['How', 'Learned potentials, first principles, thermodynamics, then robotic synthesis for ground truth']]} />
                    <ObjectCard type="Module · MKG" title="Materials knowledge graph" emphasis properties={[['How', 'Literature, patents and instrument data; opens new searches when progress stalls']]} />
                </div>
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
            <img
                className="d-photo d-lab__photo"
                src="/img/lab-melt-spinner-tall.webp"
                alt="A melt spinner in a university materials lab: a steel vacuum sphere with a round window above its control cabinet."
                width={900}
                height={1260}
            />
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

/* ── 07 Evidence and IP ───────────────────────────────────────────────── */

export function EvidenceSlide() {
    return (
        <>
            <Head kicker="Evidence and IP" title="Every claim keeps its evidence, its owner and its rights attached." />
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

/** Each partner's part in PRISM Alpha, in the deck's own terms. */
const DECK_ROLES: Record<string, string> = {
    esa: 'Customer · FLPP',
    bimo: 'Prime contractor',
    ariane: 'Requirements and validation',
    iapt: 'LPBF process',
    amsight: 'Manufacturing data',
};

export function Traction() {
    return (
        <>
            <Head kicker="Traction" title="Funded, contracted and in the lab." />
            <div className="d-body">
                <StatusTable
                    rows={[
                        {
                            entity: 'Project SPARK',
                            entityNote: 'ESA activity · Bimo Tech',
                            status: { label: 'Active', tone: 'accent' },
                            statement: ['Eight refractory high-entropy alloy candidates taken to two physical down-selections.'],
                        },
                        {
                            entity: 'PRISM Alpha',
                            entityNote: 'ESA FLPP · FIRST! Simulation & Intelligence',
                            status: { label: 'Running', tone: 'accent' },
                            statement: ['12 months, TRL 3 to 4: at least three candidates and one complete closed loop, with ArianeGroup, Fraunhofer IAPT and amsight.'],
                        },
                        {
                            entity: 'PFAS-free polymers',
                            entityNote: 'Industrial partner · under NDA',
                            status: { label: 'Contracted', tone: 'teal' },
                            statement: ['First privately funded programme and first polymer class. Contract and NDA signed; start pending.'],
                        },
                        {
                            entity: 'Fusion heritage',
                            entityNote: 'Bimo Tech · ITER',
                            status: { label: 'Delivered', tone: 'accent' },
                            statement: ['Titanium first-wall materials and rhodium targets supplied to ITER.'],
                        },
                    ]}
                />
            </div>
            <div className="d-consortium" aria-label="PRISM Alpha consortium">
                <p className="pm-column">PRISM Alpha consortium</p>
                <ul>
                    {CONSORTIUM.map((p) => (
                        <li key={p.id}>
                            <PartnerLogo p={p} />
                            <span>{DECK_ROLES[p.id]}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="d-foot">
                <SourceLine label="Sources">ESA contract records; Mirdyne and Bimo Tech programme records.</SourceLine>
            </div>
        </>
    );
}

/* ── 09 Market ────────────────────────────────────────────────────────── */

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

/* ── 10 Financials ────────────────────────────────────────────────────── */

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
    const cR = 700;
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
                        <text x={x(9) - 12} y={y(UPSIDE.revenue[9]) + 20} textAnchor="end" fill="var(--teal-text)" style={{ font: '700 15px var(--font-sans)' }}>
                            Upside {eurM(UPSIDE.revenue[9])}
                        </text>
                        <circle cx={x(9)} cy={y(BASE.revenue[9])} r="4.5" fill="var(--accent)" />
                        <text x={x(9) - 12} y={y(BASE.revenue[9]) - 14} textAnchor="end" fill="var(--accent)" style={{ font: '700 15px var(--font-sans)' }}>
                            Base {eurM(BASE.revenue[9])}
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

/* ── 11 Ask ───────────────────────────────────────────────────────────── */

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

/* ── 12 Close ─────────────────────────────────────────────────────────── */

export function Close() {
    return (
        <div className="d-close">
            <div className="d-close__video" aria-hidden="true">
                <VideoBackground src="https://stream.mux.com/00qQnfNo7sSpn3pB1hYKkyeSDvxs01NxiQ3sr29uL3e028.m3u8" />
            </div>
            <Kicker>Mirdyne · Giessen, Germany</Kicker>
            <h2 className="pm-display" style={{ maxWidth: 1000 }}>
                Start with the capability you need.
            </h2>
            <p className="pm-lead" style={{ maxWidth: 820 }}>
                Alloy and polymer design, manufacture and test in one loop, with the evidence attached. PRISM is funded
                under ESA FLPP, FIRST! Simulation &amp; Intelligence.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Button href={LINKS.interest}>Register interest</Button>
                <Button variant="secondary" href="/">
                    prism.mirdyne.com
                </Button>
            </div>
            <div className="d-close__meta">
                <img src="/bimo-logo.svg" alt="Bimo Tech" width={110} height={40} />
                <span>Mirdyne is a spin-off of Bimo Tech.</span>
                <a href={LINKS.marc27} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                    Technology concept by marc27
                </a>
            </div>
        </div>
    );
}
