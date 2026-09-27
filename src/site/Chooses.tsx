import { useEffect, useRef, useState } from 'react';
import { MaturityPill } from '../ds';
import { Ball, Defs, T } from './engrave';
import { seeded, useInView, useMediaQuery, useReducedMotion } from './hooks';
import { useT } from './i18n';
import { Grain, Idx, Note, Rails, Words } from './ui';

/* ── How PRISM chooses: propose, judge, check, print, window, learn ───── */

const STEPS = [
    { title: 'Propose', text: 'A generator suggests a whole batch of recipes: many good ones, not one best guess.' },
    { title: 'Judge', text: 'Several independent models score each recipe. Where they disagree, we trust the score less.' },
    { title: 'Check exactly', text: 'The promising recipes the models are unsure about get an exact quantum calculation.' },
    { title: 'Can it be printed?', text: 'Before any metal is made, we check that it will print, using Fraunhofer IAPT’s process data.' },
    { title: 'A window, not a point', text: 'We send a safe range, not a single point. A range still works when the machine changes.' },
    { title: 'Test, then learn', text: 'Every test result goes back in and retrains the models for the next round.' },
];

/** How long each step shows before the next, while the scene plays by itself. */
const STEP_MS = 4600;

/**
 * Where the steps are read below or beside a scene that stays on screen, and scrolling moves from one step
 * to the next: phones and small tablets held upright, and phones held sideways. Elsewhere the scene plays
 * by itself beside the list.
 */
const SCROLL_MQ = '((max-width: 900px) and (max-aspect-ratio: 1 / 1)) or ((max-height: 500px) and (min-aspect-ratio: 1 / 1))';

/*
 * The scene: a design space drawn as a triangle of three elements, as on a phase diagram. Nothing in it
 * is project data: the recipes, their scores and the window are drawn for this site.
 */
const A = { x: 200, y: 50 };
const B = { x: 30, y: 344 };
const C = { x: 370, y: 344 };
/** The middle of the good region, where the window forms. */
const W = { x: 236, y: 258 };
/** Where the generator sends its recipes from. */
const GEN = { x: 70, y: 72 };
/** How far in from the left edge recipes are hard to print. */
const BAND = 38;
/** The judges' panel: four models, and the scale their scores land on. */
const JUDGES = [300, 332, 364, 396];
const SCALE = { x0: 300, x1: 424, y: 112 };

/** Signed distance from a point to the line through two others. Taking the edges A→B→C, inside is negative. */
const side = (p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) =>
    ((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)) / Math.hypot(b.x - a.x, b.y - a.y);
const inside = (p: { x: number; y: number }, m: number) => -side(p, A, B) >= m && -side(p, B, C) >= m && -side(p, C, A) >= m;
const fromLeft = (p: { x: number; y: number }) => -side(p, A, B);

interface Cand {
    x: number;
    y: number;
    /** How good the models think it is, 0 to 1. */
    score: number;
    /** How much the models disagree about it, 0 to 1. */
    doubt: number;
    hard: boolean;
    check: boolean;
    tone: 'white' | 'light' | 'mid' | 'dark';
}

