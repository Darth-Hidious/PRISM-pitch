import { useEffect, useRef, useState } from 'react';
import { RightsState, SourceLine } from '../ds';
import type { Visibility } from '../ds/RightsState';
import { useMediaQuery } from './hooks';
import { Grain, Idx, Rails } from './ui';

/* ── Ontology explorer ────────────────────────────────────────────────── */

type Party = 'Customer A' | 'Partner B' | 'Mirdyne' | 'Public';
const VIEWERS: { id: Party; role: string }[] = [
    { id: 'Customer A', role: 'Owns the requirement' },
    { id: 'Partner B', role: 'Makes and tests the coupons' },
    { id: 'Mirdyne', role: 'Runs the platform' },
    { id: 'Public', role: 'Anyone else' },
];

interface Obj {
    id: string;
    type: string;
    title: string;
    owner: Exclude<Party, 'Public'>;
    state: Visibility;
    releasedTo?: Party[];
    release?: string;
    props: [string, string][];
    x: number; // card centre, % of the graph width
    y: number; // % of the graph height
}

/** Illustrative objects and placeholder parties: no customer data. */
const OBJECTS: Obj[] = [
    {
        id: 'REQ-A-014',
        type: 'Requirement',
        title: 'Service environment and property targets',
        owner: 'Customer A',
        state: 'released',
        releasedTo: ['Mirdyne'],
        release: 'R-012, signed by Customer A',
        props: [
            ['Targets', 'Three property targets'],
            ['Benchmark', 'Incumbent material'],
        ],
        x: 15,
        y: 14,
    },
    {
        id: 'CND-07',
        type: 'Candidate design',
        title: 'Candidate 07',
        owner: 'Customer A',
        state: 'released',
        releasedTo: ['Mirdyne', 'Partner B'],
        release: 'R-019, signed by Customer A, for manufacture only',
        props: [
            ['Derived from', 'REQ-A-014'],
            ['Route', 'Laser powder-bed fusion'],
        ],
        x: 50,
        y: 14,
    },
    {
        id: 'BLD-12',
        type: 'Build',
        title: 'Coupon build 12',
        owner: 'Partner B',
        state: 'computable',
        props: [
            ['Machine log', 'Layer-by-layer process data'],
            ['Parameters', 'Process window, version 3'],
        ],
        x: 85,
        y: 14,
    },
    {
        id: 'SPC-12-3',
        type: 'Specimen',
        title: 'Specimen 12-3',
        owner: 'Partner B',
        state: 'released',
        releasedTo: ['Customer A', 'Mirdyne'],
        release: 'R-031, signed by Partner B',
        props: [
            ['From build', 'BLD-12'],
            ['Condition', 'As built'],
        ],
        x: 85,
        y: 50,
    },
    {
        id: 'TST-88',
        type: 'Test',
        title: 'Property test 88',
        owner: 'Partner B',
        state: 'computable',
        props: [
            ['Raw data', 'Instrument files'],
            ['Method', 'Agreed test method'],
        ],
        x: 85,
        y: 86,
    },
    {
        id: 'MDL-4',
        type: 'Model',
        title: 'PRISM surrogate model, version 4',
        owner: 'Mirdyne',
        state: 'private',
        props: [
            ['Code', 'Versioned and hashed'],
            ['Weights', 'Mirdyne'],
        ],
        x: 50,
        y: 86,
    },
    {
        id: 'EST-88',
        type: 'Property estimate',
        title: 'Estimate against the targets',
        owner: 'Mirdyne',
        state: 'released',
        releasedTo: ['Customer A'],
        release: 'R-044, signed by Partner B and Mirdyne, aggregate properties only',
        props: [
            ['Output', 'Aggregate properties only'],
            ['Uncertainty', 'Attached'],
        ],
        x: 50,
        y: 50,
    },
    {
        id: 'DEC-03',
        type: 'Decision',
        title: 'Carry candidate 07 forward',
        owner: 'Customer A',
        state: 'released',
        releasedTo: ['Mirdyne'],
        release: 'R-050, signed by Customer A',
        props: [
            ['Decided by', 'Named engineer, Customer A'],
            ['Basis', 'EST-88 against REQ-A-014'],
        ],
        x: 15,
        y: 86,
    },
];

