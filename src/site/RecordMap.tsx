import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { RightsState } from '../ds';
import type { Visibility } from '../ds/RightsState';
import { seeded, useMediaQuery, useReducedMotion } from './hooks';

/*
 * Who sees what, drawn as a live map. Each company is a territory; its records sit inside it. Wires
 * carry the work from requirement to decision, with data moving along them. Where a wire leaves one
 * company for another it passes a gate: a signed release, or compute only. Pick a viewer and the map
 * redraws what that party can open, what software may use without anyone reading it, and what stays
 * sealed. The parties and records are made up: no customer data.
 */

type Party = 'Customer A' | 'Partner B' | 'Mirdyne' | 'Public';
type Owner = Exclude<Party, 'Public'>;
type Glyph = 'target' | 'lattice' | 'layers' | 'coupon' | 'gauge' | 'net' | 'curve' | 'seal' | 'lock';

const VIEWERS: { id: Party; role: string }[] = [
    { id: 'Customer A', role: 'Owns the requirement' },
    { id: 'Partner B', role: 'Makes and tests the samples' },
    { id: 'Mirdyne', role: 'Runs the platform' },
    { id: 'Public', role: 'Anyone else' },
];

const LAND_KEY: Record<Owner, string> = { 'Customer A': 'a', 'Partner B': 'b', Mirdyne: 'm' };

/** Each company's territory on the wide map, in % of the map. The top middle is neutral ground. */
const LANDS: { owner: Owner; x: number; y: number; w: number; h: number }[] = [
    { owner: 'Customer A', x: 1, y: 2, w: 29, h: 96 },
    { owner: 'Mirdyne', x: 35, y: 38, w: 30, h: 60 },
    { owner: 'Partner B', x: 70, y: 2, w: 29, h: 96 },
];
const EXCHANGE = { x: 35, y: 2, w: 30, h: 32 };

interface Rec {
    id: string;
    type: string;
    title: string;
    owner: Owner;
    state: Visibility;
    releasedTo?: Party[];
    release?: string;
    props: [string, string][];
    glyph: Glyph;
    /** Centre on the wide map, in % of the map. */
    at: [number, number];
}

/** Illustrative records and placeholder parties: no customer data. In the order the work flows. */
const RECORDS: Rec[] = [
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
        glyph: 'target',
        at: [15.5, 52],
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
        glyph: 'lattice',
        at: [15.5, 19],
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
        glyph: 'layers',
        at: [84.5, 19],
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
        glyph: 'coupon',
        at: [84.5, 52],
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
        glyph: 'gauge',
        at: [84.5, 85],
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
        glyph: 'net',
        at: [50, 85],
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
        glyph: 'curve',
        at: [50, 57],
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
        glyph: 'seal',
        at: [15.5, 85],
    },
];
const REC = Object.fromEntries(RECORDS.map((r) => [r.id, r])) as Record<string, Rec>;

interface Gate {
    kind: 'release' | 'compute';
    /** Where the wire crosses into the other territory, in % of the map width. */
    x: number;
    name: string;
    note: string;
}

interface Wire {
    from: string;
    to: string;
    label: string;
    /** For wires that turn: the corridor they run along, in % of the map width. */
    via?: number;
    gate?: Gate;
    /** Where along its longest run the wire's name sits, 0 to 1 (default: middle, or near the end past a gate). */
    lt?: number;
}

const WIRES: Wire[] = [
    { from: 'REQ-A-014', to: 'CND-07', label: 'leads to' },
    {
        from: 'CND-07',
        to: 'BLD-12',
        label: 'built as',
        gate: { kind: 'release', x: 50, name: 'Release R-019', note: 'Signed by Customer A. For manufacture only.' },
    },
    { from: 'BLD-12', to: 'SPC-12-3', label: 'produced' },
    { from: 'SPC-12-3', to: 'TST-88', label: 'measured by' },
    {
        from: 'TST-88',
        to: 'EST-88',
        label: 'supports',
        via: 63,
        gate: { kind: 'compute', x: 67.5, name: 'Compute only', note: 'Software reads the raw data. No person does.' },
    },
    { from: 'MDL-4', to: 'EST-88', label: 'computed by' },
    {
        from: 'EST-88',
        to: 'DEC-03',
        label: 'justifies',
        via: 37,
        gate: { kind: 'release', x: 32.5, name: 'Release R-044', note: 'Aggregate properties only.' },
        lt: 0.22,
    },
    { from: 'DEC-03', to: 'REQ-A-014', label: 'answers' },
];

