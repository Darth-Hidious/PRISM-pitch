import { useEffect, useRef, useState } from 'react';
import { LivePainting, MaturityPill } from '../ds';
import type { LiveScene } from '../ds/livepaint';
import type { Maturity } from '../ds/MaturityPill';
import { useMediaQuery } from './hooks';
import { couponScene, melterScene, millScene, polisherScene, researchScene } from './scenes';
import { Grain, Idx } from './ui';

interface Layer {
    name: string;
    detail: string;
    maturity: Maturity;
}

interface StackDef {
    id: string;
    name: string;
    short: string;
    question: string;
    lead: string;
    answer: string;
    limit: string;
    layers: Layer[];
    art: { scene: LiveScene; photo: string; alt: string; caption: string };
}

const STACKS: StackDef[] = [
    {
        id: 'research',
        name: 'Research stack',
        short: 'Research',
        question: 'Out of millions of possible mixes, which are worth making?',
        lead: 'A short list, ranked, with how sure we are.',
        answer: 'AI suggests ideas from the whole range. Physics simulations throw out what cannot work, before any powder is weighed.',
        limit: 'It cannot see what a real machine will do to the alloy. The manufacturing stack checks that.',
        layers: [
            {
                name: 'Knowledge graph',
                detail: 'Papers, patents and lab data in one connected map, each with its source. It suggests new leads when a search gets stuck.',
                maturity: 'prototype',
            },
            {
                name: 'Idea generator',
                detail: 'AI that suggests new mixes, only ones that are physically possible.',
                maturity: 'prototype',
            },
            {
                name: 'Physics filter',
                detail: 'Fast AI simulations first, then slower, exact ones. Most ideas fail here, where failing is cheap.',
                maturity: 'prototype',
            },
            {
                name: 'Smart experiment choice',
                detail: 'Each experiment is picked for what it will teach us, not to test everything.',
                maturity: 'prototype',
            },
            {
                name: 'Safe settings',
                detail: 'We look for a range of settings that works when powder and machine vary, not one perfect recipe.',
                maturity: 'prototype',
            },
        ],
        art: {
            scene: researchScene,
            photo: '/img/search-manifold.webp',
            alt: 'Painted rendering of a materials search landscape: basins, measured points lighting up, and a red path walking down to the best point.',
            caption: 'Illustrative search landscape, repainted and animated in code.',
        },
    },
    {
        id: 'harness',
        name: 'Harness stack',
        short: 'Harness',
        question: 'Who runs the work between the AI models?',
        lead: 'The harness.',
        answer: 'AI models only suggest. The harness plans each round, runs the tools, scores the results and remembers what failed. So each round starts where the last one stopped.',
        limit: 'It never makes the final call. A named engineer signs off everything that leaves the loop.',
        layers: [
            {
                name: 'Planner',
                detail: 'Plans each round: what to try next, based on the last results.',
                maturity: 'prototype',
            },
            {
                name: 'Playbooks',
                detail: 'What every round learned, kept for the next one. Failures included.',
                maturity: 'prototype',
            },
            {
                name: 'Tool connections',
                detail: 'One way in to simulations, computers, lab instruments and factory data.',
                maturity: 'prototype',
            },
            {
                name: 'Scorer',
                detail: 'Scores every result against the requirement: quick estimates first, then physics, then real tests.',
                maturity: 'prototype',
            },
            {
                name: 'Human sign-off',
                detail: 'AI suggests; engineers decide. Ideas without a source are rejected, and a named expert approves what leaves the loop.',
                maturity: 'prototype',
            },
        ],
        art: {
            scene: millScene,
            photo: '/img/spark-mill.webp',
            alt: 'Painted from a photograph of a planetary ball mill preparing alloy powder in the Project SPARK laboratory.',
            caption: 'Planetary ball mill, Project SPARK. Photograph repainted in code.',
        },
    },
    {
        id: 'autonomy',
        name: 'Autonomy stack',
        short: 'Autonomy',
        question: 'How do experiments stop being the slow part?',
        lead: 'Robots do the repetitive steps. People stay in charge.',
        answer: 'Making and measuring a sample by hand takes days, and data gets lost between machines. Here robots weigh and heat, instruments measure on the spot, and the data flows straight back.',
        limit: 'Most of this is still being built. Turning ideas into lab recipes works as a prototype today.',
        layers: [
            {
                name: 'Recipe writer',
                detail: 'Turns each idea into steps a lab can run: ingredients, temperatures and timings.',
                maturity: 'prototype',
            },
            {
                name: 'Robot lab',
                detail: 'Robot arms weigh out powder and move samples through the furnace.',
                maturity: 'development',
            },
            {
                name: 'Automatic measurement',
                detail: 'X-ray patterns taken on the spot, and AI that reads what has formed.',
                maturity: 'development',
            },
            {
                name: 'Probes',
                detail: 'Our own sensors, which record calibrated data right at the machine.',
                maturity: 'development',
            },
            {
                name: 'Machine control',
                detail: 'Software drives the instruments directly, so the loop does not wait for a person.',
                maturity: 'development',
            },
            {
                name: 'Field robots',
                detail: 'The same autonomy outside the lab: rugged robots that find their way without GPS. Built for civil and defence use.',
                maturity: 'development',
            },
        ],
        art: {
            scene: melterScene,
            photo: '/img/spark-melter.webp',
            alt: 'Painted from a photograph of the melting equipment used in Project SPARK: a control cabinet beside a tall melting chamber.',
            caption: 'Melting equipment, Project SPARK. Photograph repainted in code.',
        },
    },
    {
        id: 'manufacturing',
        name: 'Manufacturing and test stack',
        short: 'Manufacturing and test',
        question: 'Can it really be made? Does it hold up?',
        lead: 'Only a real test can say.',
        answer: 'A recipe is not a material until it has been made and tested. That is where most computer-designed materials stop. We melt and 3D-print the best ideas, then test them against the requirement.',
        limit: 'A test sample is not a finished part. Certification is the goal, not a claim.',
        layers: [
            {
                name: 'Powder and melting',
                detail: 'Preparing new alloys and melting them in a vacuum-arc furnace.',
                maturity: 'in-use',
            },
            {
                name: 'Printability check',
                detail: 'Checks whether an alloy can be 3D-printed before a build is started.',
                maturity: 'prototype',
            },
            {
                name: 'Metal 3D printing',
                detail: 'Industrial laser printing from metal powder, with the safe settings mapped for each lead idea.',
                maturity: 'in-use',
            },
            {
                name: 'Testing',
                detail: 'Density, inner structure and X-ray scans first, then strength and heat tests against the requirement.',
                maturity: 'in-use',
            },
            {
                name: 'Certification file',
                detail: 'The evidence your certification process needs, to go from test sample to real part.',
                maturity: 'target',
            },
        ],
        art: {
            scene: couponScene,
            photo: '/img/spark-coupon.webp',
            alt: 'Painted from a photograph of a polished alloy sample held in a hand in the laboratory, light moving across its face.',
            caption: 'Alloy sample from Project SPARK, repainted and animated in code.',
        },
    },
    {
        id: 'evidence-stack',
        name: 'Evidence stack',
        short: 'Evidence',
        question: 'Where did this result come from, and who may see it?',
        lead: 'Every result carries its source, its owner and its rules.',
        answer: 'Partners only share data they control. Engineers only trust results they can trace. So every requirement, design, sample, test and decision is linked, like a family tree.',
        limit: 'Tracing and export labels work today. Automatic enforcement of sharing rules is being built.',
        layers: [
            {
                name: 'Traceability',
                detail: 'Every result records what went in: data, code and model versions. Anyone can check and repeat it.',
                maturity: 'in-use',
            },
            {
                name: 'Linked records',
                detail: 'Requirements, designs, builds, samples, tests and decisions, linked together instead of scattered in files.',
                maturity: 'prototype',
            },
            {
                name: 'Data rights',
                detail: 'Each piece of data carries its owner and what it may be used for. Anything made from it keeps the same rules.',
                maturity: 'development',
            },
            {
                name: 'Controlled sharing',
                detail: 'Nothing is shared by accident. Every release is signed and names who may see it.',
                maturity: 'development',
            },
            {
                name: 'Export control',
                detail: 'Export rules recorded on every deliverable today. Checked automatically, every time data leaves, next.',
                maturity: 'in-use',
            },
        ],
        art: {
            scene: polisherScene,
            photo: '/img/spark-polisher.webp',
            alt: 'Painted from a photograph of a polishing machine that prepares samples for inspection in the Project SPARK laboratory.',
            caption: 'Sample polishing for inspection, Project SPARK. Photograph repainted in code.',
        },
    },
];

