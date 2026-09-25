import { useEffect, useState } from 'react';
import { MaturityPill } from '../ds';
import type { Maturity } from '../ds/MaturityPill';
import { ProcedureDiagram } from './diagrams';
import { useInView, useReducedMotion } from './hooks';
import { Idx } from './ui';

interface Step {
    name: string;
    question: string;
    lead: string;
    text: string;
    stack: string;
    maturity: Maturity;
}

const STEPS: Step[] = [
    {
        name: 'Requirement',
        question: 'What must the part survive?',
        lead: 'You tell us.',
        text: 'How hot, what loads, how it will be made, and the material it has to beat. Every idea is scored against this.',
        stack: 'Evidence stack',
        maturity: 'prototype',
    },
    {
        name: 'Design',
        question: 'What could work?',
        lead: 'AI suggests ideas.',
        text: 'It searches the whole range of possible mixes, not only the well-known ones.',
        stack: 'Research stack',
        maturity: 'prototype',
    },
    {
        name: 'Screen',
        question: 'What survives the physics?',
        lead: 'Most ideas stop here.',
        text: 'Fast simulations throw out what cannot work, long before anything is melted.',
        stack: 'Research stack',
        maturity: 'prototype',
    },
    {
        name: 'Make',
        question: 'Can it be made, and made again?',
        lead: 'Real machines make it.',
        text: 'We melt and 3D-print the best ideas, with settings that still work when the machine drifts.',
        stack: 'Manufacturing and test stack',
        maturity: 'in-use',
    },
    {
        name: 'Test',
        question: 'Does it meet the requirement?',
        lead: 'The test sample answers.',
        text: 'We measure density, inner structure and strength, and compare them with your targets.',
        stack: 'Manufacturing and test stack',
        maturity: 'in-use',
    },
    {
        name: 'Learn',
        question: 'What should we try next?',
        lead: 'Whatever teaches us the most.',
        text: 'Every result, good or bad, goes back into the models. They pick the next experiment.',
        stack: 'Harness stack',
        maturity: 'prototype',
    },
];

export default function Loop() {
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
                    <Idx n="02">How it works</Idx>
                    <h2 id="loop-title" className="w-h2">
                        One loop: design, make, test, learn.
                    </h2>
                    <p className="w-lead">
                        <b>Can AI design a material? It can suggest one.</b> The material still has to be made and
                        tested. PRISM runs all of it as one loop, and every round teaches the next.
                    </p>
                </header>
                <div ref={ref} className="loop__body rv">
                    <figure className="loop__figure">
                        <div className="scroll-x">
                            <ProcedureDiagram active={active} onPick={pick} />
                        </div>
                        <figcaption className="fig-cap">The loop, drawn for this site. Tap a step to read it.</figcaption>
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
                                <span className="w-label">{step.stack}</span>
                                <MaturityPill maturity={step.maturity} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
