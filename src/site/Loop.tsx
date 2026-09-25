import { useEffect, useState } from 'react';
import { MaturityPill } from '../ds';
import type { Maturity } from '../ds/MaturityPill';
import { useInView, useReducedMotion } from './hooks';
import { Idx } from './ui';

interface Station {
    name: string;
    text: string;
    stack: string;
    maturity: Maturity;
}

/** The loop proper. "Specify" enters it once; "Learn" closes it back into "Design". */
const STATIONS: Station[] = [
    {
        name: 'Design',
        text: 'Generative models propose candidate compositions across the whole design space, not only the corners that are already published.',
        stack: 'Research stack',
        maturity: 'prototype',
    },
    {
        name: 'Screen',
        text: 'Learned potentials, first-principles and thermodynamic checks, then a manufacturability screen. Most candidates fail here, before any powder is weighed.',
        stack: 'Research stack',
        maturity: 'prototype',
    },
    {
        name: 'Make',
        text: 'The survivors are melted, printed and machined in real industrial processes, with robotic synthesis coming into the line.',
        stack: 'Manufacturing and autonomy stacks',
        maturity: 'in-use',
    },
    {
        name: 'Test',
        text: 'Density, microstructure and property tests turn each candidate into physical evidence against the requirement.',
        stack: 'Manufacturing and test stack',
        maturity: 'in-use',
    },
    {
        name: 'Learn',
        text: 'Every result, failures included, goes back into the models, and active learning chooses the next experiment.',
        stack: 'Harness stack',
        maturity: 'prototype',
    },
];

const CX = 400;
const CY = 420;
const R = 250;
const angleOf = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / STATIONS.length;
const mod = (n: number) => ((n % STATIONS.length) + STATIONS.length) % STATIONS.length;
const pos = (i: number, r = R) => [CX + r * Math.cos(angleOf(i)), CY + r * Math.sin(angleOf(i))] as const;