/* ── Isometric stack ──────────────────────────────────────────────────── */

const PLATE_W = 300;
const PLATE_H = 150;
const THICK = 12;
const GAP = 76;

/** Five plates, Research on top and Evidence as the foundation. */
function IsoStack({
    active,
    onPick,
    compact = false,
}: {
    active: number;
    onPick?: (i: number) => void;
    compact?: boolean;
}) {
    const cx = PLATE_W / 2 + 10;
    const top = PLATE_H / 2 + 26;
    const height = top + GAP * (STACKS.length - 1) + PLATE_H / 2 + THICK + 30;
    const width = compact ? PLATE_W + 20 : PLATE_W + 250;
    return (
        <svg
            className={`iso${compact ? ' iso--compact' : ''}`}
            viewBox={`0 0 ${width} ${height}`}
            role={compact ? undefined : 'img'}
            aria-hidden={compact ? true : undefined}
            aria-label={compact ? undefined : 'The five PRISM stacks as layers: Research, Harness, Autonomy, Manufacturing and test, and Evidence as the foundation.'}
        >
            {STACKS.map((_, k) => {
                // Draw from the bottom plate up so upper plates overlap lower ones.
                const i = STACKS.length - 1 - k;
                const st = STACKS[i];
                const cy = top + i * GAP;
                const on = i === active;
                const w2 = PLATE_W / 2;
                const h2 = PLATE_H / 2;
                const topFace = `${cx},${cy - h2} ${cx + w2},${cy} ${cx},${cy + h2} ${cx - w2},${cy}`;
                const left = `${cx - w2},${cy} ${cx},${cy + h2} ${cx},${cy + h2 + THICK} ${cx - w2},${cy + THICK}`;
                const right = `${cx},${cy + h2} ${cx + w2},${cy} ${cx + w2},${cy + THICK} ${cx},${cy + h2 + THICK}`;
                const grid = [];
                for (let g = 1; g < 6; g++) {
                    const f = g / 6;
                    grid.push(
                        <line key={`a${g}`} x1={cx - w2 + w2 * f} y1={cy - h2 * f} x2={cx + w2 * f} y2={cy + h2 - h2 * f} />,
                        <line key={`b${g}`} x1={cx + w2 - w2 * f} y1={cy - h2 * f} x2={cx - w2 * f} y2={cy + h2 - h2 * f} />,
                    );
                }
                return (
                    <g
                        key={st.id}
                        className={`iso__plate${on ? ' is-on' : ''}`}
                        onClick={onPick ? () => onPick(i) : undefined}
                    >
                        <polygon className="iso__side iso__side--l" points={left} />
                        <polygon className="iso__side iso__side--r" points={right} />
                        <polygon className="iso__top" points={topFace} />
                        <g className="iso__grid">{grid}</g>
                        {!compact && (
                            <g className="iso__label">
                                <line x1={cx + w2 + 6} y1={cy} x2={cx + w2 + 44} y2={cy} />
                                <text className="iso__num" x={cx + w2 + 54} y={cy - 6}>
                                    {String(i + 1).padStart(2, '0')}
                                </text>
                                <text className="iso__name" x={cx + w2 + 54} y={cy + 16}>
                                    {st.short}
                                </text>
                            </g>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}

/* ── Chapters ─────────────────────────────────────────────────────────── */

function StackPainting({ stack, className }: { stack: StackDef; className?: string }) {
    const { art } = stack;
    return <LivePainting className={className} scene={art.scene} alt={art.alt} fallback={{ src: art.photo, motion: 0.4 }} />;
}

function Chapter({ stack, index, inline }: { stack: StackDef; index: number; inline: boolean }) {
    return (
        <article id={stack.id} className="chapter" data-index={index} aria-labelledby={`${stack.id}-title`}>
            {inline && (
                <figure className="chapter__media">
                    <StackPainting stack={stack} />
                    <figcaption>{stack.art.caption}</figcaption>
                </figure>
            )}
            <p className="w-label chapter__index">
                Stack {String(index + 1).padStart(2, '0')} / {String(STACKS.length).padStart(2, '0')}
            </p>
            <h3 id={`${stack.id}-title`} className="chapter__name">
                {stack.name}
            </h3>
            <p className="q chapter__q">{stack.question}</p>
            <p className="a chapter__a">
                <b>{stack.lead}</b> {stack.answer}
            </p>
            <ol className="layers" aria-label={`${stack.name} layers`}>
                {stack.layers.map((l, k) => (
                    <li key={l.name}>
                        <span className="layers__num">{String(k + 1).padStart(2, '0')}</span>
                        <div>
                            <strong>{l.name}</strong>
                            <span>{l.detail}</span>
                        </div>
                        <MaturityPill maturity={l.maturity} />
                    </li>
                ))}
            </ol>
            <p className="limit">
                <span className="w-label">Limit</span>
                {stack.limit}
            </p>
        </article>
    );
}

export default function Stacks() {
    const wide = useMediaQuery('(min-width: 1024px)');
    const [active, setActive] = useState(0);
    const chaptersRef = useRef<HTMLDivElement>(null);

    // The chapter crossing the middle of the viewport is the active one.
    useEffect(() => {
        const root = chaptersRef.current;
        if (!root) return;
        const io = new IntersectionObserver(
            (entries) => {
                for (const e of entries) {
                    if (!e.isIntersecting) continue;
                    setActive(Number((e.target as HTMLElement).dataset.index));
                }
            },
            { rootMargin: '-50% 0px -50% 0px' },
        );
        root.querySelectorAll('.chapter').forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, [wide]);

    const goTo = (i: number) => document.getElementById(STACKS[i].id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    return (
        <section id="platform" className="stacks" data-theme="navy" data-nav="navy" aria-labelledby="platform-title">
            <Grain />
            <div className="wrap sec stacks__intro">
                <header className="stacks__head rv">
                    <Idx n="03">The platform</Idx>
                    <h2 id="platform-title" className="w-h2">
                        Five stacks. One system.
                    </h2>
                    <p className="w-lead">
                        PRISM is built in five layers, called stacks. Each does one job, from finding ideas to proving
                        results. Every part is labelled with how ready it is, because we would rather show you than
                        oversell.
                    </p>
                    <ul className="stacks__legend" aria-label="Maturity">
                        <li>
                            <MaturityPill maturity="in-use" /> Used in our projects today
                        </li>
                        <li>
                            <MaturityPill maturity="prototype" /> Working, being improved
                        </li>
                        <li>
                            <MaturityPill maturity="development" /> Being built
                        </li>
                        <li>
                            <MaturityPill maturity="target" /> The goal
                        </li>
                    </ul>
                </header>
                <div className="stacks__iso rv">
                    <IsoStack active={active} onPick={goTo} />
                </div>
            </div>

            <div className={`explorer${wide ? ' explorer--wide' : ''}`}>
                {wide && (
                    <div className="explorer__media">
                        {/* One painting: moving between stacks dissolves it to noise and resolves the next. */}
                        <StackPainting stack={STACKS[active]} className="explorer__art is-on" />
                        <div className="explorer__shade" aria-hidden="true" />
                        <div className="explorer__hud">
                            <IsoStack active={active} compact />
                            <div>
                                <p className="w-label">
                                    Stack {String(active + 1).padStart(2, '0')} / {String(STACKS.length).padStart(2, '0')}
                                </p>
                                <p className="explorer__hud-name">{STACKS[active].short}</p>
                                <p className="explorer__caption">{STACKS[active].art.caption}</p>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chaptersRef} className="explorer__chapters">
                    {STACKS.map((s, i) => (
                        <Chapter key={s.id} stack={s} index={i} inline={!wide} />
                    ))}
                </div>
            </div>
        </section>
    );
}