const EDGES: [string, string, string][] = [
    ['REQ-A-014', 'CND-07', 'motivates'],
    ['CND-07', 'BLD-12', 'instantiated as'],
    ['BLD-12', 'SPC-12-3', 'produced'],
    ['SPC-12-3', 'TST-88', 'measured by'],
    ['TST-88', 'EST-88', 'supports'],
    ['MDL-4', 'EST-88', 'computed by'],
    ['EST-88', 'DEC-03', 'justifies'],
    ['DEC-03', 'REQ-A-014', 'answers'],
];

type Access = 'full' | 'compute' | 'hidden';

function access(o: Obj, viewer: Party): Access {
    if (viewer === o.owner || o.state === 'public') return 'full';
    if (viewer === 'Public') return 'hidden';
    if (o.state === 'released' && o.releasedTo?.includes(viewer)) return 'full';
    if (o.state === 'computable') return 'compute';
    return 'hidden';
}

function why(o: Obj, viewer: Party, a: Access) {
    if (a === 'full' && viewer === o.owner) return 'You own this object.';
    if (a === 'full') return `Released to you under ${o.release}.`;
    if (a === 'compute')
        return 'Computable: approved workloads may run on it, but no person can read the values. That includes Mirdyne.';
    if (viewer === 'Public') return 'Not public. Nothing is published unless its owner decides to publish it.';
    if (o.state === 'private') return `Private to ${o.owner}. Nothing is released implicitly.`;
    return `Not released to you. ${o.owner} has released it to ${o.releasedTo?.join(' and ')} only.`;
}

/** Tracks an element's content box; `dep` re-attaches when the element is swapped. */
function useSize<T extends HTMLElement>(dep: unknown) {
    const ref = useRef<T>(null);
    const [size, setSize] = useState({ w: 0, h: 0 });
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
        ro.observe(el);
        return () => ro.disconnect();
    }, [dep]);
    return [ref, size] as const;
}

function NodeCard({ o, a, selected, onSelect }: { o: Obj; a: Access; selected: boolean; onSelect: () => void }) {
    return (
        <button
            type="button"
            className={`onode onode--${a}${selected ? ' is-selected' : ''}`}
            style={{ ['--x' as string]: `${o.x}%`, ['--y' as string]: `${o.y}%` }}
            aria-pressed={selected}
            onClick={onSelect}
        >
            <span className="onode__type">
                <RightsState state={o.state} label={o.type} />
            </span>
            <span className="onode__title">
                {a === 'full' ? o.title : a === 'compute' ? 'Values hidden · compute only' : 'Not visible to you'}
            </span>
            <span className="onode__id">{a === 'hidden' ? '●●●-●●' : o.id}</span>
        </button>
    );
}