/** The recipes the generator proposes: most near the good region, some far out, to explore. */
function propose(): Cand[] {
    const rand = seeded(27);
    const gauss = () => Math.sqrt(-2 * Math.log(Math.max(1e-9, rand()))) * Math.cos(2 * Math.PI * rand());
    const out: { x: number; y: number }[] = [];
    const free = (p: { x: number; y: number }) =>
        inside(p, 12) &&
        out.every((q) => Math.hypot(q.x - p.x, q.y - p.y) > 17) &&
        // Room for the window's label below the window.
        !(Math.abs(p.x - W.x) < 48 && p.y > W.y + 30 && p.y < W.y + 70);
    for (let tries = 0; out.length < 14 && tries < 2000; tries++) {
        const p = { x: W.x + gauss() * 36, y: W.y + gauss() * 24 };
        if (free(p)) out.push(p);
    }
    // Far out, three of them close to the edge where recipes are hard to print.
    for (let tries = 0; out.length < 21 && tries < 2000; tries++) {
        const p = { x: B.x + rand() * (C.x - B.x), y: A.y + rand() * (B.y - A.y) };
        if (free(p) && fromLeft(p) > BAND + 6 && Math.hypot(p.x - W.x, p.y - W.y) > 70) out.push(p);
    }
    for (let tries = 0; out.length < 24 && tries < 2000; tries++) {
        const p = { x: B.x + rand() * (C.x - B.x), y: A.y + 40 + rand() * (B.y - A.y - 60) };
        if (free(p) && fromLeft(p) < BAND - 10) out.push(p);
    }
    const cands = out.map((p) => {
        const r2 = (p.x - W.x) ** 2 + (p.y - W.y) ** 2;
        const score = Math.exp(-r2 / (2 * 80 ** 2));
        const doubt = Math.min(1, Math.max(0.15, 0.2 + 0.65 * (1 - Math.exp(-r2 / (2 * 70 ** 2))) + (rand() - 0.5) * 0.3));
        const tone: Cand['tone'] = score > 0.8 ? 'dark' : score > 0.55 ? 'mid' : score > 0.3 ? 'light' : 'white';
        return { ...p, score, doubt, hard: fromLeft(p) < BAND, check: false, tone };
    });
    // Promising but uncertain: the ones worth an exact check.
    [...cands]
        .filter((c) => !c.hard && c.score > 0.3)
        .sort((a, b) => b.score * b.doubt - a.score * a.doubt)
        .slice(0, 3)
        .forEach((c) => (c.check = true));
    return cands;
}

const CANDS = propose();
/** The candidate the judges' panel shows: the checked one nearest the panel. */
const FOCUS = CANDS.filter((c) => c.check).sort((a, b) => a.y - a.x - (b.y - b.x))[0];
/** Where each judge scores it on the panel's scale, and where the exact check puts it. */
const EXACT = SCALE.x0 + (SCALE.x1 - SCALE.x0) * 0.66;
const TICKS = [-0.22, -0.07, 0.09, 0.2].map((o) => EXACT + o * (SCALE.x1 - SCALE.x0) * (0.4 + FOCUS.doubt));

/** A strip along the left edge, BAND wide: where recipes are hard to print. OUT points away from the triangle. */
const OUT = { x: (A.y - B.y) / Math.hypot(A.x - B.x, A.y - B.y), y: (B.x - A.x) / Math.hypot(A.x - B.x, A.y - B.y) };
const STRIP = `M${A.x},${A.y} L${B.x},${B.y} L${B.x - OUT.x * BAND},${B.y - OUT.y * BAND} L${A.x - OUT.x * BAND},${A.y - OUT.y * BAND} Z`;

/**
 * The scene at one step, or everything at once (`step` of -1) where motion is unwelcome. Each step adds a
 * layer and keeps the ones before; the step being shown is marked in the accent colour.
 */
