import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { expectedCascade, hitProbability, impulseResponse, quantile, scale, simulateCascade } from './hawkes';
import { seeded, useInView, useMediaQuery, useReducedMotion } from './hooks';
import { useT } from './i18n';
import { BASE, COLUMNS, LINKS, MEAN_DELAY_DAYS, NODES, PROGRAMMES, SUPPLIERS, index } from './supply-model';

/**
 * How a disruption spreads through a supply network. Pick the supplier where it starts and set the
 * branching ratio ρ(A); the network plays one cascade drawn from a multivariate Hawkes process, each event
 * lit as the event that set it off reaches it. Beside it, what to expect: where the disruption lands
 * (exact chances, and (I − A)⁻¹), when (the exact response curve) and how big it gets (2,000 simulated
 * cascades). The mathematics is in hawkes.ts; the network, made up, in supply-model.ts.
 */

const BETA = 1 / MEAN_DELAY_DAYS;
const RUNS = 2000;
/** The days the playback and the charts cover. */
const HORIZON = 180;
const DAY_TICKS = [0, 60, 120, 180];
const DAYS_PER_SECOND = 12;
const K_MIN = 0.3;
const K_MAX = 0.95;

/* ── Where the nodes sit: across the screen, or down it on upright phones ── */

const COUNTS = COLUMNS.map((_, c) => NODES.filter((n) => n.col === c).length);
const ORDER = NODES.map((n) => NODES.filter((m) => m.col === n.col).indexOf(n));
const W = 1200;
const H = 420;
const wide = (i: number) => ({ x: 110 + NODES[i].col * 245, y: 60 + ((ORDER[i] + 0.5) / COUNTS[NODES[i].col]) * 260 });
const VW = 360;
const TOP = 100;
const ROW = 132;
const VH = TOP + ROW * 4 + 90;
const upright = (i: number) => ({ x: 40 + ((ORDER[i] + 0.5) / COUNTS[NODES[i].col]) * (VW - 80), y: TOP + NODES[i].col * ROW });

type At = (i: number) => { x: number; y: number };

const EDGES = LINKS.map((l) => ({ ...l, from: index(l.from), to: index(l.to), key: `${index(l.from)}>${index(l.to)}` }));
const FEEDBACK = EDGES.filter((e) => e.feedback);

/**
 * A supply link as a curve with the flow. A feedback link as a return path around the outside: the
 * first one outermost, so that the return paths do not cross on their way out.
 */
function linkPath(e: (typeof EDGES)[number], vertical: boolean, at: At) {
    const a = at(e.from);
    const b = at(e.to);
    if (!e.feedback) {
        if (vertical) {
            const m = (a.y + b.y) / 2;
            return `M${a.x},${a.y} C${a.x},${m} ${b.x},${m} ${b.x},${b.y}`;
        }
        const m = (a.x + b.x) / 2;
        return `M${a.x},${a.y} C${m},${a.y} ${m},${b.y} ${b.x},${b.y}`;
    }
    const out = FEEDBACK.length - 1 - FEEDBACK.indexOf(e);
    if (vertical) {
        const down = a.y + 56 + out * 9;
        const right = VW - 16 + out * 5;
        const up = TOP - 40 - out * 9;
        return `M${a.x},${a.y} V${down} H${right} V${up} H${b.x} V${b.y - 12}`;
    }
    const right = W - 50 + out * 12;
    const bottom = H - 50 + out * 12;
    const left = 50 - out * 12;
    return `M${a.x},${a.y} H${right} V${bottom} H${left} V${b.y} H${b.x - 12}`;
}

/** A label on one line, without the soft hyphens that let long German words break in running text. */
const oneLine = (s: string) => s.replace(/­/g, '');

/** A label on upright phones: a line per word, and long German words broken where they carry a soft hyphen. */
const lines = (s: string) => s.split(' ').flatMap((w) => w.split('­').map((part, k, all) => (k < all.length - 1 ? `${part}-` : part)));

/* ── The charts ── */

const PLOT_W = 332;
const PLOT_H = 104;

