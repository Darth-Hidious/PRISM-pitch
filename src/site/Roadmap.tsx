import { useEffect, useRef } from 'react';
import { SourceLine } from '../ds';
import { seeded, useInView, useReducedMotion } from './hooks';
import { Grain, Idx, Rails } from './ui';

type TrackState = 'done' | 'current' | 'next';

const BRANCHES: { name: string; text: string; items: { title: string; status: string; state: TrackState }[] }[] = [
    {
        name: 'Materials programmes',
        text: 'The loop, taken to new kinds of material.',
        items: [
            { title: 'Refractory alloys', status: 'Active', state: 'current' },
            { title: 'PFAS‑free polymers', status: 'Contracted', state: 'next' },
            { title: 'Polymers and bio-based materials', status: 'Next', state: 'next' },
        ],
    },
    {
        name: 'Supply-chain intelligence',
        text: 'The same tools, used to see how a change at one supplier spreads.',
        items: [
            { title: 'Supply risk', status: 'Internal', state: 'done' },
            { title: 'Market signals', status: 'Prototype', state: 'current' },
            { title: 'Programme risk', status: 'Exploratory', state: 'next' },
            { title: 'Early warnings', status: 'Next', state: 'next' },
        ],
    },
];

/* ── Event network: a change propagating from a supplier ──────────────── */

const COLUMNS = ['Suppliers', 'Materials', 'Processes', 'Components', 'Programmes'];
const COUNTS = [4, 4, 3, 4, 3];
const W = 1200;
const H = 380;

interface Net {
    nodes: { id: string; col: number; x: number; y: number }[];
    edges: { id: string; from: string; to: string }[];
}

function buildNet(): Net {
    const rand = seeded(2021);
    const nodes: Net['nodes'] = [];
    COUNTS.forEach((n, c) => {
        for (let k = 0; k < n; k++) {
            nodes.push({
                id: `${c}-${k}`,
                col: c,
                x: 90 + c * 255,
                y: 70 + ((k + 0.5) / n) * 290 + (rand() - 0.5) * 30,
            });
        }
    });
    const edges: Net['edges'] = [];
    for (let c = 0; c < COUNTS.length - 1; c++) {
        const here = nodes.filter((n) => n.col === c);
        const next = nodes.filter((n) => n.col === c + 1);
        const hit = new Set<string>();
        for (const a of here) {
            const k = 1 + (rand() < 0.55 ? 1 : 0);
            const targets = [...next].sort((p, q) => Math.abs(p.y - a.y) - Math.abs(q.y - a.y) + (rand() - 0.5) * 120).slice(0, k);
            for (const b of targets) {
                edges.push({ id: `${a.id}>${b.id}`, from: a.id, to: b.id });
                hit.add(b.id);
            }
        }
        for (const b of next) {
            if (hit.has(b.id)) continue;
            const a = here[Math.floor(rand() * here.length)];
            edges.push({ id: `${a.id}>${b.id}`, from: a.id, to: b.id });
        }
    }
    return { nodes, edges };
}

const NET = buildNet();

