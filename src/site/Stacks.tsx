import { useEffect, useRef, useState } from 'react';
import { MaturityPill, Painting } from '../ds';
import type { Maturity } from '../ds/MaturityPill';
import type { PaintOptions } from '../ds/paint';
import { useMediaQuery } from './hooks';
import { autonomyScene, evidenceLineage, harnessLoop } from './illustrations';
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
    promise: string;
    problem: string;
    layers: Layer[];
    art: { src?: string; source?: (w: number, h: number) => HTMLCanvasElement; alt: string; caption: string } & PaintOptions;
}

const STACKS: StackDef[] = [
    {
        id: 'research',
        name: 'Research stack',
        short: 'Research',
        promise: 'Finds the few candidates worth making.',
        problem:
            'The design space for alloys and polymers is effectively infinite, and almost all of it fails in the real world. Screening by intuition and literature takes years.',
        layers: [
            {
                name: 'Materials knowledge graph',
                detail: 'Literature, patents and instrument data in one graph, with provenance. It opens new lines of enquiry when a search stalls.',
                maturity: 'prototype',
            },
            {
                name: 'Generative samplers',
                detail: 'Propose candidate compositions across the whole design space, conditioned on physical feasibility.',
                maturity: 'prototype',
            },
            {
                name: 'Physics funnel',
                detail: 'Learned interatomic potentials first, then first-principles and thermodynamic checks. Most failures happen here, before any powder is weighed.',
                maturity: 'prototype',
            },
            {
                name: 'Active learning',
                detail: 'Each experiment is chosen for what it will teach, not to map the whole space.',
                maturity: 'prototype',
            },
            {
                name: 'Manufacturing window',
                detail: 'The answer is a region that survives real variation in feedstock and machine energy, not a single recipe.',
                maturity: 'prototype',
            },
        ],
        art: {
            src: '/img/search-manifold.webp',
            alt: 'Painted rendering of a materials search landscape: basins, sampled points and the path between experiments.',
            caption: 'Illustrative search landscape, repainted in code.',
            seed: 11,
            direction: -8,
            motion: 0.35,
            focusX: 0.4,
        },
    },
    {
        id: 'harness',
        name: 'Harness stack',
        short: 'Harness',
        promise: 'Runs the science as one system.',
        problem:
            'Models on their own only propose. They do not plan campaigns, call tools, check their own work or remember what failed.',
        layers: [
            {
                name: 'Campaign planner',
                detail: 'Plans each campaign: proposes the next batch, scores the last one and updates the playbook.',
                maturity: 'prototype',
            },
            {
                name: 'Playbooks',
                detail: 'What every campaign learned, kept as reusable context. Failures included.',
                maturity: 'prototype',
            },
            {
                name: 'Tool adapters',
                detail: 'One interface to simulation codes, compute, laboratory instruments and manufacturing data.',
                maturity: 'prototype',
            },
            {
                name: 'Evaluator',
                detail: 'Scores every batch against the requirement: surrogate models, then physics, then physical test.',
                maturity: 'prototype',
            },
            {
                name: 'Sign-off gates',
                detail: 'Models propose; engineers decide. Uncited candidates are rejected, and a named expert approves what leaves the loop.',
                maturity: 'prototype',
            },
        ],
        art: {
            source: harnessLoop,
            alt: 'Painted illustration of the PRISM harness: five stations on a lit loop.',
            caption: 'Illustration drawn and painted in code.',
            seed: 5,
            direction: -20,
            motion: 0.55,
        },
    },
    {
        id: 'autonomy',
        name: 'Autonomy stack',
        short: 'Autonomy',
        promise: 'Takes the human out of the sequence, not out of the loop.',
        problem:
            'Experiments are the bottleneck. Manual synthesis and characterisation take days per sample, and data is lost between instruments.',
        layers: [
            {
                name: 'Recipe translation',
                detail: 'Candidates become executable recipes: precursors, temperatures and thermal profiles.',
                maturity: 'prototype',
            },
            {
                name: 'Robotic synthesis',
                detail: 'Robot arms dose powder and move samples through heating profiles.',
                maturity: 'development',
            },
            {
                name: 'Automated characterisation',
                detail: 'Diffraction patterns captured on the line; phases identified by neural networks against structure databases.',
                maturity: 'development',
            },
            {
                name: 'Probes',
                detail: 'Mirdyne-built instruments that record calibrated, traceable data at the machine itself.',
                maturity: 'development',
            },
            {
                name: 'Instrument control',
                detail: 'Direct control adapters close the loop with no human in the sequence.',
                maturity: 'development',
            },
            {
                name: 'Field autonomy',
                detail: 'The same autonomy outside the lab: rugged robotic platforms with state estimation for GNSS-denied environments. Dual-use by design.',
                maturity: 'development',
            },
        ],
        art: {
            source: autonomyScene,
            alt: 'Painted illustration of a laboratory robot arm lifting a glowing crucible towards a furnace.',
            caption: 'Illustration drawn and painted in code.',
            seed: 23,
            direction: -14,
            motion: 0.5,
        },
    },
    {
        id: 'manufacturing',
        name: 'Manufacturing and test stack',
        short: 'Manufacturing and test',
        promise: 'Turns candidates into parts and physical evidence.',
        problem:
            'A composition is not a material until it survives manufacture and test. That is where most computer-designed materials stop.',
        layers: [
            {
                name: 'Powder and melting',
                detail: 'Alloy preparation and vacuum-arc melting of refractory high-entropy alloys.',
                maturity: 'in-use',
            },
            {
                name: 'Manufacturability index',
                detail: 'Screens candidates for laser powder-bed fusion (LPBF) before a build is committed.',
                maturity: 'prototype',
            },
            {
                name: 'Laser powder-bed fusion',
                detail: 'Industrial LPBF, with the process window mapped for each lead candidate.',
                maturity: 'in-use',
            },
            {
                name: 'Test and characterisation',
                detail: 'Density, metallography and CT, then property and environment tests against the requirement.',
                maturity: 'in-use',
            },
            {
                name: 'Qualification package',
                detail: 'Evidence assembled for your qualification process, so a material can move from coupon to component.',
                maturity: 'target',
            },
        ],
        art: {
            src: '/img/spark-coupon.webp',
            alt: 'Painted rendering of a polished alloy coupon held in a hand in the laboratory.',
            caption: 'Alloy coupon from Project SPARK, repainted in code.',
            seed: 31,
            direction: -24,
            motion: 0.4,
        },
    },
    {
        id: 'evidence-stack',
        name: 'Evidence stack',
        short: 'Evidence',
        promise: 'Keeps every claim provable and every partner in control.',
        problem:
            'Partners will not share data they cannot control, and engineers cannot act on results they cannot trace back to a specimen and a test.',
        layers: [
            {
                name: 'Provenance',
                detail: 'Every result records its inputs, code and model versions. Versioned, reviewed and reproducible.',
                maturity: 'in-use',
            },
            {
                name: 'Materials ontology',
                detail: 'Requirements, compositions, builds, specimens, tests and decisions as linked objects, not files.',
                maturity: 'prototype',
            },
            {
                name: 'Data rights',
                detail: 'Owner, permitted purposes and allowed derivatives travel with each asset and bind everything derived from it.',
                maturity: 'development',
            },
            {
                name: 'Controlled release',
                detail: 'Nothing is declassified implicitly. Every release is signed, sourced and scoped to named parties.',
                maturity: 'development',
            },
            {
                name: 'Export control',
                detail: 'Export classification recorded on every deliverable today; enforced at every exit of the data layer next.',
                maturity: 'in-use',
            },
        ],
        art: {
            source: evidenceLineage,
            alt: 'Painted illustration of an evidence chain running from a requirement to an engineering decision.',
            caption: 'Illustration drawn and painted in code.',
            seed: 43,
            direction: -6,
            motion: 0.3,
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
    return (
        <Painting
            className={className}
            src={art.src}
            source={art.source}
            alt={art.alt}
            seed={art.seed}
            direction={art.direction}
            motion={art.motion}
            focusX={art.focusX}
            focusY={art.focusY}
        />
    );
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
            <p className="w-h3 chapter__promise">{stack.promise}</p>
            <div className="chapter__problem">
                <p className="w-label">The problem it solves</p>
                <p>{stack.problem}</p>
            </div>
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
        </article>
    );
}

export default function Stacks() {
    const wide = useMediaQuery('(min-width: 1024px)');
    const [active, setActive] = useState(0);
    const [mounted, setMounted] = useState<ReadonlySet<number>>(() => new Set([0]));
    const chaptersRef = useRef<HTMLDivElement>(null);

    // The chapter crossing the middle of the viewport is the active one.
    useEffect(() => {
        const root = chaptersRef.current;
        if (!root) return;
        const io = new IntersectionObserver(
            (entries) => {
                for (const e of entries) {
                    if (!e.isIntersecting) continue;
                    const i = Number((e.target as HTMLElement).dataset.index);
                    setActive(i);
                    setMounted((prev) => {
                        if (prev.has(i) && (i + 1 >= STACKS.length || prev.has(i + 1))) return prev;
                        const next = new Set(prev);
                        next.add(i);
                        if (i + 1 < STACKS.length) next.add(i + 1);
                        return next;
                    });
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
                        You bring the requirement. Five stacks carry it through design, orchestration, autonomous
                        experiments, manufacture and test, with the evidence attached at every step. Each layer says
                        how far it has come; we would rather you see the maturity than guess at it.
                    </p>
                    <ul className="stacks__legend" aria-label="Maturity">
                        <li>
                            <MaturityPill maturity="in-use" /> Runs in current programmes
                        </li>
                        <li>
                            <MaturityPill maturity="prototype" /> Working software, being matured
                        </li>
                        <li>
                            <MaturityPill maturity="development" /> Being built
                        </li>
                        <li>
                            <MaturityPill maturity="target" /> Where the platform is going
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
                        {STACKS.map((s, i) =>
                            mounted.has(i) ? (
                                <StackPainting key={s.id} stack={s} className={`explorer__art${i === active ? ' is-on' : ''}`} />
                            ) : null,
                        )}
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
