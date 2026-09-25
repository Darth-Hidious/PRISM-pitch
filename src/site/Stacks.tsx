import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { MaturityPill } from '../ds';
import type { Maturity } from '../ds/MaturityPill';
import { useMediaQuery } from './hooks';
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
    photo?: { src: string; alt: string; caption: string };
}

const STACKS: StackDef[] = [
    {
        id: 'research',
        name: 'Research stack',
        short: 'Research',
        question: 'Out of millions of possible mixes, which are worth making?',
        lead: 'A short list, ranked, with how sure we are.',
        answer: 'AI suggests ideas. Physics simulations throw out what cannot work, before any powder is weighed.',
        limit: 'It cannot see what a real machine does to the alloy. The manufacturing stack checks that.',
        layers: [
            {
                name: 'Knowledge graph',
                detail: 'Papers, patents and lab data, linked, each with its source.',
                maturity: 'prototype',
            },
            {
                name: 'Idea generator',
                detail: 'AI that suggests new mixes that are physically possible.',
                maturity: 'prototype',
            },
            {
                name: 'Physics filter',
                detail: 'Fast simulations first, then exact ones. Most ideas stop here, cheaply.',
                maturity: 'prototype',
            },
            {
                name: 'Smart experiment choice',
                detail: 'Each experiment is picked for what it will teach us.',
                maturity: 'prototype',
            },
            {
                name: 'Safe settings',
                detail: 'Settings that still work when powder and machine vary.',
                maturity: 'prototype',
            },
        ],
    },
    {
        id: 'harness',
        name: 'Harness stack',
        short: 'Harness',
        question: 'Who runs the work between the AI models?',
        lead: 'The harness.',
        answer: 'AI models only suggest. The harness plans each round, runs the tools, scores the results and remembers what failed.',
        limit: 'It never makes the final call. A named engineer signs off what leaves the loop.',
        layers: [
            {
                name: 'Planner',
                detail: 'Decides what to try next, from the last results.',
                maturity: 'prototype',
            },
            {
                name: 'Playbooks',
                detail: 'What each round learned, failures included.',
                maturity: 'prototype',
            },
            {
                name: 'Tool connections',
                detail: 'One way in to simulations, lab instruments and factory data.',
                maturity: 'prototype',
            },
            {
                name: 'Scorer',
                detail: 'Scores every result against the requirement.',
                maturity: 'prototype',
            },
            {
                name: 'Human sign-off',
                detail: 'AI suggests, engineers decide. Ideas without a source are rejected.',
                maturity: 'prototype',
            },
        ],
    },
    {
        id: 'autonomy',
        name: 'Autonomy stack',
        short: 'Autonomy',
        question: 'How do experiments stop being the slow part?',
        lead: 'Robots do the repetitive steps. People stay in charge.',
        answer: 'Robots weigh and heat, instruments measure on the spot, and the data flows straight back.',
        limit: 'Most of this is still being built. The recipe writer works as a prototype today.',
        layers: [
            {
                name: 'Recipe writer',
                detail: 'Turns an idea into steps a lab can run.',
                maturity: 'prototype',
            },
            {
                name: 'Robot lab',
                detail: 'Robot arms weigh powder and move samples through the furnace.',
                maturity: 'development',
            },
            {
                name: 'Automatic measurement',
                detail: 'X-ray patterns on the spot, read by AI.',
                maturity: 'development',
            },
            {
                name: 'Probes',
                detail: 'Our own sensors, recording calibrated data at the machine.',
                maturity: 'development',
            },
            {
                name: 'Machine control',
                detail: 'Software drives the instruments, so the loop never waits.',
                maturity: 'development',
            },
            {
                name: 'Field robots',
                detail: 'The same autonomy outside the lab, without GPS. For civil and defence use.',
                maturity: 'development',
            },
        ],
    },
    {
        id: 'manufacturing',
        name: 'Manufacturing and test stack',
        short: 'Manufacturing and test',
        question: 'Can it really be made? Does it hold up?',
        lead: 'Only a real test can say.',
        answer: 'Most computer-designed materials stop at the recipe. We melt and 3D-print the best ideas, then test them.',
        photo: {
            src: '/img/spark-furnace-wide.webp',
            alt: 'A vacuum-arc furnace, open: the steel chamber with its viewports lifted above the round copper hearth.',
            caption: 'The vacuum-arc furnace, open.',
        },
        limit: 'A test sample is not a finished part. Certification is the goal, not a claim.',
        layers: [
            {
                name: 'Powder and melting',
                detail: 'New alloys, prepared and melted in a vacuum-arc furnace.',
                maturity: 'in-use',
            },
            {
                name: 'Printability check',
                detail: 'Can it be 3D-printed? Checked before any build starts.',
                maturity: 'prototype',
            },
            {
                name: 'Metal 3D printing',
                detail: 'Industrial laser printing from metal powder, safe settings mapped.',
                maturity: 'in-use',
            },
            {
                name: 'Testing',
                detail: 'Density and inner structure first, then strength and heat.',
                maturity: 'in-use',
            },
            {
                name: 'Certification file',
                detail: 'The evidence certification needs, from test sample to real part.',
                maturity: 'target',
            },
        ],
    },
    {
        id: 'evidence-stack',
        name: 'Evidence stack',
        short: 'Evidence',
        question: 'Where did this result come from, and who may see it?',
        lead: 'Every result carries its source, its owner and its rules.',
        answer: 'Every requirement, design, sample, test and decision is linked, like a family tree.',
        limit: 'Tracing and export labels work today. Automatic enforcement is being built.',
        layers: [
            {
                name: 'Traceability',
                detail: 'Every result records its inputs: data, code and model versions.',
                maturity: 'in-use',
            },
            {
                name: 'Linked records',
                detail: 'Requirement to decision, linked instead of scattered in files.',
                maturity: 'prototype',
            },
            {
                name: 'Data rights',
                detail: 'Each piece of data carries its owner and its allowed uses.',
                maturity: 'development',
            },
            {
                name: 'Controlled sharing',
                detail: 'Nothing is shared by accident. Every release is signed.',
                maturity: 'development',
            },
            {
                name: 'Export control',
                detail: 'Export rules on every deliverable today; automatic checks next.',
                maturity: 'in-use',
            },
        ],
    },
];