function Scene({ step, round, moving }: { step: number; round: number; moving: boolean }) {
    const t = useT();
    const all = step < 0;
    const on = (k: number) => all || step >= k;
    const cls = [
        'eg choose__svg',
        on(1) && 'is-scored',
        on(2) && 'is-checked',
        on(3) && 'is-filtered',
        on(4) && 'has-window',
        on(5) && 'is-learned',
        !all && `at-${step}`,
        moving && 'is-moving',
    ]
        .filter(Boolean)
        .join(' ');
    const id = 'choose';
    return (
        <svg
            className={cls}
            viewBox="0 0 440 384"
            role="img"
            aria-label={t(
                'How PRISM chooses: a generator proposes recipes in a design space of three elements. Several models score each one, and a halo shows how much they disagree. The promising but uncertain ones get an exact check, recipes that are hard to print drop out, and a safe window is chosen. Test results retrain the models.',
            )}
        >
            <Defs id={id} />
            <defs>
                <clipPath id="choose-space">
                    <path d={`M${A.x},${A.y} L${B.x},${B.y} L${C.x},${C.y} Z`} />
                </clipPath>
            </defs>

            {/* The design space, with a faint grid of mixes */}
            <g className="choose__grid">
                {[0.25, 0.5, 0.75].map((f) => (
                    <g key={f}>
                        <path className="eg-line eg-line--thin" d={`M${B.x + (A.x - B.x) * f},${B.y + (A.y - B.y) * f} L${C.x + (A.x - C.x) * f},${C.y + (A.y - C.y) * f}`} />
                        <path className="eg-line eg-line--thin" d={`M${B.x + (C.x - B.x) * f},${B.y} L${B.x + (A.x - B.x) * (1 - f) + (C.x - B.x) * f},${B.y + (A.y - B.y) * (1 - f)}`} />
                        <path className="eg-line eg-line--thin" d={`M${C.x + (B.x - C.x) * f},${C.y} L${C.x + (A.x - C.x) * (1 - f) + (B.x - C.x) * f},${C.y + (A.y - C.y) * (1 - f)}`} />
                    </g>
                ))}
            </g>
            <g clipPath="url(#choose-space)">
                <path className="choose__band" fill={`url(#${id}-hatch)`} d={STRIP} />
            </g>
            <path className="eg-line eg-line--bold" d={`M${A.x},${A.y} L${B.x},${B.y} L${C.x},${C.y} Z`} />
            <T x={A.x} y={A.y - 14}>
                {t('element A')}
            </T>
            <T x={B.x} y={B.y + 26} anchor="start">
                {t('element B')}
            </T>
            <T x={C.x} y={C.y + 26} anchor="end">
                {t('element C')}
            </T>
            <g className="choose__band-label" transform={`rotate(-60 ${(A.x + B.x) / 2 - 16} ${(A.y + B.y) / 2 - 9})`}>
                <T x={(A.x + B.x) / 2 - 16} y={(A.y + B.y) / 2 - 9} kind="small">
                    {t('hard to print')}
                </T>
            </g>

            {/* The window: where the good, printable, well-understood recipes are */}
            <g className="choose__window">
                <ellipse className="choose__window-fill" fill={`url(#${id}-fine)`} cx={W.x} cy={W.y} rx={52} ry={30} transform={`rotate(-16 ${W.x} ${W.y})`} />
                <ellipse className="choose__window-edge" cx={W.x} cy={W.y} rx={52} ry={30} transform={`rotate(-16 ${W.x} ${W.y})`} />
                <T x={W.x} y={W.y + 52} kind="small">
                    {t('window')}
                </T>
            </g>

            {/* The generator, and the recipes it proposes */}
            <g className="choose__gen">
                <rect className="eg-solid" x={GEN.x - 50} y={40} width={100} height={32} rx={3} />
                <rect className="eg-fill" fill={`url(#${id}-fine)`} x={GEN.x - 50} y={40} width={10} height={32} />
                <rect className="choose__gen-edge" x={GEN.x - 50} y={40} width={100} height={32} rx={3} />
                <T x={GEN.x + 5} y={61} kind="small">
                    {t('generator')}
                </T>
                <path className="eg-line" d={`M${GEN.x + 52},${56} C${GEN.x + 86},${56} ${GEN.x + 96},${84} ${GEN.x + 104},${112}`} markerEnd={`url(#${id}-arrow)`} />
            </g>
            <g key={round} className="choose__cands">
                {CANDS.map((c, k) => (
                    <g
                        key={k}
                        className={['choose__cand', c.hard && 'choose__cand--hard', c.check && 'choose__cand--check'].filter(Boolean).join(' ')}
                        data-tone={c.tone}
                        style={{ ['--gx' as string]: `${GEN.x - c.x}px`, ['--gy' as string]: `${GEN.y - c.y}px`, ['--i' as string]: k }}
                    >
                        <circle className="choose__halo" cx={c.x} cy={c.y} r={8 + 14 * c.doubt} />
                        {c.check && <circle className="choose__ping" cx={c.x} cy={c.y} r={9} />}
                        <Ball cx={c.x} cy={c.y} r={5} tone="white" />
                        {/* Once calculated exactly, the dashed doubt gives way to a firm ring. */}
                        {c.check && <circle className="choose__mark" cx={c.x} cy={c.y} r={8.5} />}
                        {c.hard && <path className="choose__cross" d={`M${c.x - 7},${c.y - 7} L${c.x + 7},${c.y + 7} M${c.x + 7},${c.y - 7} L${c.x - 7},${c.y + 7}`} />}
                    </g>
                ))}
            </g>

            {/* Test results from coupons made inside the window, and the way back to the models */}
            <g className="choose__tests">
                {[
                    [-24, 4],
                    [0, -8],
                    [22, 6],
                ].map(([dx, dy]) => (
                    <rect key={dx} className="choose__test" x={W.x + dx - 4} y={W.y + dy - 4} width={8} height={8} />
                ))}
            </g>
            <g className="choose__retrain">
                <path className="choose__retrain-line" d={`M${W.x + 50},${W.y - 20} C${W.x + 70},${W.y - 50} ${SCALE.x0},${190} ${SCALE.x0},${SCALE.y + 34}`} markerEnd={`url(#${id}-arrow)`} />
                <T x={SCALE.x0 + 10} y={196} kind="small" anchor="start">
                    {t('retrain')}
                </T>
            </g>

            {/* The judges: four models score the same recipe; how far apart they land is the trust meter */}
            <g className="choose__panel">
                <path className="choose__leader" d={`M${SCALE.x0 - 6},${SCALE.y + 4} L${FOCUS.x + 8},${FOCUS.y - 4}`} />
                <T x={SCALE.x0 - 4} y={40} kind="head" anchor="start">
                    {t('judges')}
                </T>
                {JUDGES.map((x, k) => (
                    <g key={x}>
                        <rect className="eg-solid" x={x - 9} y={52} width={18} height={18} rx={2} />
                        <rect className="eg-fill" fill={`url(#${id}-layers)`} x={x - 9} y={52} width={18} height={18} />
                        <rect className="eg-frame" x={x - 9} y={52} width={18} height={18} rx={2} />
                        <line className="choose__wire" x1={x} y1={70} x2={TICKS[k]} y2={SCALE.y - 6} />
                    </g>
                ))}
                <path className="eg-line" d={`M${SCALE.x0},${SCALE.y} H${SCALE.x1} M${SCALE.x0},${SCALE.y - 4} V${SCALE.y + 4} M${SCALE.x1},${SCALE.y - 4} V${SCALE.y + 4}`} />
                <rect
                    className="choose__spread"
                    fill={`url(#${id}-fine)`}
                    x={Math.min(...TICKS)}
                    y={SCALE.y - 6}
                    width={Math.max(...TICKS) - Math.min(...TICKS)}
                    height={12}
                    style={{ transformOrigin: `${EXACT}px ${SCALE.y}px` }}
                />
                {TICKS.map((x, k) => (
                    <line
                        key={k}
                        className="choose__tick"
                        x1={x}
                        y1={SCALE.y - 7}
                        x2={x}
                        y2={SCALE.y + 7}
                        style={{ ['--from' as string]: `${JUDGES[k] - x}px`, ['--learn' as string]: `${(EXACT - x) * 0.6}px` }}
                    />
                ))}
                <line className="choose__exact" x1={EXACT} y1={SCALE.y - 10} x2={EXACT} y2={SCALE.y + 10} />
                <T x={SCALE.x0 - 4} y={SCALE.y + 28} kind="small" anchor="start">
                    {t('trust meter')}
                </T>
            </g>
        </svg>
    );
}

