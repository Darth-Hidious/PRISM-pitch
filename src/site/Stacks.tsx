import type { ReactNode } from 'react';
import { Kicker, MaturityPill, Painting, SourceLine } from '../ds';
import type { Maturity } from '../ds/MaturityPill';
import type { PaintOptions } from '../ds/paint';
import { autonomyScene, evidenceLineage, harnessLoop } from './illustrations';

interface Layer {
    name: string;
    detail: string;
    maturity: Maturity;
}

interface StackDef {
    id: string;
    name: string;
    promise: string;
    problem: string;
    layers: Layer[];
    art: { src?: string; source?: (w: number, h: number) => HTMLCanvasElement; alt: string; caption: string } & PaintOptions;
    footer?: ReactNode;
}

const STACKS: StackDef[] = [
    {
        id: 'research',
        name: 'Research stack',
        promise: 'Finds the few candidates worth making.',
        problem:
            'The design space for alloys and polymers is effectively infinite, and almost all of it fails in the real world. Screening by intuition and literature takes years.',
        layers: [
            {
                name: 'Materials knowledge graph',
                detail: 'Literature, patents and instrument data in one graph. It opens new information-seeking loops when the search stalls.',
                maturity: 'prototype',
            },
            {
                name: 'Generative samplers',
                detail: 'Propose compositions across the whole design space, conditioned on thermodynamic feasibility, reaching metastable alloys that equilibrium screening excludes.',
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
        },
    },
    {
        id: 'harness',
        name: 'Harness stack',
        promise: 'Runs the science as one system.',
        problem:
            'Models on their own only propose. They do not plan campaigns, call tools, check their own work or remember what failed.',
        layers: [
            {
                name: 'Campaign planner',
                detail: 'A generator proposes the next batch, a reflector scores the last one, a curator updates the playbook.',
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
                detail: 'Language models propose; engineers decide. Uncited candidates are rejected and a named expert approves what leaves the loop.',
                maturity: 'in-use',
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
                detail: 'Mirdyne-built instrumentation that records calibrated, traceable data at the machine itself.',
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
        promise: 'Turns candidates into parts and physical evidence.',
        problem:
            'A composition is not a material until it survives manufacture and test. That is where most computer-designed materials stop.',
        layers: [
            {
                name: 'Powder and melting',
                detail: 'Alloy preparation and vacuum-arc melting, proven on Project SPARK’s refractory high-entropy alloys.',
                maturity: 'in-use',
            },
            {
                name: 'Manufacturability index',
                detail: 'A laser powder-bed fusion (LPBF) index built with Fraunhofer IAPT screens candidates before a build is committed.',
                maturity: 'prototype',
            },
            {
                name: 'Laser powder-bed fusion',
                detail: 'Process windows calibrated with Fraunhofer IAPT; industrial synthesis on Bimo Tech lines.',
                maturity: 'in-use',
            },
            {
                name: 'Test and characterisation',
                detail: 'Density, metallography and CT on every build. Oxygen-compatibility testing of coupons within PRISM Alpha.',
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
            alt: 'Painted rendering of a polished alloy coupon held in a hand in the Project SPARK laboratory.',
            caption: 'Project SPARK coupon, repainted in code.',
            seed: 31,
            direction: -24,
            motion: 0.4,
        },
    },
    {
        id: 'evidence-stack',
        name: 'Evidence stack',
        promise: 'Keeps every claim provable and every partner in control.',
        problem:
            'Partners will not share data they cannot control, and engineers cannot act on results they cannot trace back to a specimen and a test.',
        layers: [
            {
                name: 'Provenance',
                detail: 'Every result records its inputs, code and model versions. Versioned, peer-reviewed and reproducible.',
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
                detail: 'Classification on every deliverable today; enforced at every exit of the data layer next.',
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
        footer: (
            <a className="pm-btn pm-btn--link" href="#evidence">
                <span>See the evidence architecture</span>
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M2.5 8h10M9 4.5 12.5 8 9 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
                </svg>
            </a>
        ),
    },
];

function StackRow({ stack, index }: { stack: StackDef; index: number }) {
    const { art } = stack;
    return (
        <article id={stack.id} className={`stack-row reveal${index % 2 ? ' stack-row--flip' : ''}`}>
            <figure className="stack-row__media">
                <Painting
                    src={art.src}
                    source={art.source}
                    alt={art.alt}
                    seed={art.seed}
                    direction={art.direction}
                    motion={art.motion}
                />
                <figcaption className="stack-row__caption">{art.caption}</figcaption>
            </figure>
            <div className="stack-row__body">
                <p className="pm-data-label stack-row__index">
                    Stack {String(index + 1).padStart(2, '0')} · {stack.name}
                </p>
                <h3 className="pm-subtitle">{stack.promise}</h3>
                <div className="stack-row__problem">
                    <p className="pm-column">Problem it solves</p>
                    <p className="pm-body">{stack.problem}</p>
                </div>
                <ol className="stack-layers" aria-label={`${stack.name} layers`}>
                    {stack.layers.map((l) => (
                        <li key={l.name}>
                            <div>
                                <strong>{l.name}</strong>
                                <span>{l.detail}</span>
                            </div>
                            <MaturityPill maturity={l.maturity} />
                        </li>
                    ))}
                </ol>
                {stack.footer}
            </div>
        </article>
    );
}

export default function Stacks() {
    return (
        <section id="platform" className="section" aria-labelledby="platform-title">
            <div className="site-container">
                <header className="section-head reveal">
                    <Kicker>02 · The platform</Kicker>
                    <h2 id="platform-title" className="pm-title">
                        Five stacks. One system, from requirement to qualified part.
                    </h2>
                    <div className="stacks-intro">
                        <p className="pm-lead">
                            You bring the environment the part must survive. PRISM carries the work through design,
                            orchestration, autonomous experiments, manufacture and test, and keeps the evidence
                            attached at every step.
                        </p>
                        <p className="pm-body">
                            Each layer below says what it does and how far it has come. We would rather you see the
                            maturity than guess at it.
                        </p>
                    </div>
                </header>
                <nav className="stack-index reveal" aria-label="Stacks">
                    {STACKS.map((s, i) => (
                        <a key={s.id} href={`#${s.id}`}>
                            <span className="pm-data-label">{String(i + 1).padStart(2, '0')}</span>
                            <span>{s.name.replace(' stack', '')}</span>
                        </a>
                    ))}
                </nav>
                <div className="stacks">
                    {STACKS.map((s, i) => (
                        <StackRow key={s.id} stack={s} index={i} />
                    ))}
                </div>
                <div className="stacks-legend reveal">
                    <SourceLine label="Maturity">
                        In use: runs in current programmes. Prototype: PRISM software being matured from TRL 3 to TRL 4
                        within PRISM Alpha. In development: being built. Target: where the platform is going, not
                        claimed today.
                    </SourceLine>
                </div>
            </div>
        </section>
    );
}