/* ── The stack drawing ────────────────────────────────────────────────── */

/*
 * Five isometric plates, Research on top and Evidence as the foundation. Scrolling drives them: they
 * start as one block (one system), come apart into five stacks as the first one is read, and the
 * plate being read slides forward with room opened above it, its parts standing up on it.
 */

const PW = 300; // plate width, in drawing units
const PH = 150; // plate depth, as drawn
const T = 12; // plate thickness
const W2 = PW / 2;
const H2 = PH / 2;
const LAST = STACKS.length - 1;

interface Geom {
    /** Distance between plates when apart, and when together as one block. */
    open: number;
    shut: number;
    /** Room opened above the plate being read, so all of its top shows. */
    room: number;
    /** How far that plate slides forward, to the lower left. */
    slide: number;
    pad: number;
    /** Width kept on the right for the names; 0 draws none. */
    names: number;
}

const GEOMS = {
    full: { open: 62, shut: T + 2, room: 124, slide: 36, pad: 14, names: 206 },
    /** Phones held sideways: the same drawing, without names too small to read. */
    bare: { open: 62, shut: T + 2, room: 124, slide: 36, pad: 14, names: 0 },
    /** Upright phones: a small drawing in the strip above the text. */
    mini: { open: 34, shut: T + 2, room: 66, slide: 22, pad: 6, names: 0 },
} satisfies Record<string, Geom>;
type Variant = keyof typeof GEOMS;

function frame(g: Geom) {
    const cx = g.pad + g.slide + W2;
    const y0 = g.pad + H2 + g.room / 2;
    const width = cx + W2 + (g.names ? 22 + g.names : g.pad);
    const height = y0 + LAST * g.open + H2 + T + g.room / 2 + g.slide / 2 + g.pad;
    return { cx, y0, width, height };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, x: number) => {
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
};

interface Place {
    dx: number;
    cy: number;
    /** How much this plate is the one being read, 0 to 1. */
    s: number;
}

/**
 * Where each plate sits. `apart`: 0 is one block, 1 is five plates. `at`: the plate being read,
 * fractional while moving from one to the next. `still` (reduced motion): nothing moves, only lights.
 */
function layout(g: Geom, apart: number, at: number, still: boolean): Place[] {
    const { y0 } = frame(g);
    const mid = y0 + (LAST / 2) * g.open;
    const gap = g.shut + (g.open - g.shut) * apart;
    return STACKS.map((_, i) => {
        const s = apart * Math.max(0, 1 - Math.abs(at - i));
        if (still) return { dx: 0, cy: y0 + i * g.open, s };
        // Plates above the one being read move up to open room over it; the stack stays centred.
        const lift = apart * g.room * (0.5 * Math.min(at, 1) - clamp01(at - i));
        return { dx: -g.slide * s, cy: mid + (i - LAST / 2) * gap + lift + (g.slide / 2) * s, s };
    });
}