function OntologyExplorer() {
    const [viewer, setViewer] = useState<Party>('Customer A');
    const [sel, setSel] = useState('EST-88');
    const narrow = useMediaQuery('(max-width: 860px)');
    const [graphRef, size] = useSize<HTMLDivElement>(narrow);
    const obj = OBJECTS.find((o) => o.id === sel)!;
    const a = access(obj, viewer);
    const byId = (id: string) => OBJECTS.find((o) => o.id === id)!;
    const visibleCount = OBJECTS.filter((o) => access(o, viewer) === 'full').length;

    return (
        <div className="ont">
            <div className="ont__bar">
                <p className="w-label">Viewing as</p>
                <div className="seg seg--dark" role="group" aria-label="Viewing as">
                    {VIEWERS.map((v) => (
                        <button key={v.id} type="button" aria-pressed={v.id === viewer} onClick={() => setViewer(v.id)}>
                            {v.id}
                        </button>
                    ))}
                </div>
                <p className="ont__count" aria-live="polite">
                    {VIEWERS.find((v) => v.id === viewer)?.role}. Sees {visibleCount} of {OBJECTS.length} objects in
                    full.
                </p>
            </div>

            {narrow ? (
                <ol className="ont__list">
                    {OBJECTS.map((o) => (
                        <li key={o.id}>
                            <NodeCard o={o} a={access(o, viewer)} selected={o.id === sel} onSelect={() => setSel(o.id)} />
                        </li>
                    ))}
                </ol>
            ) : (
                <div ref={graphRef} className="ont__graph">
                    <svg className="ont__edges" width={size.w} height={size.h} aria-hidden="true">
                        <defs>
                            <marker id="ont-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                                <path d="M1 1 9 5 1 9" fill="none" stroke="currentColor" strokeWidth="1.5" />
                            </marker>
                        </defs>
                        {EDGES.map(([f, t]) => {
                            const A = byId(f);
                            const B = byId(t);
                            const on = f === sel || t === sel;
                            const dim = access(A, viewer) !== 'full' || access(B, viewer) !== 'full';
                            return (
                                <line
                                    key={f + t}
                                    className={`ont__edge${on ? ' is-on' : ''}${dim ? ' is-dim' : ''}`}
                                    x1={(A.x / 100) * size.w}
                                    y1={(A.y / 100) * size.h}
                                    x2={(B.x / 100) * size.w}
                                    y2={(B.y / 100) * size.h}
                                />
                            );
                        })}
                    </svg>
                    {EDGES.map(([f, t, label]) => {
                        const A = byId(f);
                        const B = byId(t);
                        return (
                            <span
                                key={`${f}${t}-l`}
                                className={`ont__elabel${f === sel || t === sel ? ' is-on' : ''}`}
                                style={{ left: `${(A.x + B.x) / 2}%`, top: `${(A.y + B.y) / 2}%` }}
                            >
                                {label}
                            </span>
                        );
                    })}
                    {OBJECTS.map((o) => (
                        <NodeCard key={o.id} o={o} a={access(o, viewer)} selected={o.id === sel} onSelect={() => setSel(o.id)} />
                    ))}
                </div>
            )}

            <aside className="ont__inspector" aria-live="polite">
                <p className="w-label">Object</p>
                <div className="ont__head">
                    <RightsState state={obj.state} />
                    <span className="ont__id">{a === 'hidden' ? '●●●-●●' : obj.id}</span>
                </div>
                <h4 className="ont__title">{a === 'full' ? obj.title : obj.type}</h4>
                <dl className="ont__props">
                    <div>
                        <dt>Type</dt>
                        <dd>{obj.type}</dd>
                    </div>
                    <div>
                        <dt>Owner</dt>
                        <dd>{obj.owner}</dd>
                    </div>
                    {obj.props.map(([k, v]) => (
                        <div key={k}>
                            <dt>{k}</dt>
                            <dd className={a === 'full' ? undefined : 'is-masked'}>{a === 'full' ? v : '████████'}</dd>
                        </div>
                    ))}
                    <div>
                        <dt>Training</dt>
                        <dd>Separate right · not granted</dd>
                    </div>
                </dl>
                <p className={`ont__why ont__why--${a}`}>{why(obj, viewer, a)}</p>
            </aside>
        </div>
    );
}

/* ── Section ──────────────────────────────────────────────────────────── */

const STATES: { state: Visibility; text: string }[] = [
    { state: 'private', text: 'Stays inside the organisation that produced it.' },
    { state: 'computable', text: 'Approved workloads may compute on it. No person or party inspects it.' },
    { state: 'released', text: 'An approved derivative, shared with named parties under a signed release.' },
    { state: 'public', text: 'Deliberately published. Nothing becomes public by default.' },
];

const RULES = [
    'Derived results inherit the strictest rights of their inputs.',
    'Training is a separate right. Analysing a partner’s data never implies permission to train on it.',
    'Export classification is a property of the data, checked at every exit.',
    'Partners can take their data and its provenance with them. Nobody is locked in.',
];

const GIVES = [
    ['Bulk chemistry', 'X-ray fluorescence, spark emission and plasma spectrometry'],
    ['Oxygen, nitrogen and carbon', 'Combustion and inert-gas fusion analysis'],
    ['Phases and microstructure', 'X-ray diffraction, electron microscopy and EBSD'],
    ['Some process fingerprints', 'Melt-pool tracks, texture and porosity, which narrow the process without fixing it'],
];

