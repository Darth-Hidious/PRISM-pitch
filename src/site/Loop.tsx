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
        text: 'Heat, loads, and the material it has to beat.',
        stack: 'Evidence stack',
        maturity: 'prototype',
    },
    {
        name: 'Design',
        question: 'What could work?',
        lead: 'AI suggests ideas.',
        text: 'From the whole range of possible mixes.',
        stack: 'Research stack',
        maturity: 'prototype',
    },
    {
        name: 'Screen',
        question: 'What survives the physics?',
        lead: 'Most ideas stop here.',
        text: 'Simulations rule them out before anything is melted.',
        stack: 'Research stack',
        maturity: 'prototype',
    },
    {
        name: 'Make',
        question: 'Can it be made, and made again?',
        lead: 'Real machines make it.',
        text: 'We melt and 3D-print the best ideas.',
        stack: 'Manufacturing and test stack',
        maturity: 'in-use',
    },
    {
        name: 'Test',
        question: 'Does it meet the requirement?',
        lead: 'The sample answers.',
        text: 'We measure it against your targets.',
        stack: 'Manufacturing and test stack',
        maturity: 'in-use',
    },
    {
        name: 'Learn',
        question: 'What should we try next?',
        lead: 'Whatever teaches the most.',
        text: 'Every result goes back into the models.',
        stack: 'Harness stack',
        maturity: 'prototype',
    },
];

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
                        One loop: design, make, test, learn.
                    </h2>
                </header>
                <div ref={ref} className="loop__body rv">
                    <figure className="loop__figure">
                        <div className="scroll-x">
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