type Access = 'full' | 'compute' | 'hidden';

function access(r: Rec, viewer: Party): Access {
    if (viewer === r.owner || r.state === 'public') return 'full';
    if (viewer === 'Public') return 'hidden';
    if (r.state === 'released' && r.releasedTo?.includes(viewer)) return 'full';
    if (r.state === 'computable') return 'compute';
    return 'hidden';
}

function why(r: Rec, viewer: Party, a: Access) {
    if (a === 'full' && viewer === r.owner) return 'You own this record.';
    if (a === 'full') return `Shared with you under release ${r.release}.`;
    if (a === 'compute') return 'Software may calculate with it, but no person can read the values. Not even Mirdyne.';
    if (viewer === 'Public') return 'Not public. Nothing is published unless its owner decides to.';
    if (r.state === 'private') return `Private to ${r.owner}. Nothing is shared by accident.`;
    return `Not shared with you. ${r.owner} has shared it with ${r.releasedTo?.join(' and ')} only.`;
}

/** How a wire looks to this viewer: open if both ends can be read, sealed if either end is hidden. */
function wireLook(w: Wire, viewer: Party) {
    const a = access(REC[w.from], viewer);
    const b = access(REC[w.to], viewer);
    if (a === 'hidden' || b === 'hidden') return 'sealed';
    if (a === 'compute' || b === 'compute' || w.gate?.kind === 'compute') return 'compute';
    return 'open';
}

/* ── Glyphs ───────────────────────────────────────────────────────────── */

/** One small line drawing per kind of record. */
function RecGlyph({ glyph }: { glyph: Glyph }) {
    const g = {
        target: (
            <>
                <circle cx="12" cy="12" r="8.5" />
                <circle cx="12" cy="12" r="4.5" />
                <circle cx="12" cy="12" r="1" className="fill" />
                <path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4" />
            </>
        ),
        lattice: (
            <>
                <path d="M5 5h14v14H5z" />
                <path d="M5 5l7 7 7-7M5 19l7-7 7 7" />
                <circle cx="5" cy="5" r="1.6" className="fill" />
                <circle cx="19" cy="5" r="1.6" className="fill" />
                <circle cx="5" cy="19" r="1.6" className="fill" />
                <circle cx="19" cy="19" r="1.6" className="fill" />
                <circle cx="12" cy="12" r="2.2" className="fill" />
            </>
        ),
        layers: (
            <>
                <path d="M12 3l9 4.5-9 4.5-9-4.5z" />
                <path d="M3 12l9 4.5 9-4.5" />
                <path d="M3 16.5l9 4.5 9-4.5" />
            </>
        ),
        coupon: <path d="M2.5 8h5.5l2 2.5h4l2-2.5h5.5v8H16l-2-2.5h-4l-2 2.5H2.5z" />,
        gauge: (
            <>
                <path d="M3.5 17a8.5 8.5 0 0 1 17 0" />
                <path d="M12 17l4.5-6" />
                <circle cx="12" cy="17" r="1.4" className="fill" />
                <path d="M6 12.5l1.2 1M12 8.5v1.6M18 12.5l-1.2 1" />
            </>
        ),
        net: (
            <>
                <path d="M5 6l7 6-7 6M5 6l7 6M5 18l7-6M12 12l7-4M12 12l7 4M5 12h7" />
                <circle cx="5" cy="6" r="1.8" className="fill" />
                <circle cx="5" cy="12" r="1.8" className="fill" />
                <circle cx="5" cy="18" r="1.8" className="fill" />
                <circle cx="12" cy="12" r="2" className="fill" />
                <circle cx="19" cy="8" r="1.8" className="fill" />
                <circle cx="19" cy="16" r="1.8" className="fill" />
            </>
        ),
        curve: (
            <>
                <path d="M3 20h18M3 20V4" />
                <path d="M4 18c3 0 4-11 8-11s5 11 8 11" />
                <path d="M12 4.5v5M10.5 4.5h3M10.5 9.5h3" />
            </>
        ),
        seal: (
            <>
                <circle cx="12" cy="12" r="8.5" />
                <path d="M7.8 12.3l2.8 2.8 5.6-6" />
            </>
        ),
        lock: (
            <>
                <rect x="5" y="10.5" width="14" height="10" rx="2" />
                <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
                <circle cx="12" cy="15.5" r="1.3" className="fill" />
            </>
        ),
    }[glyph];
    return (
        <svg className="rglyph" viewBox="0 0 24 24" aria-hidden="true">
            {g}
        </svg>
    );
}