/** Cascade sizes in bins that double: 1, 2, 3–4, 5–8, … and 257 or more. */
const BINS = [1, 2, 4, 8, 16, 32, 64, 128, 256, Infinity];
const binOf = (size: number) => BINS.findIndex((top) => size <= top);
const BIN_W = PLOT_W / BINS.length;

/* ── The formulas, as MathML: nothing in them to translate, and the plain copy reads their `alttext` ── */

const MATH = [
    {
        caption: 'Events at node i come at a background rate μᵢ, plus a fading kick from each earlier event it depends on. Node j Granger-causes node i exactly when αᵢⱼ > 0.',
        ml: `<math display="block" alttext="λ_i(t) = μ_i + Σ_j Σ_{t_k^j < t} α_ij β e^(−β (t − t_k^j))"><mrow><msub><mi>λ</mi><mi>i</mi></msub><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo><mo>=</mo><msub><mi>μ</mi><mi>i</mi></msub><mo>+</mo><munder><mo>∑</mo><mi>j</mi></munder><munder><mo>∑</mo><mrow><msubsup><mi>t</mi><mi>k</mi><mi>j</mi></msubsup><mo>&lt;</mo><mi>t</mi></mrow></munder><msub><mi>α</mi><mrow><mi>i</mi><mi>j</mi></mrow></msub><mi>β</mi><msup><mi>e</mi><mrow><mo>−</mo><mi>β</mi><mo stretchy="false">(</mo><mi>t</mi><mo>−</mo><msubsup><mi>t</mi><mi>k</mi><mi>j</mi></msubsup><mo stretchy="false">)</mo></mrow></msup></mrow></math>`,
    },
    {
        caption: 'Expected events everywhere after one shock at j: the shock, what it sets off, what that sets off, and so on. Economists know (I − A)⁻¹ as the Leontief inverse.',
        ml: `<math display="block" alttext="(I − A)^(−1) e_j = (I + A + A^2 + A^3 + …) e_j"><mrow><msup><mrow><mo stretchy="false">(</mo><mi>I</mi><mo>−</mo><mi>A</mi><mo stretchy="false">)</mo></mrow><mrow><mo>−</mo><mn>1</mn></mrow></msup><msub><mi>e</mi><mi>j</mi></msub><mo>=</mo><mo stretchy="false">(</mo><mi>I</mi><mo>+</mo><mi>A</mi><mo>+</mo><msup><mi>A</mi><mn>2</mn></msup><mo>+</mo><msup><mi>A</mi><mn>3</mn></msup><mo>+</mo><mo>⋯</mo><mo stretchy="false">)</mo><msub><mi>e</mi><mi>j</mi></msub></mrow></math>`,
    },
    {
        caption: 'The expected cascade is finite only while ρ(A), the largest eigenvalue of A, stays below 1. The slider sets it.',
        ml: `<math display="block" alttext="ρ(A) < 1"><mrow><mi>ρ</mi><mo stretchy="false">(</mo><mi>A</mi><mo stretchy="false">)</mo><mo>&lt;</mo><mn>1</mn></mrow></math>`,
    },
    {
        caption: 'The expected extra rate over time, exactly: the curves under ‘When it lands’.',
        ml: `<math display="block" alttext="h(t) = β A e^(−β (I − A) t) e_j"><mrow><mi>h</mi><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo><mo>=</mo><mi>β</mi><mi>A</mi><msup><mi>e</mi><mrow><mo>−</mo><mi>β</mi><mo stretchy="false">(</mo><mi>I</mi><mo>−</mo><mi>A</mi><mo stretchy="false">)</mo><mi>t</mi></mrow></msup><msub><mi>e</mi><mi>j</mi></msub></mrow></math>`,
    },
];

/* ── How an event lights up: WAAPI, so a burst of events costs no layout work ── */

const HALO: Keyframe[] = [
    { opacity: 0.75, transform: 'scale(0.3)' },
    { opacity: 0, transform: 'scale(1.3)' },
];
const CORE: Keyframe[] = [{ opacity: 1 }, { opacity: 0 }];

