import { useEffect, useRef, useState } from 'react';
import { RightsState, SourceLine } from '../ds';
import type { Visibility } from '../ds/RightsState';
import CameoLineage from './Cameo';
import { PartDiagram } from './diagrams';
import { useMediaQuery } from './hooks';
import { Grain, Idx, Rails } from './ui';

/* ── Ontology explorer ────────────────────────────────────────────────── */

type Party = 'Customer A' | 'Partner B' | 'Mirdyne' | 'Public';
const VIEWERS: { id: Party; role: string }[] = [
    { id: 'Customer A', role: 'Owns the requirement' },
    { id: 'Partner B', role: 'Makes and tests the samples' },
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
        title: 'Sample build 12',
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
        title: 'PRISM prediction model, version 4',
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
    ['REQ-A-014', 'CND-07', 'leads to'],
    ['CND-07', 'BLD-12', 'built as'],
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
    if (a === 'full' && viewer === o.owner) return 'You own this record.';
    if (a === 'full') return `Shared with you under release ${o.release}.`;
    if (a === 'compute')
        return 'Software may calculate with it, but no person can read the values. Not even Mirdyne.';
    if (viewer === 'Public') return 'Not public. Nothing is published unless its owner decides to.';
    if (o.state === 'private') return `Private to ${o.owner}. Nothing is shared by accident.`;
    return `Not shared with you. ${o.owner} has shared it with ${o.releasedTo?.join(' and ')} only.`;
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
                {a === 'full' ? o.title : a === 'compute' ? 'Values hidden · software only' : 'Not visible to you'}
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
                    {VIEWERS.find((v) => v.id === viewer)?.role}. Sees {visibleCount} of {OBJECTS.length} records in
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
                <p className="w-label">Record</p>
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
                        <dt>AI training</dt>
                        <dd>Separate permission · not given</dd>
                    </div>
                </dl>
                <p className={`ont__why ont__why--${a}`}>{why(obj, viewer, a)}</p>
            </aside>
        </div>
    );
}

/* ── Section ──────────────────────────────────────────────────────────── */

const STATES: { state: Visibility; text: string }[] = [
    { state: 'private', text: 'Stays inside the company that made it.' },
    { state: 'computable', text: 'Approved software may calculate with it. No person sees the values.' },
    { state: 'released', text: 'A result shared with named partners, under a signed release.' },
    { state: 'public', text: 'Published on purpose. Nothing becomes public by default.' },
];

const RULES = [
    'Anything made from data keeps the strictest rules of what went into it.',
    'Training AI is a separate permission. Using a partner’s data never means training on it.',
    'Export rules belong to the data, and are checked whenever data leaves.',
    'Partners can take their data and its history with them. No lock-in.',
];

const GIVES = [
    ['What it is made of', 'Standard lab analysis'],
    ['Trace gases', 'Oxygen, nitrogen and carbon'],
    ['Its inner structure', 'X-ray and electron microscopes'],
    ['Clues about how it was made', 'Melt tracks and pores hint at the process, but do not give it away'],
];

const KEEPS = [
    ['The safe settings', 'What still works when powder, machine and gas vary'],
    ['The failures', 'Every idea that did not work, and why'],
    ['The history', 'The chain from requirement to decision, with owners and rights'],
    ['The proof', 'The test results, and the proven ability to make it again'],
];

export default function Evidence({ n = '01', h1 = false }: { n?: string; h1?: boolean }) {
    const H = h1 ? 'h1' : 'h2';
    return (
        <section id="evidence" className="sec evidence" data-theme="navy" data-nav="navy" aria-labelledby="evidence-title">
            <Rails />
            <Grain />
            <div className="wrap">
                <header className="sec-head rv">
                    <Idx n={n}>Evidence and IP</Idx>
                    <H id="evidence-title" className="w-h2">
                        Every result keeps its proof, its owner and its rules.
                    </H>
                    <p className="w-lead">
                        <b>Who can see what? Only what the owner allows.</b> Companies share data only if they stay in
                        control of it. So in PRISM, every requirement, design, sample, test and decision records where
                        it came from, who owns it and what it may be used for. Pick a viewer below and see what they
                        can see.
                    </p>
                </header>

                <nav className="onpage rv" aria-label="On this page">
                    <a href="#sharing">Who sees what</a>
                    <a href="#lineage">A real lineage</a>
                    <a href="#ip">What a part gives away</a>
                </nav>

                <div id="sharing" className="rv">
                    <OntologyExplorer />
                    <div className="evidence__src">
                        <SourceLine label="Illustrative">
                            Made-up parties and records, not customer data. Tracing and export labels work today;
                            automatic enforcement of sharing rules is being built.
                        </SourceLine>
                    </div>
                </div>

                <div className="trust rv">
                    <div>
                        <p className="w-label trust__label">Four levels of sharing. None changes by accident.</p>
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
                        <p className="w-label trust__label">Rules PRISM follows</p>
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

                <CameoLineage />

                <div id="ip" className="ip rv" aria-labelledby="ip-title">
                    <div className="ip__head">
                        <p className="w-label trust__label">IP</p>
                        <h3 id="ip-title" className="w-h2 ip__title">
                            Anyone can analyse a part. Nobody can copy the proof.
                        </h3>
                        <p className="w-lead">
                            <b>What does a part give away? What it is made of, not the proof.</b> Anyone holding a part
                            can test it, and may even copy something like it. What they cannot get from the part is the
                            proof that it works, and the know-how to make it again and again. In PRISM that proof is the
                            asset, and it stays with its owner.
                        </p>
                    </div>
                    <figure className="ip__plate" data-theme="paper">
                        <PartDiagram />
                    </figure>
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
                        <div className="ip__col ip__col--keep">
                            <p className="w-label">What stays with its owner</p>
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