/* ── Shared pieces ────────────────────────────────────────────────────── */

function RecCard({
    r,
    viewer,
    selected,
    onSelect,
    style,
}: {
    r: Rec;
    viewer: Party;
    selected: boolean;
    onSelect: () => void;
    style?: CSSProperties;
}) {
    const a = access(r, viewer);
    return (
        <button
            type="button"
            data-rec={r.id}
            className={`rcard rcard--${a} land-${LAND_KEY[r.owner]}${selected ? ' is-selected' : ''}`}
            style={style}
            aria-pressed={selected}
            onClick={onSelect}
        >
            <span className="rcard__icon">
                <RecGlyph glyph={a === 'hidden' ? 'lock' : r.glyph} />
            </span>
            <span className="rcard__type">
                <RightsState state={r.state} label={r.type} />
            </span>
            <span className="rcard__title">
                {a === 'full' ? r.title : a === 'compute' ? 'Values hidden · software only' : 'Sealed · not visible to you'}
            </span>
            <span className="rcard__id">{a === 'hidden' ? '●●●-●●' : r.id}</span>
        </button>
    );
}

function Details({ r, viewer }: { r: Rec; viewer: Party }) {
    const a = access(r, viewer);
    return (
        <>
            <div className="rdetail__head">
                <RightsState state={r.state} />
                <span className="rdetail__id">{a === 'hidden' ? '●●●-●●' : r.id}</span>
            </div>
            <h4 className="rdetail__title">{a === 'full' ? r.title : r.type}</h4>
            <dl className="rdetail__props">
                <div>
                    <dt>Type</dt>
                    <dd>{r.type}</dd>
                </div>
                <div>
                    <dt>Owner</dt>
                    <dd>{r.owner}</dd>
                </div>
                {r.props.map(([k, v]) => (
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
            <p className={`rdetail__why rdetail__why--${a}`}>{why(r, viewer, a)}</p>
        </>
    );
}

function GateMark({ gate, style }: { gate: Gate; style?: CSSProperties }) {
    return (
        <span className={`rgate rgate--${gate.kind}`} style={style} title={gate.note}>
            <i aria-hidden="true">
                <span>{gate.kind === 'compute' ? 'ƒ' : '✓'}</span>
            </i>
            <b>{gate.name}</b>
        </span>
    );
}

/** Data moving along a wire: small lights, spaced out, at an even speed. */
function Packets({ d, length, look, count = 2 }: { d: string; length: number; look: string; count?: number }) {
    const dur = Math.max(1.6, length / 95);
    return (
        <>
            {Array.from({ length: count }, (_, k) => (
                <circle key={`${d}-${k}`} className={`rpkt rpkt--${look}`} r={look === 'compute' ? 3.2 : 2.6}>
                    <animateMotion dur={`${dur.toFixed(2)}s`} begin={`${((dur / count) * k).toFixed(2)}s`} repeatCount="indefinite" path={d} />
                </circle>
            ))}
        </>
    );
}

/** Arrowheads, one per look of wire. */
function Tips({ id }: { id: string }) {
    return (
        <defs>
            {['open', 'compute', 'sealed', 'on'].map((k) => (
                <marker key={k} id={`${id}-${k}`} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path className={`rtip rtip--${k}`} d="M1 1.5 8.5 5 1 8.5" />
                </marker>
            ))}
        </defs>
    );
}

/* ── Geometry ─────────────────────────────────────────────────────────── */

interface Box {
    x: number;
    y: number;
    w: number;
    h: number;
}
type Pt = [number, number];

const mid = (b: Box): Pt => [b.x + b.w / 2, b.y + b.h / 2];

/** A path through the points with rounded corners, like a trace on a circuit board. */
function trace(pts: Pt[], r = 12) {
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i - 1];
        const [x1, y1] = pts[i];
        const [x2, y2] = pts[i + 1];
        const l1 = Math.hypot(x1 - x0, y1 - y0) || 1;
        const l2 = Math.hypot(x2 - x1, y2 - y1) || 1;
        const k = Math.min(r, l1 / 2, l2 / 2);
        const ax = x1 - ((x1 - x0) / l1) * k;
        const ay = y1 - ((y1 - y0) / l1) * k;
        const bx = x1 + ((x2 - x1) / l2) * k;
        const by = y1 + ((y2 - y1) / l2) * k;
        d += ` L${ax.toFixed(1)},${ay.toFixed(1)} Q${x1.toFixed(1)},${y1.toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)}`;
    }
    const [lx, ly] = pts[pts.length - 1];
    return `${d} L${lx.toFixed(1)},${ly.toFixed(1)}`;
}

const lengthOf = (pts: Pt[]) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

/** The points a wire runs through on the wide map, from one card's edge to the other's. */
function route(w: Wire, A: Box, B: Box, W: number): Pt[] {
    const [ax, ay] = mid(A);
    const [bx, by] = mid(B);
    if (w.via != null) {
        const vx = (w.via / 100) * W;
        return [
            [vx < ax ? A.x : A.x + A.w, ay],
            [vx, ay],
            [vx, by],
            [vx < bx ? B.x : B.x + B.w, by],
        ];
    }
    if (Math.abs(ay - by) < Math.abs(ax - bx)) {
        const right = bx > ax;
        return [
            [right ? A.x + A.w : A.x, ay],
            [right ? B.x : B.x + B.w, by],
        ];
    }
    const down = by > ay;
    return [
        [ax, down ? A.y + A.h : A.y],
        [bx, down ? B.y : B.y + B.h],
    ];
}

/** Where on the wire it crosses the given x: the gate sits there. */
function crossing(pts: Pt[], x: number): Pt {
    for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1];
        const [x1] = pts[i];
        if ((x0 - x) * (x1 - x) <= 0 && x0 !== x1) return [x, y0];
    }
    return pts[0];
}