/** A point on a plate's top face: `a` runs to its right corner, `b` to its left, both 0 to 1. */
function onPlate(cx: number, a: number, b: number, up = 0) {
    return `${(cx + (a - b) * W2).toFixed(1)},${(-H2 + (a + b) * H2 - up).toFixed(1)}`;
}

/** The three faces of a box standing on a plate. */
function box(cx: number, a: number, b: number, da: number, db: number, h: number) {
    const p = (aa: number, bb: number, up = 0) => onPlate(cx, aa, bb, up);
    return {
        top: [p(a, b, h), p(a + da, b, h), p(a + da, b + db, h), p(a, b + db, h)].join(' '),
        left: [p(a, b + db), p(a + da, b + db), p(a + da, b + db, h), p(a, b + db, h)].join(' '),
        right: [p(a + da, b), p(a + da, b + db), p(a + da, b + db, h), p(a + da, b, h)].join(' '),
    };
}

/** How tall a part stands: built parts tallest, goals only drawn on the plate. */
const TALL: Record<Maturity, number> = { 'in-use': 30, prototype: 21, development: 13, target: 0 };

/** Where a stack's parts stand on its plate: rows of three, drawn back to front. */
function slots(layers: Layer[]) {
    return layers
        .map((l, k) => ({ l, k, a: 0.1 + (k % 3) * 0.28, b: 0.14 + Math.floor(k / 3) * 0.4, da: 0.2, db: 0.28 }))
        .sort((x, y) => x.a + x.b - (y.a + y.b));
}

function IsoStack({ variant, onPick }: { variant: Variant; onPick?: (i: number) => (e: MouseEvent) => void }) {
    const g = GEOMS[variant];
    const { cx, width, height, y0 } = frame(g);
    const start = layout(g, 0, 0, false);
    const parts = variant !== 'mini';
    const named = g.names > 0;
    // Bottom plate first, so upper plates overlap lower ones.
    const order = STACKS.map((_, k) => LAST - k);
    const plate = {
        top: `${cx},${-H2} ${cx + W2},0 ${cx},${H2} ${cx - W2},0`,
        left: `${cx - W2},0 ${cx},${H2} ${cx},${H2 + T} ${cx - W2},${T}`,
        right: `${cx},${H2} ${cx + W2},0 ${cx + W2},${T} ${cx},${H2 + T}`,
    };
    return (
        <svg
            className={`iso iso--${variant}`}
            viewBox={`0 0 ${width.toFixed(0)} ${height.toFixed(0)}`}
            data-variant={variant}
            role={named ? 'group' : parts ? 'img' : undefined}
            aria-label={parts ? 'The five PRISM stacks, Research on top and Evidence as the foundation' : undefined}
            aria-hidden={parts ? undefined : true}
        >
            {order.map((i) => {
                const st = STACKS[i];
                return (
                    <g key={st.id} className="iso__plate" data-i={i} transform={`translate(0 ${start[i].cy.toFixed(2)})`}>
                        <g className="iso__drop" style={{ '--k': LAST - i } as CSSProperties}>
                            <polygon className="iso__side iso__side--l" points={plate.left} />
                            <polygon className="iso__side iso__side--r" points={plate.right} />
                            <polygon className="iso__top" points={plate.top} />
                            {parts && (
                                <g className="iso__parts" style={{ opacity: 0.3 }}>
                                    {slots(st.layers).map(({ l, k, a, b, da, db }) => {
                                        const f = box(cx, a, b, da, db, 0);
                                        return (
                                            <g
                                                key={l.name}
                                                className={`iso__part iso__part--${l.maturity}`}
                                                data-k={k}
                                                data-a={a}
                                                data-b={b}
                                                data-da={da}
                                                data-db={db}
                                                data-h={TALL[l.maturity]}
                                            >
                                                <polygon className="iso__part-l" points={f.left} />
                                                <polygon className="iso__part-r" points={f.right} />
                                                <polygon className="iso__part-t" points={f.top} />
                                            </g>
                                        );
                                    })}
                                </g>
                            )}
                        </g>
                    </g>
                );
            })}
            {named &&
                STACKS.map((st, i) => {
                    const x = cx + W2 + 22;
                    return (
                        <a
                            key={st.id}
                            href={`#${st.id}`}
                            className="iso__label is-faded"
                            data-i={i}
                            style={{ opacity: 0 }}
                            onClick={onPick?.(i)}
                        >
                            <g transform={`translate(0 ${start[i].cy.toFixed(2)})`}>
                                <line className="iso__lead" x1={cx + W2 + 6} y1={0} x2={x - 6} y2={0} />
                                <text className="iso__num" x={x} y={-8}>
                                    {String(i + 1).padStart(2, '0')}
                                </text>
                                <text className="iso__name" x={x} y={13}>
                                    {st.short}
                                </text>
                            </g>
                        </a>
                    );
                })}
            {named && (
                <g className="iso__whole" aria-hidden="true">
                    <line className="iso__lead" x1={cx + W2 + 6} y1={y0 + (LAST / 2) * g.open} x2={cx + W2 + 16} y2={y0 + (LAST / 2) * g.open} />
                    <text className="iso__name" x={cx + W2 + 22} y={y0 + (LAST / 2) * g.open + 6}>
                        One system
                    </text>
                </g>
            )}
        </svg>
    );
}