function EventNetwork() {
    const net = NET;
    const [ref, inView] = useInView<HTMLDivElement>('-10% 0px');
    const reduce = useReducedMotion();
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg || !inView || reduce) return;
        const timers: ReturnType<typeof setTimeout>[] = [];
        const rand = seeded(7 + Math.floor(performance.now()));
        const flash = (sel: string) => {
            const el = svg.querySelector<SVGElement>(sel);
            if (!el) return;
            el.classList.remove('is-hit');
            el.getBoundingClientRect(); // restart the animation
            el.classList.add('is-hit');
        };
        // A self-exciting cascade: each activation may excite its neighbours downstream.
        const fire = (id: string, depth: number) => {
            flash(`[data-node="${id}"]`);
            for (const e of net.edges) {
                if (e.from !== id) continue;
                if (rand() > 0.82 - depth * 0.04) continue;
                const delay = 420 + rand() * 520;
                timers.push(setTimeout(() => flash(`[data-edge="${e.id}"]`), delay * 0.15));
                timers.push(setTimeout(() => fire(e.to, depth + 1), delay));
            }
        };
        const start = () => {
            const sources = net.nodes.filter((n) => n.col === 0);
            fire(sources[Math.floor(rand() * sources.length)].id, 0);
        };
        start();
        const id = setInterval(start, 5200);
        return () => {
            clearInterval(id);
            timers.forEach(clearTimeout);
        };
    }, [inView, reduce, net]);

    const byId = (id: string) => net.nodes.find((n) => n.id === id)!;
    return (
        <div ref={ref} className="net">
            <svg ref={svgRef} className="net__svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Illustrative network: an event at a supplier propagating through materials and processes to components and programmes.">
                {COLUMNS.map((c, i) => (
                    <text key={c} className="net__col" x={90 + i * 255} y="22" textAnchor="middle">
                        {c}
                    </text>
                ))}
                {net.edges.map((e) => {
                    const a = byId(e.from);
                    const b = byId(e.to);
                    const mx = (a.x + b.x) / 2;
                    return (
                        <path
                            key={e.id}
                            data-edge={e.id}
                            className="net__edge"
                            d={`M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`}
                        />
                    );
                })}
                {net.nodes.map((n) => (
                    <g key={n.id} data-node={n.id} className="net__node">
                        <circle className="net__halo" cx={n.x} cy={n.y} r="22" />
                        <circle className="net__dot" cx={n.x} cy={n.y} r="7" />
                    </g>
                ))}
            </svg>
        </div>
    );
}

export default function Roadmap({ n = '02' }: { n?: string }) {
    return (
        <section id="roadmap" className="sec roadmap" data-theme="navy" data-nav="navy" aria-labelledby="roadmap-title">
            <Rails />
            <Grain />
            <div className="wrap">
                <header className="sec-head rv">
                    <Idx n={n}>Progress</Idx>
                    <h2 id="roadmap-title" className="w-h2">
                        Where PRISM stands, and where it goes.
                    </h2>
                    <p className="w-lead">
                        We would rather show you what is done and what is not. Then two directions: new kinds of
                        material, and the same tools applied to supply chains.
                    </p>
                </header>

                <div className="stands rv" aria-labelledby="stands-title">
                    <h3 id="stands-title" className="w-h3">
                        Where it stands
                    </h3>
                    <div className="stands__cols">
                        <div>
                            <p className="w-label">Done so far</p>
                            <ul>
                                <li>
                                    Our first alloys from early screening have been made as real metal (Project SPARK).
                                    We are still testing them. Two or three look promising.
                                </li>
                                <li>ESA has awarded PRISM Alpha, a project to run the full loop for European space transport.</li>
                                <li>Our first privately funded project, for PFAS‑free polymers, is signed.</li>
                                <li>PRISM won the AI special prize (KI‑Sonderpreis) at Hessen Ideen 2026.</li>
                            </ul>
                        </div>
                        <div>
                            <p className="w-label">Still to prove</p>
                            <ul>
                                <li>One full loop, from requirement to test results. That is PRISM Alpha’s job.</li>
                                <li>Robots making samples and software driving the instruments, on a real line.</li>
                                <li>A material taken from test sample to real part, with the evidence certification needs.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="branches rv">
                    {BRANCHES.map((b) => (
                        <div key={b.name} className="branch">
                            <h3 className="branch__name">{b.name}</h3>
                            <p className="branch__text">{b.text}</p>
                            <ol className="track">
                                {b.items.map((it) => (
                                    <li key={it.title} className="track__item" data-state={it.state}>
                                        <span className="w-label">{it.status}</span>
                                        <strong>{it.title}</strong>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    ))}
                </div>

                <figure className="roadmap__net rv">
                    <EventNetwork />
                    <figcaption>
                        <SourceLine label="Illustrative">
                            How a change at one supplier spreads to the programmes that depend on it. Method adapted from
                            Okawa et al., “Dynamic Hawkes Processes for Discovering Time-evolving Communities”, KDD 2021.
                        </SourceLine>
                    </figcaption>
                </figure>

                <p className="roadmap__close rv">
                    Different uses, one rule: every claim keeps its source and says how sure it is.
                </p>
            </div>
        </section>
    );
}