/** Where a wire's name goes: along its longest straight run, towards the end it points to. */
function labelAt(pts: Pt[], t: number): { p: Pt; vertical: boolean } {
    let best = 1;
    let len = 0;
    for (let i = 1; i < pts.length; i++) {
        const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        if (l > len) {
            len = l;
            best = i;
        }
    }
    const [x0, y0] = pts[best - 1];
    const [x1, y1] = pts[best];
    return { p: [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t], vertical: Math.abs(x1 - x0) < 1 };
}

/** Measures boxes inside a container, again whenever it changes size. */
function useBoxes(dep: unknown) {
    const ref = useRef<HTMLDivElement>(null);
    const [geo, setGeo] = useState<{ w: number; h: number; boxes: Record<string, Box> } | null>(null);
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        const measure = () => {
            const base = el.getBoundingClientRect();
            const boxes: Record<string, Box> = {};
            el.querySelectorAll<HTMLElement>('[data-rec]').forEach((n) => {
                const r = n.getBoundingClientRect();
                boxes[n.dataset.rec!] = { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
            });
            setGeo((prev) => {
                const same =
                    prev &&
                    Math.abs(prev.w - base.width) < 0.5 &&
                    Math.abs(prev.h - base.height) < 0.5 &&
                    Object.entries(boxes).every(([k, b]) => {
                        const p = prev.boxes[k];
                        return p && Math.abs(p.x - b.x) < 0.5 && Math.abs(p.y - b.y) < 0.5 && Math.abs(p.h - b.h) < 0.5;
                    });
                return same ? prev : { w: base.width, h: base.height, boxes };
            });
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        el.querySelectorAll('[data-rec]').forEach((n) => ro.observe(n));
        return () => ro.disconnect();
    }, [dep]);
    return [ref, geo] as const;
}