const KEEPS = [
    ['The window', 'The settings that hold when powder, machine and atmosphere vary'],
    ['The failures', 'Every candidate that did not work, and why'],
    ['The lineage', 'The chain from requirement to decision, with owners and rights'],
    ['The proof', 'The test evidence, and the demonstrated ability to make it again'],
];

export default function Evidence() {
    return (
        <section id="evidence" className="sec evidence" data-theme="navy" data-nav="navy" aria-labelledby="evidence-title">
            <Rails />
            <Grain />
            <div className="wrap">
                <header className="sec-head rv">
                    <Idx n="05">Evidence and IP</Idx>
                    <h2 id="evidence-title" className="w-h2">
                        Every claim keeps its evidence, its owner and its rights attached.
                    </h2>
                    <p className="w-lead">
                        Industrial partners share data only when they stay in control of it. In PRISM, provenance and
                        data rights are part of the material: every requirement, design, build, specimen, test and
                        decision records where it came from, who owns it and what it may be used for.
                    </p>
                </header>

                <div className="rv">
                    <OntologyExplorer />
                    <div className="evidence__src">
                        <SourceLine label="Illustrative">
                            Placeholder parties and objects, not customer data. Provenance and export classification
                            are maintained today; machine-enforced rights and controlled release are in development.
                        </SourceLine>
                    </div>
                </div>

                <div className="trust rv">
                    <div>
                        <p className="w-label trust__label">Four states, never changed implicitly</p>
                        <ul className="trust__states">
                            {STATES.map((s) => (
                                <li key={s.state}>
                                    <RightsState state={s.state} />
                                    <p>{s.text}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="w-label trust__label">Rules the platform enforces</p>
                        <ol className="trust__rules">
                            {RULES.map((r, i) => (
                                <li key={r}>
                                    <span>{String(i + 1).padStart(2, '0')}</span>
                                    {r}
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>

                <div className="ip rv" aria-labelledby="ip-title">
                    <div className="ip__head">
                        <p className="w-label trust__label">IP</p>
                        <h3 id="ip-title" className="w-h2 ip__title">
                            A part reveals its chemistry. It does not reveal the evidence.
                        </h3>
                        <p className="w-lead">
                            Anyone holding a part can analyse it, and may even work out a way to make something like
                            it. What they cannot take from the part is the proof that it works and the demonstrated
                            ability to make it again. In PRISM that evidence is the asset, and it stays with its owner.
                        </p>
                    </div>
                    <div className="ip__grid">
                        <div className="ip__col">
                            <p className="w-label">What a part gives away</p>
                            <ul>
                                {GIVES.map(([k, v]) => (
                                    <li key={k}>
                                        <strong>{k}</strong>
                                        <span>{v}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="ip__coupon" aria-hidden="true">
                            <svg viewBox="0 0 120 220">
                                <defs>
                                    <linearGradient id="ip-metal" x1="0" x2="1">
                                        <stop offset="0" stopColor="#4b5b6e" />
                                        <stop offset="0.45" stopColor="#c2cbd7" />
                                        <stop offset="0.6" stopColor="#8d9cae" />
                                        <stop offset="1" stopColor="#324157" />
                                    </linearGradient>
                                </defs>
                                <rect x="30" y="20" width="60" height="180" rx="6" fill="url(#ip-metal)" />
                                {Array.from({ length: 14 }, (_, i) => (
                                    <line key={i} x1="30" x2="90" y1={32 + i * 12} y2={32 + i * 12} className="ip__track" />
                                ))}
                                <rect className="ip__scan" x="22" y="20" width="76" height="3" />
                            </svg>
                            <p>Coupon</p>
                        </div>
                        <div className="ip__col ip__col--keep">
                            <p className="w-label">What stays in PRISM</p>
                            <ul>
                                {KEEPS.map(([k, v]) => (
                                    <li key={k}>
                                        <strong>{k}</strong>
                                        <span>{v}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <p className="ip__foot">Patent filings on PRISM’s methods are in progress.</p>
                </div>
            </div>
        </section>
    );
}
