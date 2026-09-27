import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { hitProbability, scale, simulateCascade } from './hawkes';
import { seeded, useInView, useMediaQuery, useReducedMotion } from './hooks';
import { useT } from './i18n';
import { BASE, COLUMNS, LINKS, MEAN_DELAY_DAYS, NODES, PROGRAMMES, SUPPLIERS, index } from './supply-model';

/**
 * How a disruption spreads through a supply network. Pick the supplier where it starts and how strong the
 * knock-on effects are; the network plays cascades drawn from a Hawkes process, each event reached by a
 * pulse from the event that set it off, and below it each programme's chance of being hit, computed
 * exactly. The mathematics is in hawkes.ts; the network, made up, in supply-model.ts.
 */

const BETA = 1 / MEAN_DELAY_DAYS;
/** The days one cascade is played for. */
const HORIZON = 180;
const DAYS_PER_SECOND = 12;
/** The slider's range: the branching ratio ρ(A), how many events each event sets off in the long run. */
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

const SOFT_HYPHEN = String.fromCharCode(0xad);

/** A label on one line, without the soft hyphens that let long German words break in running text. */
const oneLine = (s: string) => s.split(SOFT_HYPHEN).join('');

/** A label on upright phones: a line per word, and long German words broken where they carry a soft hyphen. */
const lines = (s: string) => s.split(' ').flatMap((w) => w.split(SOFT_HYPHEN).map((part, k, all) => (k < all.length - 1 ? `${part}-` : part)));

/* ── How an event lights up: Web Animations, so a burst of events costs no layout work ── */

const HALO: Keyframe[] = [
    { opacity: 0.75, transform: 'scale(0.3)' },
    { opacity: 0, transform: 'scale(1.3)' },
];
const CORE: Keyframe[] = [{ opacity: 1 }, { opacity: 0 }];

export default function SupplyShock() {
    const t = useT();
    const locale = t.lang === 'de' ? 'de-DE' : 'en-GB';
    // Two significant digits, so that small chances stay readable: 24 %, 0.46 %.
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
    /** The exact chance that the cascade reaches each programme. */
    const hit = useMemo(() => PROGRAMMES.map((p) => hitProbability(A, source, p.i)), [A, source]);

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
    const clockRef = useRef<HTMLParagraphElement>(null);
    const dayWord = t('Day');
    const eventWord = t('event');
    const eventsWord = t('events');

    useEffect(() => {
        const svg = svgRef.current;
        const clock = clockRef.current;
        if (!svg || !clock) return;
        const node = (i: number) => svg.querySelector<SVGGElement>(`[data-node="${i}"]`);
        const show = (day: number, count: number) => {
            clock.textContent = `${dayWord} ${Math.floor(day)} · ${count} ${count === 1 ? eventWord : eventsWord}`;
        };
        /** What stays lit until the next cascade: the nodes it reached and the links it took. */
        const mark = (e: (typeof sample.order)[number]) => {
            node(e.node)?.classList.add('was-hit');
            if (e.parent >= 0) svg.querySelector(`[data-edge="${sample.events[e.parent].node}>${e.node}"]`)?.classList.add('was-hit');
        };
        svg.querySelectorAll('.was-hit').forEach((el) => el.classList.remove('was-hit'));

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

    return (
        <div ref={ref} className="shock">
            <div className="shock__head">
                <h3 className="w-h3">{t('How a disruption spreads')}</h3>
                <p className="shock__lead">{t('Pick the supplier where trouble starts, then watch it spread to the programmes that depend on it.')}</p>
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
                    <span className="w-label">{t('Knock-on effects')}</span>
                    <input type="range" min={K_MIN} max={K_MAX} step={0.01} value={coupling} onChange={(e) => setCoupling(Number(e.target.value))} />
                    <span className="shock__ends" aria-hidden="true">
                        <span>{t('weak')}</span>
                        <span>{t('strong')}</span>
                    </span>
                </label>
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

            <div className="shock__odds">
                <p className="w-label">{t('Chance each programme is hit')}</p>
                <ul>
                    {PROGRAMMES.map((p, k) => (
                        <li key={p.id} className={`shock__p${k}`}>
                            <span className="shock__odds-name">{t(p.label)}</span>
                            <strong>{pct(hit[k])}</strong>
                            <span className="shock__bar" aria-hidden="true">
                                <span style={{ width: `${hit[k] * 100}%` }} />
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <p className="shock__also">
                {t('We use the same model to forecast how a material degrades: sensor readings become events, and the model predicts when a part will fail.')}
            </p>
        </div>
    );
}