/** A faint web of other records behind the map: the rest of the knowledge graph. */
function Mesh({ w, h }: { w: number; h: number }) {
    const { dots, links } = useMemo(() => {
        const rnd = seeded(27);
        const pts: Pt[] = Array.from({ length: 70 }, () => [rnd() * w, rnd() * h]);
        const ls: [Pt, Pt][] = [];
        pts.forEach((p, i) => {
            pts.map((q, j) => ({ j, d: Math.hypot(p[0] - q[0], p[1] - q[1]) }))
                .filter((o) => o.j > i)
                .sort((a, b) => a.d - b.d)
                .slice(0, 2)
                .forEach((o) => ls.push([p, pts[o.j]]));
        });
        return { dots: pts, links: ls };
    }, [w, h]);
    return (
        <g className="rmesh">
            {links.map(([p, q], i) => (
                <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} />
            ))}
            {dots.map((p, i) => (
                <circle key={i} cx={p[0]} cy={p[1]} r={1.4} className={i % 6 === 0 ? 'is-live' : undefined} style={{ '--d': `${(i % 7) * 0.6}s` } as CSSProperties} />
            ))}
        </g>
    );
}

/* ── Wide map ─────────────────────────────────────────────────────────── */

function WideMap({ viewer, sel, onSelect, moving }: { viewer: Party; sel: string; onSelect: (id: string) => void; moving: boolean }) {
    const [ref, geo] = useBoxes('wide');
    const W = geo?.w ?? 0;
    const H = geo?.h ?? 0;
    const wires =
        geo && W > 0
            ? WIRES.map((w) => {
                  const A = geo.boxes[w.from];
                  const B = geo.boxes[w.to];
                  if (!A || !B) return null;
                  const pts = route(w, A, B, W);
                  return {
                      w,
                      pts,
                      d: trace(pts),
                      length: lengthOf(pts),
                      look: wireLook(w, viewer),
                      on: w.from === sel || w.to === sel,
                      gate: w.gate ? crossing(pts, (w.gate.x / 100) * W) : null,
                      label: labelAt(pts, w.lt ?? (w.gate ? 0.8 : 0.5)),
                  };
              })
            : [];
    const youOwn = viewer === 'Public' ? null : viewer;
    return (
        <div ref={ref} className="rmap__stage">
            {geo && (
                <svg className="rmap__svg" width={W} height={H} aria-hidden="true">
                    <Tips id="rmap-tip" />
                    <Mesh w={W} h={H} />
                    <rect
                        className="rland rland--x"
                        x={(EXCHANGE.x / 100) * W}
                        y={(EXCHANGE.y / 100) * H}
                        width={(EXCHANGE.w / 100) * W}
                        height={(EXCHANGE.h / 100) * H}
                        rx={14}
                    />
                    {LANDS.map((l) => (
                        <rect
                            key={l.owner}
                            className={`rland land-${LAND_KEY[l.owner]}${youOwn === l.owner ? ' is-you' : ''}`}
                            x={(l.x / 100) * W}
                            y={(l.y / 100) * H}
                            width={(l.w / 100) * W}
                            height={(l.h / 100) * H}
                            rx={16}
                        />
                    ))}
                    {wires.map(
                        (x) =>
                            x && (
                                <path
                                    key={`${x.w.from}-${x.w.to}`}
                                    className={`rwire rwire--${x.look}${x.on ? ' is-on' : ''}`}
                                    d={x.d}
                                    markerEnd={`url(#rmap-tip-${x.on ? 'on' : x.look})`}
                                />
                            ),
                    )}
                    {moving &&
                        wires.map(
                            (x) =>
                                x && (
                                    <g key={`p-${x.w.from}-${x.w.to}`} className={x.on ? 'is-on' : undefined}>
                                        <Packets d={x.d} length={x.length} look={x.look} />
                                    </g>
                                ),
                        )}
                </svg>
            )}
            {LANDS.map((l) => (
                <p
                    key={l.owner}
                    className={`rland__tag land-${LAND_KEY[l.owner]}${youOwn === l.owner ? ' is-you' : ''}`}
                    style={{ left: `${l.x + 1.2}%`, top: `${l.y + 2}%` }}
                >
                    <b>{l.owner}</b>
                    {youOwn === l.owner && <em>You</em>}
                </p>
            ))}
            <p className="rland__tag rland__tag--x" style={{ left: `${EXCHANGE.x + 1.2}%`, top: `${EXCHANGE.y + 2}%` }}>
                <b>Between companies</b>
                <span>Signed releases only</span>
            </p>
            {wires.map(
                (x) =>
                    x && (
                        <span
                            key={`l-${x.w.from}-${x.w.to}`}
                            className={`rwire__label${x.label.vertical ? ' is-v' : ''}${x.label.p[0] < W / 2 ? ' is-left' : ''}${x.on ? ' is-on' : ''}`}
                            style={{ left: x.label.p[0], top: x.label.p[1] }}
                        >
                            {x.w.label}
                        </span>
                    ),
            )}
            {wires.map((x) => x && x.gate && x.w.gate && <GateMark key={`g-${x.w.from}`} gate={x.w.gate} style={{ left: x.gate[0], top: x.gate[1] }} />)}
            {RECORDS.map((r) => (
                <RecCard
                    key={r.id}
                    r={r}
                    viewer={viewer}
                    selected={r.id === sel}
                    onSelect={() => onSelect(r.id)}
                    style={{ left: `${r.at[0]}%`, top: `${r.at[1]}%` }}
                />
            ))}
        </div>
    );
}