/**
 * /method/: how PRISM chooses what to make, as one scene that plays its six steps in turn while it is on
 * screen. Picking a step shows it and stops the play. On phones the scene stays on screen and scrolling
 * moves through the steps instead. With reduced motion the scene shows every step at once, standing still.
 */
export default function Chooses({ n = '02' }: { n?: string }) {
    const t = useT();
    const reduce = useReducedMotion();
    const [ref, inView] = useInView<HTMLDivElement>('-15% 0px');
    const [step, setStep] = useState(0);
    const [round, setRound] = useState(0);
    const [picked, setPicked] = useState(false);
    const byScroll = useMediaQuery(SCROLL_MQ) && !reduce;
    const playing = inView && !picked && !reduce && !byScroll;
    const figure = useRef<HTMLElement>(null);
    const list = useRef<HTMLOListElement>(null);

    // Scrolling through the steps: the step shown is the one nearest the middle of the screen below the
    // scene (or of the whole screen, with the scene beside the list), so its words are in view.
    useEffect(() => {
        if (!byScroll) return;
        let raf = 0;
        const update = () => {
            raf = 0;
            const f = figure.current?.getBoundingClientRect();
            const items = [...(list.current?.children ?? [])];
            if (!f || !items.length) return;
            const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0;
            const beside = f.right <= items[0].getBoundingClientRect().left + 1;
            const mid = beside ? (nav + window.innerHeight) / 2 : (f.bottom + window.innerHeight) / 2;
            const far = items.map((li) => {
                const r = li.getBoundingClientRect();
                return Math.abs((r.top + r.bottom) / 2 - mid);
            });
            setStep(far.indexOf(Math.min(...far)));
        };
        const schedule = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        update();
        return () => {
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
            cancelAnimationFrame(raf);
        };
    }, [byScroll]);

    useEffect(() => {
        if (!playing) return;
        const id = setInterval(() => {
            setStep((s) => {
                if (s === STEPS.length - 1) setRound((r) => r + 1);
                return (s + 1) % STEPS.length;
            });
        }, STEP_MS);
        return () => clearInterval(id);
    }, [playing]);

    // With reduced motion, every step shows at once until one is picked.
    const shown = reduce && !picked ? -1 : step;
    const pick = (i: number) => {
        setPicked(true);
        setStep(i);
    };

    return (
        <section id="chooses" className="sec choose" data-theme="navy" data-nav="navy" aria-labelledby="choose-title">
            <Rails />
            <Grain />
            <div className="wrap">
                <header className="sec-head rv">
                    <Idx n={n} tail={<MaturityPill maturity="prototype" label={t('Prototype')} />}>
                        {t('How PRISM chooses')}
                    </Idx>
                    <h2 id="choose-title" className="w-h2">
                        <Words>{t('Which recipes are worth making?')}</Words>
                    </h2>
                    <p className="w-lead">{t('The AI proposes and scores recipes, and says where it is unsure. Exact physics and real tests have the last word.')}</p>
                </header>
                {/* Idle is an attribute, not a class: the page's reveal adds its own class to this element. */}
                <div ref={ref} className="choose__body rv" data-idle={inView ? undefined : ''} data-mode={byScroll ? 'scroll' : undefined}>
                    <figure ref={figure} className="choose__figure">
                        <div className="choose__card" data-theme="paper">
                            <Scene step={shown} round={round} moving={!reduce} />
                        </div>
                        <figcaption>
                            <Note label={t('Illustrative')}>{t('Drawn for this site. The recipes, scores and window show how it works; they are not project data.')}</Note>
                        </figcaption>
                    </figure>
                    <ol ref={list} className="choose__steps">
                        {STEPS.map((s, i) => (
                            <li key={s.title} className={shown === i || shown < 0 ? 'is-on' : undefined}>
                                <span className="choose__num">{String(i + 1).padStart(2, '0')}</span>
                                <div>
                                    <h3 id={`choose-step-${i}`} className="choose__title">
                                        {t(s.title)}
                                    </h3>
                                    <p className="choose__text">{t(s.text)}</p>
                                </div>
                                <button type="button" className="choose__pick" aria-labelledby={`choose-step-${i}`} aria-pressed={shown === i} onClick={() => pick(i)} />
                                <span className="choose__bar" aria-hidden="true">
                                    {shown === i && playing && <i key={`${round}-${i}`} />}
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>
                <p className="choose__close rv">{t('A language model reads the papers and cites its sources. It never judges the physics.')}</p>
            </div>
        </section>
    );
}