/** Moves one drawing to where scrolling has got to. */
function draw(svg: SVGSVGElement, apart: number, at: number, still: boolean) {
    const g = GEOMS[svg.dataset.variant as Variant];
    const { cx } = frame(g);
    const places = layout(g, apart, at, still);
    svg.querySelectorAll<SVGGElement>('.iso__plate').forEach((el) => {
        const p = places[Number(el.dataset.i)];
        el.setAttribute('transform', `translate(${p.dx.toFixed(2)} ${p.cy.toFixed(2)})`);
        el.classList.toggle('is-on', p.s > 0.5);
        const parts = el.querySelector<SVGGElement>('.iso__parts');
        if (!parts) return;
        // The parts stand up as their plate comes forward; with reduced motion they simply stand.
        const up = still ? (p.s > 0.5 ? 1 : 0) : smooth(0.35, 1, p.s);
        if (Math.abs(Number(parts.dataset.up ?? -1) - up) < 0.002) return;
        parts.dataset.up = String(up);
        parts.style.opacity = String(0.3 + 0.7 * up);
        parts.querySelectorAll<SVGGElement>('.iso__part').forEach((part) => {
            const d = part.dataset;
            const f = box(cx, Number(d.a), Number(d.b), Number(d.da), Number(d.db), Number(d.h) * up);
            const [l, r, t] = Array.from(part.children);
            l.setAttribute('points', f.left);
            r.setAttribute('points', f.right);
            t.setAttribute('points', f.top);
        });
    });
    const names = smooth(0.35, 0.85, apart);
    svg.querySelectorAll<SVGAElement>('.iso__label').forEach((el) => {
        const p = places[Number(el.dataset.i)];
        el.querySelector('g')?.setAttribute('transform', `translate(0 ${p.cy.toFixed(2)})`);
        el.style.opacity = names.toFixed(3);
        el.classList.toggle('is-faded', names < 0.5);
        el.classList.toggle('is-on', p.s > 0.5);
        el.querySelector('line')?.setAttribute('x1', (cx + W2 + p.dx + 6).toFixed(1));
    });
    const whole = svg.querySelector<SVGGElement>('.iso__whole');
    if (whole) whole.style.opacity = (1 - smooth(0.1, 0.5, apart)).toFixed(3);
}

/* ── One stack ────────────────────────────────────────────────────────── */