/* ── Phones: the same map as one column ───────────────────────────────── */

const FLOW: ({ owner: Owner; ids: string[] } | { gate: Gate })[] = [
    { owner: 'Customer A', ids: ['REQ-A-014', 'CND-07'] },
    { gate: WIRES[1].gate! },
    { owner: 'Partner B', ids: ['BLD-12', 'SPC-12-3', 'TST-88'] },
    { gate: WIRES[4].gate! },
    { owner: 'Mirdyne', ids: ['MDL-4', 'EST-88'] },
    { gate: WIRES[6].gate! },
    { owner: 'Customer A', ids: ['DEC-03'] },
];
/** The main line: every record but the model, which feeds in from the side. */
const SPINE = ['REQ-A-014', 'CND-07', 'BLD-12', 'SPC-12-3', 'TST-88', 'EST-88', 'DEC-03'];
const SPINE_X = 16;

function FlowMap({ viewer, sel, onSelect, moving }: { viewer: Party; sel: string; onSelect: (id: string) => void; moving: boolean }) {
    const [ref, geo] = useBoxes('flow');
    let lines: { key: string; d: string; length: number; look: string; up?: boolean }[] = [];
    let ports: { id: string; y: number; x: number }[] = [];
    if (geo) {
        const b = geo.boxes;
        const ok = SPINE.every((id) => b[id]) && b['MDL-4'];
        if (ok) {
            const ys = SPINE.map((id) => mid(b[id])[1]);
            // One wire per step, so each can be sealed or open for this viewer.
            lines = SPINE.slice(1).map((id, i) => {
                const w = WIRES.find((x) => x.from === SPINE[i] && x.to === id)!;
                const pts: Pt[] = [
                    [SPINE_X, ys[i]],
                    [SPINE_X, ys[i + 1]],
                ];
                return { key: `${SPINE[i]}-${id}`, d: trace(pts), length: lengthOf(pts), look: wireLook(w, viewer) };
            });
            const m = b['MDL-4'];
            const e = b['EST-88'];
            const join = (m.y + m.h + e.y) / 2;
            const mx = m.x - 12;
            const branch: Pt[] = [
                [m.x, m.y + m.h / 2],
                [mx, m.y + m.h / 2],
                [mx, join],
                [SPINE_X, join],
            ];
            lines.push({ key: 'MDL-4-EST-88', d: trace(branch, 8), length: lengthOf(branch), look: wireLook(WIRES[5], viewer) });
            const d = b['DEC-03'];
            const q = b['REQ-A-014'];
            const rx = geo.w - 9;
            const back: Pt[] = [
                [d.x + d.w, mid(d)[1]],
                [rx, mid(d)[1]],
                [rx, mid(q)[1]],
                [q.x + q.w, mid(q)[1]],
            ];
            lines.push({ key: 'DEC-03-REQ-A-014', d: trace(back, 10), length: lengthOf(back), look: wireLook(WIRES[7], viewer), up: true });
            ports = SPINE.map((id, i) => ({ id, y: ys[i], x: SPINE_X }));
        }
    }
    return (
        <div ref={ref} className="rflow">
            {geo && (
                <svg className="rflow__svg" width={geo.w} height={geo.h} aria-hidden="true">
                    <Tips id="rflow-tip" />
                    {lines.map((l) => (
                        <path key={l.key} className={`rwire rwire--${l.look}`} d={l.d} markerEnd={l.up ? `url(#rflow-tip-${l.look})` : undefined} />
                    ))}
                    {ports.map((p) => (
                        <g key={p.id}>
                            <line className="rflow__stub" x1={p.x} y1={p.y} x2={geo.boxes[p.id].x} y2={p.y} />
                            <circle className={`rflow__port${p.id === sel ? ' is-on' : ''}`} cx={p.x} cy={p.y} r={4.5} />
                        </g>
                    ))}
                    {moving && lines.map((l) => <Packets key={`p-${l.key}`} d={l.d} length={l.length} look={l.look} count={1} />)}
                </svg>
            )}
            {FLOW.map((step, i) =>
                'gate' in step ? (
                    <div key={i} className={`rflow__gate rflow__gate--${step.gate.kind}`}>
                        <GateMark gate={step.gate} />
                        <span>
                            <strong>{step.gate.name}</strong>
                            {step.gate.note}
                        </span>
                    </div>
                ) : (
                    <section key={i} className={`rflow__land land-${LAND_KEY[step.owner]}${viewer === step.owner ? ' is-you' : ''}`}>
                        <p className="rland__tag">
                            <b>{step.owner}</b>
                            {viewer === step.owner && <em>You</em>}
                        </p>
                        {step.ids.map((id) => (
                            <div key={id} className={`rflow__item${id === 'MDL-4' ? ' is-side' : ''}`}>
                                <RecCard r={REC[id]} viewer={viewer} selected={id === sel} onSelect={() => onSelect(id === sel ? '' : id)} />
                                {id === sel && (
                                    <div className="rdetail rdetail--inline" aria-live="polite">
                                        <Details r={REC[id]} viewer={viewer} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </section>
                ),
            )}
        </div>
    );
}

/* ── The map ──────────────────────────────────────────────────────────── */

export default function RecordMap() {
    const [viewer, setViewer] = useState<Party>('Customer A');
    // Wide screens open on one record; phones open a record's details only when it is tapped.
    const [sel, setSel] = useState(() => (window.matchMedia('(min-width: 900px)').matches ? 'EST-88' : ''));
    const wide = useMediaQuery('(min-width: 900px)');
    const reduced = useReducedMotion();
    const box = useRef<HTMLDivElement>(null);
    const [near, setNear] = useState(false);
    const [scan, setScan] = useState(0);

    // Data moves only while the map is on screen, and never when reduced motion is asked for.
    useEffect(() => {
        const el = box.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: '200px 0px' });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const pick = (v: Party) => {
        setViewer(v);
        setScan((s) => s + 1);
    };
    const shown = RECORDS.filter((r) => access(r, viewer) === 'full').length;
    const selected = sel ? REC[sel] : null;
    const moving = near && !reduced;

    return (
        <div ref={box} className={`rmap${wide ? ' rmap--wide' : ' rmap--flow'}`}>
            <div className="rmap__bar">
                <p className="w-label">Viewing as</p>
                <div className="seg seg--dark rmap__seg" role="group" aria-label="Viewing as">
                    {VIEWERS.map((v) => (
                        <button key={v.id} type="button" aria-pressed={v.id === viewer} onClick={() => pick(v.id)}>
                            {v.id}
                        </button>
                    ))}
                </div>
                <p className="rmap__count" aria-live="polite">
                    <span className="rmap__live" aria-hidden="true" />
                    {VIEWERS.find((v) => v.id === viewer)?.role}. Opens {shown} of {RECORDS.length} records.
                </p>
            </div>
            <div className="rmap__body">
                <div className="rmap__view">
                    {wide ? (
                        <WideMap viewer={viewer} sel={sel} onSelect={setSel} moving={moving} />
                    ) : (
                        <FlowMap viewer={viewer} sel={sel} onSelect={setSel} moving={moving} />
                    )}
                    {scan > 0 && !reduced && <span key={scan} className="rmap__scan" aria-hidden="true" />}
                </div>
                {wide && selected && (
                    <aside className="rdetail" aria-live="polite">
                        <p className="w-label">Record</p>
                        <Details r={selected} viewer={viewer} />
                    </aside>
                )}
            </div>
        </div>
    );
}
