import { useEffect, useRef, useState } from 'react';
import { MaturityPill } from '../ds';
import type { Maturity } from '../ds/MaturityPill';
import { ProcedureDiagram } from './diagrams';
import { Glyph, type GlyphName } from './glyphs';
import { useInView, useReducedMotion } from './hooks';
import { Idx, Words } from './ui';

interface Step {
    name: string;
    glyph: GlyphName;
    question: string;
    lead: string;
    text: string;
    stack: string;
    maturity: Maturity;
}

const STEPS: Step[] = [
    {
        name: 'Requirement',
        glyph: 'target',
        question: 'What must the part survive?',
        lead: 'You tell us',
        text: 'the heat and loads the part faces, and the material it has to beat.',
        stack: 'Evidence stack',
        maturity: 'prototype',
    },
    {
        name: 'Design',
        glyph: 'lattice',
        question: 'What could work?',
        lead: 'AI proposes',
        text: 'candidate mixes from the whole range of possibilities.',
        stack: 'Research stack',
        maturity: 'prototype',
    },
    {
        name: 'Screen',
        glyph: 'funnel',
        question: 'What survives the physics?',
        lead: 'Simulations rule out',
        text: 'most ideas before anything is melted.',
        stack: 'Research stack',
        maturity: 'prototype',
    },
    {
        name: 'Make',
        glyph: 'flame',
        question: 'Can it be made, and made again?',
        lead: 'We melt and 3D-print',
        text: 'the best candidates.',
        stack: 'Manufacturing and test stack',
        maturity: 'in-use',
    },
    {
        name: 'Test',
        glyph: 'gauge',
        question: 'Does it meet the requirement?',
        lead: 'We measure',
        text: 'each sample against your targets.',
        stack: 'Manufacturing and test stack',
        maturity: 'in-use',
    },
    {
        name: 'Learn',
        glyph: 'cycle',
        question: 'What should we try next?',
        lead: 'Every result',
        text: 'goes back into the models and decides what we try next.',
        stack: 'Harness stack',
        maturity: 'prototype',
    },
];


/* ── Phones: the loop as a ring that turns as you scroll ──────────────── */

/** Where the ring shows: the screens that have no room for the drawing, when motion is welcome. */
const RING_MQ = '((max-width: 760px) or ((max-height: 500px) and (min-aspect-ratio: 1 / 1))) and (prefers-reduced-motion: no-preference)';
const CX = 200;
const CY = 180;
const R = 112;
/** Design, Screen, Make, Test and Learn go round the ring; the requirement sits in the middle. */
const ROUND = STEPS.slice(1);
const at = (k: number, r = R) => {
    const a = ((-90 + k * 72) * Math.PI) / 180;
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a), c: Math.cos(a), s: Math.sin(a) };
};
const CIRC = 2 * Math.PI * R;

/**
 * The section holds still while scrolling takes it round: first the requirement lights in the middle,
 * then a light travels from Design to Learn and back to Design, and the step it reaches is spelled
 * out below. With reduced motion, phones get the plain list instead.
 */