function LoopDiagram({ turn, onPick }: { turn: number; onPick: (i: number) => void }) {
    const active = mod(turn);
    const circ = 2 * Math.PI * R;
    // The arc from the previous station to the active one lights up. `turn` only
    // grows while the loop runs, so the arc always travels forward.
    const arcLen = circ / STATIONS.length;
    const arcOffset = circ * (0.25 - turn / STATIONS.length) + arcLen;
    return (
        <svg className="loop__svg" viewBox="0 0 800 800" role="img" aria-labelledby="loop-svg-title">
            <title id="loop-svg-title">
                The PRISM loop: a requirement enters at Design, then Screen, Make, Test and Learn, which feeds back into
                Design. Evidence sits at the centre, connected to every step.
            </title>
            <defs>
                <radialGradient id="loop-hub" cx="50%" cy="50%" r="50%">
                    <stop offset="0" stopColor="var(--accent-tint)" />
                    <stop offset="1" stopColor="var(--ground)" />
                </radialGradient>
                <marker id="loop-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                    <path d="M1 1 9 5 1 9" fill="none" stroke="var(--ink)" strokeWidth="1.4" />
                </marker>
            </defs>

            {/* Entry: the requirement */}
            <g className="loop__entry">
                <rect x={CX - 88} y="18" width="176" height="44" rx="4" />
                <text x={CX} y="45" textAnchor="middle">
                    Your requirement
                </text>
                <line x1={CX} y1="62" x2={CX} y2={CY - R - 22} markerEnd="url(#loop-arrow)" />
            </g>

            {/* Spokes to the evidence hub */}
            {STATIONS.map((_, i) => {
                const [x1, y1] = pos(i, R - 18);
                const [x2, y2] = pos(i, 104);
                return <line key={i} className={`loop__spoke${i === active ? ' is-on' : ''}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}

            <circle className="loop__ring" cx={CX} cy={CY} r={R} />
            <circle
                className="loop__arc"
                cx={CX}
                cy={CY}
                r={R}
                strokeDasharray={`${arcLen} ${circ - arcLen}`}
                strokeDashoffset={arcOffset}
            />
            <circle className="loop__comet" r="5">
                <animateMotion
                    dur="12s"
                    repeatCount="indefinite"
                    path={`M${CX},${CY - R} A${R},${R} 0 1 1 ${CX},${CY + R} A${R},${R} 0 1 1 ${CX},${CY - R}`}
                />
            </circle>

            <circle className="loop__hub" cx={CX} cy={CY} r="96" fill="url(#loop-hub)" />
            <text className="loop__hub-title" x={CX} y={CY - 6} textAnchor="middle">
                Evidence
            </text>
            <text className="loop__hub-text" x={CX} y={CY + 18} textAnchor="middle">
                on every step
            </text>

            {STATIONS.map((s, i) => {
                const [x, y] = pos(i);
                // The top station's label sits to the right, clear of the entry arrow.
                const [lx, ly] = i === 0 ? [x + 26, y - 22] : pos(i, R + 58);
                const anchor = i === 0 ? 'start' : 'middle';
                const on = i === active;
                return (
                    <g key={s.name} className={`loop__node${on ? ' is-on' : ''}`} onClick={() => onPick(i)}>
                        {on && <circle className="loop__pulse" cx={x} cy={y} r="16" />}
                        <circle className="loop__dot" cx={x} cy={y} r={on ? 13 : 9} />
                        <text className="loop__num" x={lx} y={ly - 12} textAnchor={anchor}>
                            {String(i + 1).padStart(2, '0')}
                        </text>
                        <text className="loop__name" x={lx} y={ly + 14} textAnchor={anchor}>
                            {s.name}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

export default function Loop() {
    const [turn, setTurn] = useState(0);
    const [paused, setPaused] = useState(false);
    const active = mod(turn);
    const [ref, inView] = useInView<HTMLDivElement>('-20% 0px');
    const reduce = useReducedMotion();

    useEffect(() => {
        if (!inView || paused || reduce) return;
        const id = setInterval(() => setTurn((t) => t + 1), 3600);
        return () => clearInterval(id);
    }, [inView, paused, reduce]);

    // Picking a step takes the short way round the ring.
    const pick = (i: number) => {
        setTurn((t) => {
            let d = mod(i - mod(t));
            if (d > STATIONS.length / 2) d -= STATIONS.length;
            return t + d;
        });
        setPaused(true);
    };

    return (
        <section id="loop" className="sec loop" data-theme="paper" data-nav="paper" aria-labelledby="loop-title">
            <div className="wrap">
                <header className="sec-head rv">
                    <Idx n="02">How it works</Idx>
                    <h2 id="loop-title" className="w-h2">
                        One loop, from requirement to physical evidence.
                    </h2>
                    <p className="w-lead">
                        Models can propose. A material still has to pass through physics, manufacture and test. PRISM
                        runs all of it as one loop, and every turn makes the next one cheaper.
                    </p>
                </header>
                <div ref={ref} className="loop__grid rv">
                    <LoopDiagram turn={turn} onPick={pick} />
                    <div className="loop__panel">
                        <div className="loop__tabs" role="tablist" aria-label="Steps of the loop">
                            {STATIONS.map((s, i) => (
                                <button
                                    key={s.name}
                                    type="button"
                                    role="tab"
                                    id={`loop-tab-${i}`}
                                    aria-selected={i === active}
                                    aria-controls="loop-detail"
                                    className="loop__tab"
                                    onClick={() => pick(i)}
                                >
                                    <span className="loop__tab-num">{String(i + 1).padStart(2, '0')}</span>
                                    <span className="loop__tab-name">{s.name}</span>
                                    <span className="loop__tab-bar" aria-hidden="true">
                                        {i === active && !paused && !reduce && inView && <i key={active} />}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <div id="loop-detail" className="loop__detail" role="tabpanel" aria-labelledby={`loop-tab-${active}`}>
                            <p className="loop__detail-text" key={active}>
                                {STATIONS[active].text}
                            </p>
                            <div className="loop__detail-meta">
                                <span className="w-label">{STATIONS[active].stack}</span>
                                <MaturityPill maturity={STATIONS[active].maturity} />
                            </div>
                        </div>
                        <p className="loop__note">
                            At the centre, the evidence layer records every step with its inputs, its owner and its
                            rights. The harness stack plans and runs the loop.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