function Chapter({ stack, index, level }: { stack: StackDef; index: number; level: 'h2' | 'h3' }) {
    const H = level;
    return (
        <article id={stack.id} className="chapter" aria-labelledby={`${stack.id}-name`}>
            <p className="w-label chapter__index">
                Stack {String(index + 1).padStart(2, '0')} / {String(STACKS.length).padStart(2, '0')}
            </p>
            <H id={`${stack.id}-name`} className="chapter__name">
                {stack.name}
            </H>
            <p className="q chapter__q">{stack.question}</p>
            <p className="a chapter__a">
                <b>{stack.lead}</b> {stack.answer}
            </p>
            {stack.photo && (
                <figure className="chapter__photo">
                    <img src={stack.photo.src} alt={stack.photo.alt} width={1200} height={800} loading="lazy" />
                    <figcaption>{stack.photo.caption}</figcaption>
                </figure>
            )}
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

/* ── Section ──────────────────────────────────────────────────────────── */

const two = (i: number) => String(i + 1).padStart(2, '0');

/**
 * The platform: scroll through the five stacks. Beside the text (or in a strip above it on upright
 * phones) the drawing takes the system apart and brings forward the stack being read. Clicking a
 * stack's name, or its number, goes straight to it.
 */
export default function Stacks({ n = '01', h1 = false }: { n?: string; h1?: boolean }) {
    const H = h1 ? 'h1' : 'h2';
    const section = useRef<HTMLElement>(null);
    const [active, setActive] = useState(0);
    const short = useMediaQuery('(max-height: 500px)');

    const go = (i: number) => (e: MouseEvent) => {
        e.preventDefault();
        const el = document.getElementById(STACKS[i].id);
        if (!el) return;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        window.history.replaceState(null, '', `#${STACKS[i].id}`);
    };

    useEffect(() => {
        const sec = section.current;
        if (!sec) return;
        const chapters = STACKS.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
        if (chapters.length !== STACKS.length) return;
        const strip = sec.querySelector<HTMLElement>('.stacks__strip');
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        let raf = 0;
        let shown = 0;

        const update = () => {
            raf = 0;
            const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0;
            const top = nav + (strip?.offsetHeight ?? 0);
            const focus = top + (window.innerHeight - top) * 0.42;
            // Where reading has got to: below 0 before the first stack, i + fraction inside stack i.
            let pos = -1;
            const first = chapters[0].getBoundingClientRect();
            if (focus < first.top) pos = Math.max(-1, (focus - first.top) / Math.max(1, first.height));
            else
                for (let i = 0; i < chapters.length; i++) {
                    const r = chapters[i].getBoundingClientRect();
                    if (focus < r.bottom || i === LAST) {
                        pos = i + Math.min(1, (focus - r.top) / Math.max(1, r.height));
                        break;
                    }
                }
            const still = reduced.matches;
            // One block while the first stack is below the screen; five plates once it is being read.
            const vh = window.innerHeight;
            const apart = still ? 1 : smooth(0.08, 0.92, (vh - first.top) / Math.max(1, vh - focus));
            let at = 0;
            if (still) at = Math.min(LAST, Math.max(0, Math.floor(pos)));
            else for (let b = 1; b <= LAST; b++) at += smooth(b - 0.12, b + 0.12, pos);
            for (const svg of sec.querySelectorAll<SVGSVGElement>('svg[data-variant]'))
                if (svg.getBoundingClientRect().width > 0) draw(svg, apart, at, still);
            const now = Math.min(LAST, Math.max(0, Math.floor(pos)));
            if (now !== shown) {
                shown = now;
                setActive(now);
            }
        };
        const schedule = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };
        const ro = new ResizeObserver(schedule);
        ro.observe(sec);
        window.addEventListener('scroll', schedule, { passive: true });
        reduced.addEventListener('change', schedule);
        update();
        return () => {
            ro.disconnect();
            window.removeEventListener('scroll', schedule);
            reduced.removeEventListener('change', schedule);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <section ref={section} id="platform" className="stacks" data-theme="navy" data-nav="navy" aria-labelledby="platform-title">
            <Grain />
            <div className="wrap stacks__scroll">
                <div className="stacks__rail">
                    <IsoStack variant={short ? 'bare' : 'full'} onPick={go} />
                </div>
                <div className="stacks__main">
                    <header className="stacks__head rv">
                        <Idx n={n}>The platform</Idx>
                        <H id="platform-title" className="w-h2">
                            Five stacks. One system.
                        </H>
                        <p className="w-lead">Five layers, each with one job. Every part is labelled with how ready it is.</p>
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
                        <p className="stacks__cue" aria-hidden="true">
                            Scroll to take it apart
                        </p>
                    </header>
                    <div className="stacks__strip">
                        <IsoStack variant="mini" />
                        <p className="stacks__now">
                            <span className="w-label">
                                Stack {two(active)} / {two(LAST)}
                            </span>
                            <b>{STACKS[active].short}</b>
                        </p>
                        <nav className="stacks__jump" aria-label="The five stacks">
                            {STACKS.map((st, i) => (
                                <a
                                    key={st.id}
                                    href={`#${st.id}`}
                                    aria-label={st.name}
                                    aria-current={i === active ? 'step' : undefined}
                                    onClick={go(i)}
                                >
                                    {two(i)}
                                </a>
                            ))}
                        </nav>
                    </div>
                    {STACKS.map((st, i) => (
                        <Chapter key={st.id} stack={st} index={i} level={h1 ? 'h2' : 'h3'} />
                    ))}
                </div>
            </div>
        </section>
    );
}
