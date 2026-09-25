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
        lead: 'The requirement comes first.',
        text: 'You state the environment, the loads, the process route and the material to beat. PRISM turns that into a requirement every candidate is scored against.',
        stack: 'Evidence stack',
        maturity: 'prototype',
    },
    {
        name: 'Design',
        question: 'What could work?',
        lead: 'Candidates from the whole space.',
        text: 'Generative models propose compositions across the design space, not only the corners that are already published.',
        stack: 'Research stack',
        maturity: 'prototype',
    },
    {
        name: 'Screen',
        question: 'What survives the physics?',
        lead: 'Most candidates stop here.',
        text: 'Learned potentials first, then first principles and thermodynamics, then a manufacturability index, all before any powder is weighed.',
        stack: 'Research stack',
        maturity: 'prototype',
    },
    {
        name: 'Make',
        question: 'Can it be made, and made again?',
        lead: 'Inside a window, not on a point.',
        text: 'The survivors are melted and printed in industrial processes, at settings that hold when the machine drifts.',
        stack: 'Manufacturing and test stack',
        maturity: 'in-use',
    },
    {
        name: 'Test',
        question: 'Does it meet the requirement?',
        lead: 'The coupon answers.',
        text: 'Density, microstructure and property tests turn each candidate into evidence, measured against the requirement.',
        stack: 'Manufacturing and test stack',
        maturity: 'in-use',
    },
    {
        name: 'Learn',
        question: 'What should we try next?',
        lead: 'Whatever teaches the most.',
        text: 'Every result, failures included, goes back into the models, and active learning chooses the next experiment.',
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
                        One loop, from requirement to physical evidence.
                    </h2>
                    <p className="w-lead">
                        <b>Can a model design a material? It can propose one.</b> A material still has to pass physics,
                        manufacture and test. PRISM runs all of it as one loop, and every turn makes the next one
                        cheaper.
                    </p>
                </header>
                <div ref={ref} className="loop__body rv">
                    <figure className="loop__figure">
                        <div className="scroll-x">
                            <ProcedureDiagram active={active} onPick={pick} />
                        </div>
                        <figcaption className="fig-cap">The loop, drawn for this site. Select a step to read it.</figcaption>
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