function LoopRing() {
    const pin = useRef<HTMLDivElement>(null);
    const stage = useRef<HTMLDivElement>(null);
    const arc = useRef<SVGCircleElement>(null);
    const head = useRef<SVGGElement>(null);
    const nodes = useRef<(SVGGElement | null)[]>([]);
    const middle = useRef<SVGGElement>(null);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const p = pin.current;
        const st = stage.current;
        if (!p || !st) return;
        const mq = window.matchMedia(RING_MQ);
        let raf = 0;
        let shown = -1;

        const update = () => {
            raf = 0;
            if (!mq.matches) return;
            const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0;
            const r = p.getBoundingClientRect();
            const room = Math.max(1, r.height - st.getBoundingClientRect().height);
            const t = Math.min(1, Math.max(0, (nav - r.top) / room));
            // Six equal parts: the requirement, then one for each station round the ring.
            const now = Math.min(STEPS.length - 1, Math.floor(t * STEPS.length));
            const q = Math.min(ROUND.length, Math.max(0, t * STEPS.length - 1));
            arc.current?.setAttribute('stroke-dashoffset', (CIRC * (1 - q / ROUND.length)).toFixed(1));
            const h = at(q);
            head.current?.setAttribute('transform', `translate(${h.x.toFixed(1)} ${h.y.toFixed(1)})`);
            head.current?.classList.toggle('is-on', q > 0.001);
            nodes.current.forEach((n, k) => n?.classList.toggle('is-on', q >= k - 0.001 && t * STEPS.length >= 1));
            nodes.current.forEach((n, k) => n?.classList.toggle('is-now', now === k + 1));
            middle.current?.classList.toggle('is-now', now === 0);
            if (now !== shown) {
                shown = now;
                setStep(now);
            }
        };
        const schedule = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };
        // The section is as tall as the stage plus half a screen for each step.
        const measure = () => {
            if (!mq.matches) {
                p.style.height = '';
                return;
            }
            p.style.height = `${Math.round(st.getBoundingClientRect().height + STEPS.length * 0.5 * window.innerHeight)}px`;
            schedule();
        };
        const ro = new ResizeObserver(measure);
        ro.observe(st);
        mq.addEventListener('change', measure);
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', measure);
        measure();
        return () => {
            ro.disconnect();
            mq.removeEventListener('change', measure);
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', measure);
            cancelAnimationFrame(raf);
        };
    }, []);

    const s = STEPS[step];
    return (
        <div ref={pin} className="loopring">
            <div ref={stage} className="loopring__stage">
                <p className="loopring__step">
                    <span className="loopring__num">
                        {String(step + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
                    </span>
                    <b>{s.name}</b>
                    <MaturityPill maturity={s.maturity} />
                </p>
                <svg className="loopring__svg" viewBox="0 0 400 360" role="img" aria-label="The PRISM loop: your requirement in the middle; design, screen, make, test and learn around it, and round again.">
                    <circle className="loopring__track" cx={CX} cy={CY} r={R} />
                    <circle
                        ref={arc}
                        className="loopring__arc"
                        cx={CX}
                        cy={CY}
                        r={R}
                        strokeDasharray={CIRC.toFixed(1)}
                        strokeDashoffset={CIRC.toFixed(1)}
                        transform={`rotate(-90 ${CX} ${CY})`}
                    />
                    {ROUND.map((_, k) => {
                        // Small arrowheads between stations: the loop only goes one way.
                        const m = at(k + 0.5);
                        const deg = -90 + (k + 0.5) * 72 + 90;
                        return <path key={k} className="loopring__tick" d="M-4,-4 L1,0 L-4,4" transform={`translate(${m.x.toFixed(1)} ${m.y.toFixed(1)}) rotate(${deg.toFixed(1)})`} />;
                    })}
                    <g ref={middle} className="loopring__middle">
                        <circle cx={CX} cy={CY} r={50} />
                        <g transform={`translate(${CX - 14} ${CY - 34})`}>
                            <Glyph name="target" className="loopring__glyph" size={28} />
                        </g>
                        <text x={CX} y={CY + 12} textAnchor="middle">
                            Your
                        </text>
                        <text x={CX} y={CY + 25} textAnchor="middle">
                            requirement
                        </text>
                    </g>
                    {ROUND.map((st, k) => {
                        const n = at(k);
                        const l = at(k, R + 36);
                        const anchor = Math.abs(l.c) < 0.3 ? 'middle' : l.c > 0 ? 'start' : 'end';
                        const dy = Math.abs(l.c) < 0.3 ? (l.s < 0 ? -6 : 16) : 5;
                        return (
                            <g
                                key={st.name}
                                ref={(el) => {
                                    nodes.current[k] = el;
                                }}
                                className="loopring__node"
                            >
                                <circle cx={n.x} cy={n.y} r={24} />
                                <g transform={`translate(${(n.x - 11).toFixed(1)} ${(n.y - 11).toFixed(1)})`}>
                                    <Glyph name={st.glyph} className="loopring__glyph" size={22} />
                                </g>
                                <text x={l.x} y={l.y + dy} textAnchor={anchor}>
                                    {st.name}
                                </text>
                            </g>
                        );
                    })}
                    <g ref={head} className="loopring__head" transform={`translate(${at(0).x} ${at(0).y})`}>
                        <circle r={11} className="loopring__halo" />
                        <circle r={5} />
                    </g>
                </svg>
                <p className="loopring__text">
                    <b>{s.lead}</b> {s.text}
                </p>
            </div>
        </div>
    );
}

export default function Loop({ n = '02' }: { n?: string }) {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const [ref, inView] = useInView<HTMLDivElement>('-20% 0px');
    const reduce = useReducedMotion();

    useEffect(() => {
        if (!inView || paused || reduce) return;
        const id = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 4200);
        return () => clearInterval(id);
    }, [inView, paused, reduce]);

    const pick = (i: number) => {
        setActive(i);
        setPaused(true);
    };
    const step = STEPS[active];

    return (
        <section id="loop" className="sec loop" data-theme="paper" data-nav="paper" aria-labelledby="loop-title">
            <div className="wrap">
                <header className="sec-head rv">
                    <Idx n={n}>How it works</Idx>
                    <h2 id="loop-title" className="w-h2">
                        <Words>Every result feeds the next design.</Words>
                    </h2>
                </header>
                <div ref={ref} className="loop__body rv">
                    {/* Phones: a ring that turns as you scroll; with reduced motion, every step in a list. */}
                    <LoopRing />
                    <ol className="loop__list">
                        {STEPS.map((s, i) => (
                            <li key={s.name} className={i === active ? 'is-on' : undefined}>
                                <span className="loop__list-num">{String(i + 1).padStart(2, '0')}</span>
                                <div>
                                    <p className="loop__list-name">
                                        {s.name} <MaturityPill maturity={s.maturity} />
                                    </p>
                                    <p className="loop__list-text">
                                        <b>{s.lead}</b> {s.text}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>
                    <figure className="loop__figure">
                        <div className="drawing">
                            <ProcedureDiagram active={active} onPick={pick} />
                        </div>
                    </figure>
                    <div className="loop__panel">
                        <div className="loop__tabs" role="tablist" aria-label="Steps of the loop">
                            {STEPS.map((s, i) => (
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
                            <div className="loop__detail-q" key={active}>
                                <p className="q">{step.question}</p>
                                <p className="a">
                                    <b>{step.lead}</b> {step.text}
                                </p>
                            </div>
                            <div className="loop__detail-meta">
                                <MaturityPill maturity={step.maturity} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