export default function SupplyShock() {
    const t = useT();
    const locale = t.lang === 'de' ? 'de-DE' : 'en-GB';
    const fmt = (x: number, d: number) => x.toLocaleString(locale, { minimumFractionDigits: d, maximumFractionDigits: d });
    // Two significant digits, so that small values stay readable: 24 %, 0.46 %, 0.0057.
    const sig = (x: number) => x.toLocaleString(locale, { maximumSignificantDigits: 2 });
    const pct = (x: number) => x.toLocaleString(locale, { style: 'percent', maximumSignificantDigits: 2 });

    const [source, setSource] = useState(SUPPLIERS[0].i);
    const [coupling, setCoupling] = useState(0.85);
    const [seed, setSeed] = useState(1);
    const kappa = useDeferredValue(coupling);
    const [ref, inView] = useInView<HTMLDivElement>('-10% 0px');
    const reduce = useReducedMotion();
    const vertical = useMediaQuery('(max-width: 760px) and (max-aspect-ratio: 1/1)');
    const at: At = vertical ? upright : wide;
    const paths = useMemo(() => EDGES.map((e) => linkPath(e, vertical, vertical ? upright : wide)), [vertical]);

    const pick = (i: number) => {
        setSource(i);
        setSeed((s) => s + 1);
    };

    /** A = [α_ij] with ρ(A) = the slider's value. */
    const A = useMemo(() => scale(BASE, kappa), [kappa]);
    /** Expected events at every node, the shock included: (I − A)⁻¹ e_j. */
    const expected = useMemo(() => expectedCascade(A, source), [A, source]);
    const formulaTotal = expected.reduce((s, x) => s + x, 0);
    /** The exact chance that the cascade reaches each programme. */
    const hit = useMemo(() => PROGRAMMES.map((p) => hitProbability(A, source, p.i)), [A, source]);

    /** 2,000 cascades, the same ones for a given setting, so the panels hold still. */
    const runs = useMemo(() => {
        const rand = seeded(1000 + source * 97 + Math.round(kappa * 100));
        const sizes: number[] = [];
        for (let r = 0; r < RUNS; r++) sizes.push(simulateCascade(A, BETA, source, rand).events.length);
        sizes.sort((a, b) => a - b);
        const counts = BINS.map(() => 0);
        for (const s of sizes) counts[binOf(s)]++;
        const mean = sizes.reduce((s, x) => s + x, 0) / RUNS;
        const variance = sizes.reduce((s, x) => s + (x - mean) ** 2, 0) / (RUNS - 1);
        return {
            mean,
            /** Half the width of the mean's 95 % confidence interval. */
            ci: 1.96 * Math.sqrt(variance / RUNS),
            p95: quantile(sizes, 0.95),
            share: counts.map((c) => c / RUNS),
        };
    }, [A, source, kappa]);
    const shareMax = Math.max(...runs.share);
    /** Decimals to the interval's first significant digit: 11.2 ± 1.1, 1.493 ± 0.044. */
    const ciDigits = runs.ci > 0 ? Math.max(1, 1 - Math.floor(Math.log10(runs.ci))) : 1;

    /** The expected extra event rate at each programme, day by day: h(t) = β A e^{−β(I − A)t} e_j. */
    const curves = useMemo(() => {
        const days = Array.from({ length: HORIZON + 1 }, (_, d) => d);
        const h = impulseResponse(A, BETA, source, days, 0.25);
        return PROGRAMMES.map((p) => days.map((d) => h[d][p.i]));
    }, [A, source]);
    const curveMax = Math.max(...curves.flat());
    const peakDay = (() => {
        const total = curves[0].map((_, d) => curves.reduce((s, c) => s + c[d], 0));
        return total.indexOf(Math.max(...total));
    })();

    /** One cascade to watch: its events in the order they happen, and which events each one set off. */
    const sample = useMemo(() => {
        const { events } = simulateCascade(A, BETA, source, seeded(seed * 7919 + source), 4000);
        const order = events
            .map((e, k) => ({ ...e, k }))
            .filter((e) => e.time <= HORIZON)
            .sort((a, b) => a.time - b.time);
        const children = events.map((): number[] => []);
        events.forEach((e, k) => e.parent >= 0 && children[e.parent].push(k));
        return { events, order, children };
    }, [A, source, seed]);

    const svgRef = useRef<SVGSVGElement>(null);
    const whenRef = useRef<SVGSVGElement>(null);
    const clockRef = useRef<HTMLParagraphElement>(null);
    const dayWord = t('Day');
    const eventWord = t('event');
    const eventsWord = t('events');

    useEffect(() => {
        const svg = svgRef.current;
        const when = whenRef.current;
        const clock = clockRef.current;
        if (!svg || !when || !clock) return;
        const node = (i: number) => svg.querySelector<SVGGElement>(`[data-node="${i}"]`);
        const cursor = when.querySelector<SVGLineElement>('.shock__cursor');
        const show = (day: number, count: number) => {
            clock.textContent = `${dayWord} ${Math.floor(day)} · ${count} ${count === 1 ? eventWord : eventsWord}`;
            cursor?.setAttribute('transform', `translate(${((day / HORIZON) * PLOT_W).toFixed(1)} 0)`);
        };
        /** What stays lit until the next cascade: the nodes it reached, the links it took, its events on the timeline. */
        const mark = (e: (typeof sample.order)[number]) => {
            node(e.node)?.classList.add('was-hit');
            if (e.parent >= 0) svg.querySelector(`[data-edge="${sample.events[e.parent].node}>${e.node}"]`)?.classList.add('was-hit');
            when.querySelector(`[data-event="${e.k}"]`)?.classList.add('is-on');
        };
        svg.querySelectorAll('.was-hit').forEach((el) => el.classList.remove('was-hit'));
        when.querySelectorAll('.is-on').forEach((el) => el.classList.remove('is-on'));

        // Without motion: the whole cascade at once.
        if (reduce) {
            sample.order.forEach(mark);
            show(sample.order.at(-1)?.time ?? 0, sample.order.length);
            return;
        }
        show(0, 0);
        if (!inView) return;

        const lengths = new Map<string, number>();
        /** A pulse along the link from cause to effect, arriving as the effect happens. */
        const travel = (key: string, ms: number) => {
            const path = svg.querySelector<SVGPathElement>(`[data-pulse="${key}"]`);
            if (!path || ms < 40) return;
            let len = lengths.get(key);
            if (len === undefined) {
                len = path.getTotalLength();
                lengths.set(key, len);
            }
            const dash = Math.min(56, len * 0.35);
            const array = `${dash}px ${len + dash}px`;
            path.animate(
                [
                    { opacity: 1, strokeDasharray: array, strokeDashoffset: `${dash}px` },
                    { opacity: 1, strokeDasharray: array, strokeDashoffset: `${-len}px` },
                ],
                { duration: ms, easing: 'linear' },
            );
        };

        const started = performance.now();
        const last = sample.order.at(-1)?.time ?? 0;
        // A short pause after a cascade that died at once, a longer one to take in a big one.
        const pause = 1200 + Math.min(1800, sample.order.length * 40);
        let next = 0;
        let shownDay = -1;
        let shownCount = -1;
        let ended = 0;
        let raf = 0;
        const frame = (now: number) => {
            const day = Math.min(HORIZON, ((now - started) / 1000) * DAYS_PER_SECOND);
            while (next < sample.order.length && sample.order[next].time <= day) {
                const e = sample.order[next++];
                const g = node(e.node);
                g?.querySelector('.shock__halo')?.animate(HALO, { duration: 1100, easing: 'cubic-bezier(0.2, 0.6, 0.3, 1)' });
                g?.querySelector('.shock__core')?.animate(CORE, { duration: 900, easing: 'ease-out' });
                mark(e);
                for (const c of sample.children[e.k]) {
                    const child = sample.events[c];
                    if (child.node !== e.node && child.time <= HORIZON) travel(`${e.node}>${child.node}`, ((child.time - day) / DAYS_PER_SECOND) * 1000);
                }
            }
            if (Math.floor(day) !== shownDay || next !== shownCount) {
                shownDay = Math.floor(day);
                shownCount = next;
                show(day, next);
            } else {
                cursor?.setAttribute('transform', `translate(${((day / HORIZON) * PLOT_W).toFixed(1)} 0)`);
            }
            if (!ended && day >= Math.min(HORIZON, last + 1)) ended = now;
            if (ended && now - ended > pause) {
                setSeed((s) => s + 1);
                return;
            }
            raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(raf);
    }, [inView, reduce, sample, vertical, dayWord, eventWord, eventsWord]);

    const programmeEvents = sample.order.filter((e) => PROGRAMMES.some((p) => p.i === e.node));
    const sourceName = t(NODES[source].label);

    return (
        <div ref={ref} className="shock">
            <div className="shock__head">
                <h3 className="w-h3">{t('How a disruption spreads')}</h3>
                <p className="shock__lead">
                    {t('Pick the supplier where the trouble starts. Each flash is an event; the line that runs into it shows what set it off.')}
                </p>
            </div>

            <div className="shock__controls" data-interactive="">
                <fieldset className="shock__sources">
                    <legend className="w-label">{t('Trouble starts at')}</legend>
                    <div className="shock__pills">
                        {SUPPLIERS.map((s) => (
                            <label key={s.id} className={`shock__source${source === s.i ? ' is-on' : ''}`}>
                                <input type="radio" name="shock-source" value={s.id} checked={source === s.i} onChange={() => pick(s.i)} />
                                <span>{t(s.label)}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>
                <label className="shock__coupling">
                    <span className="shock__coupling-head">
                        <span>
                            <span className="w-label">{t('Branching ratio')}</span> <span className="shock__sym">ρ(A)</span>
                        </span>
                        <output>{fmt(coupling, 2)}</output>
                    </span>
                    <input type="range" min={K_MIN} max={K_MAX} step={0.01} value={coupling} onChange={(e) => setCoupling(Number(e.target.value))} />
                    <span className="shock__hint">{t('How many events each event sets off, in the long run. At 1, the expected cascade is infinite.')}</span>
                </label>
                <button type="button" className="shock__again" onClick={() => setSeed((s) => s + 1)}>
                    {t('Another cascade')}
                </button>
            </div>

            <div className="shock__stage">
                <svg
                    ref={svgRef}
                    className={`shock__net${vertical ? ' shock__net--upright' : ''}`}
                    viewBox={vertical ? `0 0 ${VW} ${VH}` : `0 0 ${W} ${H}`}
                    role="img"
                    aria-label={t('Illustrative supply network from mines to programmes, with feedback from the programmes back to the mines.')}
                >
                    <defs>
                        <marker id="shock-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                            <path d="M0,0 L8,4 L0,8 z" className="shock__arrowhead" />
                        </marker>
                    </defs>
                    {COLUMNS.map((c, k) =>
                        vertical ? (
                            <text key={c} className="shock__col" x={4} y={k ? TOP + k * ROW - 34 : 22}>
                                {t(c)}
                            </text>
                        ) : (
                            <text key={c} className="shock__col" x={110 + k * 245} y={20} textAnchor="middle">
                                {t(c)}
                            </text>
                        ),
                    )}
                    {EDGES.map((e, k) => (
                        <path
                            key={e.key}
                            data-edge={e.key}
                            className={`shock__edge${e.feedback ? ' shock__edge--back' : ''}`}
                            d={paths[k]}
                            markerEnd={e.feedback ? 'url(#shock-arrow)' : undefined}
                        />
                    ))}
                    {EDGES.map((e, k) => (
                        <path key={e.key} data-pulse={e.key} className="shock__pulse" d={paths[k]} />
                    ))}
                    {!vertical && (
                        <text className="shock__back-label" x={W / 2} y={H - 62} textAnchor="middle">
                            {t('rush orders: trouble downstream lands back on the mines')}
                        </text>
                    )}
                    {NODES.map((n, i) => {
                        const p = at(i);
                        const supplier = n.col === 0;
                        const programme = PROGRAMMES.findIndex((q) => q.i === i);
                        const text = vertical ? (n.col === 0 || n.col === 4 ? lines(t(n.label)) : []) : [oneLine(t(n.label))];
                        return (
                            <g
                                key={n.id}
                                data-node={i}
                                className={`shock__node${supplier ? ' shock__node--pick' : ''}${programme >= 0 ? ` shock__p${programme}` : ''}${source === i ? ' is-source' : ''}`}
                                onClick={supplier ? () => pick(i) : undefined}
                            >
                                <circle className="shock__halo" cx={p.x} cy={p.y} r="26" />
                                <circle className="shock__dot" cx={p.x} cy={p.y} r="8" />
                                <circle className="shock__core" cx={p.x} cy={p.y} r="4.5" />
                                {text.length > 0 && (
                                    <text className="shock__label" x={p.x} y={p.y + 27} textAnchor="middle">
                                        {text.map((l, k) => (
                                            <tspan key={k} x={p.x} dy={k ? '1.25em' : 0}>
                                                {l}
                                            </tspan>
                                        ))}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
                <p ref={clockRef} className="shock__clock" aria-hidden="true">
                    {`${dayWord} 0 · 0 ${eventsWord}`}
                </p>
            </div>

            <div className="shock__panels">
                <section className="shock__panel">
                    <h4 className="shock__h">{t('Where it lands')}</h4>
                    <p className="shock__sub">{t('The chance that each programme is hit, and the events expected there')}</p>
                    <ul className="shock__bars">
                        {PROGRAMMES.map((p, k) => (
                            <li key={p.id} className={`shock__p${k}`}>
                                <span className="shock__bar-name">{t(p.label)}</span>
                                <span className="shock__bar-value">
                                    <strong>{pct(hit[k])}</strong> · {sig(expected[p.i])} {t('expected')}
                                </span>
                                <span className="shock__bar" aria-hidden="true">
                                    <span style={{ width: `${hit[k] * 100}%` }} />
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="shock__panel">
                    <h4 className="shock__h">{t('When it lands')}</h4>
                    <p className="shock__sub">{t('Expected extra events per day at each programme, and this cascade’s events below')}</p>
                    <svg
                        ref={whenRef}
                        className="shock__chart"
                        viewBox="0 0 360 168"
                        role="img"
                        aria-label={t('Curves of the expected extra events per day at each programme over the 180 days after the shock.')}
                    >
                        <g transform="translate(14 22)">
                            <line className="shock__grid" x1="0" y1="0" x2={PLOT_W} y2="0" />
                            <text className="shock__tickl" x="0" y="-7">
                                {sig(curveMax)}
                            </text>
                            {curves.map((c, k) => (
                                <path
                                    key={k}
                                    className={`shock__curve shock__p${k}`}
                                    d={c.map((v, d) => `${d ? 'L' : 'M'}${((d / HORIZON) * PLOT_W).toFixed(1)},${(PLOT_H - (v / curveMax) * PLOT_H).toFixed(1)}`).join(' ')}
                                />
                            ))}
                            <line className="shock__axis" x1="0" y1={PLOT_H} x2={PLOT_W} y2={PLOT_H} />
                            {programmeEvents.map((e) => (
                                <line
                                    key={e.k}
                                    data-event={e.k}
                                    className={`shock__tick shock__p${PROGRAMMES.findIndex((p) => p.i === e.node)}`}
                                    x1={((e.time / HORIZON) * PLOT_W).toFixed(1)}
                                    x2={((e.time / HORIZON) * PLOT_W).toFixed(1)}
                                    y1={PLOT_H + 3}
                                    y2={PLOT_H + 11}
                                />
                            ))}
                            {DAY_TICKS.map((d) => (
                                <text
                                    key={d}
                                    className="shock__tickl"
                                    x={(d / HORIZON) * PLOT_W}
                                    y={PLOT_H + 25}
                                    textAnchor={d === 0 ? 'start' : d === HORIZON ? 'end' : 'middle'}
                                >
                                    {d}
                                </text>
                            ))}
                            <text className="shock__tickl" x={PLOT_W} y={PLOT_H + 40} textAnchor="end">
                                {t('days after the shock')}
                            </text>
                            <line className="shock__cursor" x1="0" y1="0" x2="0" y2={PLOT_H} />
                        </g>
                    </svg>
                    <ul className="shock__legend" aria-hidden="true">
                        {PROGRAMMES.map((p, k) => (
                            <li key={p.id} className={`shock__p${k}`}>
                                {t(p.label)}
                            </li>
                        ))}
                    </ul>
                    <p className="shock__note">{t('Expected activity at the programmes peaks on day {n}.').replace('{n}', t.num(peakDay))}</p>
                </section>

                <section className="shock__panel">
                    <h4 className="shock__h">{t('How big it gets')}</h4>
                    <p className="shock__sub">{t('Events in 2,000 simulated cascades')}</p>
                    <svg
                        className="shock__chart"
                        viewBox="0 0 360 168"
                        role="img"
                        aria-label={t('Histogram of the number of events in 2,000 simulated cascades.')}
                    >
                        <g transform="translate(14 22)">
                            <line className="shock__grid" x1="0" y1="0" x2={PLOT_W} y2="0" />
                            <text className="shock__tickl" x="0" y="-7">
                                {pct(shareMax)}
                            </text>
                            {runs.share.map((s, k) => {
                                const h = s > 0 ? Math.max(1.5, (s / shareMax) * PLOT_H) : 0;
                                return (
                                    <rect
                                        key={k}
                                        className={`shock__col-bar${k >= binOf(runs.p95) ? ' is-tail' : ''}`}
                                        x={k * BIN_W + 2}
                                        y={PLOT_H - h}
                                        width={BIN_W - 4}
                                        height={h}
                                    />
                                );
                            })}
                            <line className="shock__axis" x1="0" y1={PLOT_H} x2={PLOT_W} y2={PLOT_H} />
                            {BINS.map((_, k) => (
                                <text key={k} className="shock__tickl" x={k * BIN_W + 2} y={PLOT_H + 25}>
                                    {k ? BINS[k - 1] + 1 : 1}
                                </text>
                            ))}
                            <text className="shock__tickl" x={PLOT_W} y={PLOT_H + 40} textAnchor="end">
                                {t('events in the cascade')}
                            </text>
                        </g>
                    </svg>
                    <p className="shock__note">
                        {t('The 2,000 runs average {mean} ± {ci} events (95% confidence); the formula says {formula}.')
                            .replace('{mean}', fmt(runs.mean, ciDigits))
                            .replace('{ci}', fmt(runs.ci, ciDigits))
                            .replace('{formula}', fmt(formulaTotal, ciDigits))}{' '}
                        <strong>{t('1 in 20 cascades reaches {q} or more.').replace('{q}', t.num(runs.p95))}</strong>
                    </p>
                </section>
            </div>

            <div className="shock__math">
                <h4 className="shock__h">{t('The mathematics')}</h4>
                <div className="shock__eqs">
                    {MATH.map((m) => (
                        <div key={m.caption} className="shock__eq">
                            <div className="shock__formula" dangerouslySetInnerHTML={{ __html: m.ml }} />
                            <p>{t(m.caption)}</p>
                        </div>
                    ))}
                </div>
                <p className="shock__defs">
                    {t('A = [αᵢⱼ]: how many events at i one event at j sets off. 1/β = {delay} days, the mean delay.').replace('{delay}', t.num(MEAN_DELAY_DAYS))}{' '}
                    {t('As set now ({source}): ρ(A) = {rho}, and {total} events in all on average.')
                        .replace('{source}', sourceName)
                        .replace('{rho}', fmt(kappa, 2))
                        .replace('{total}', fmt(formulaTotal, 1))}
                </p>
            </div>
        </div>
    );
}
