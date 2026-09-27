import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { seeded, useInView } from '../site/hooks';
import { useLive } from './slideContext';

/* ── The market, as dots: one for every EU aerospace company ──────────── */

// From the `EU Market` sheet of the PRISM financial model (research refresh, 27 Jul 2026).
const ALL = 472;
const FIT = 189;
const REACH = 80;

const COLS = 32;
const PITCH = 22;
const ROWS = Math.ceil(ALL / COLS);
const W = COLS * PITCH;
const H = ROWS * PITCH;

/** Which dots fit and which we can reach, scattered the same way on every visit. */
function build() {
    const rnd = seeded(48);
    const order = Array.from({ length: ALL }, (_, i) => i);
    for (let i = ALL - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
    }
    const kind = new Array<number>(ALL).fill(0);
    order.slice(0, FIT).forEach((i) => (kind[i] = 1));
    order.slice(0, REACH).forEach((i) => (kind[i] = 2));
    const delay = Array.from({ length: ALL }, () => Math.round(rnd() * 600));
    return { kind, delay };
}
const DOTS = build();

const FUNNEL = [
    { n: '472', text: 'aerospace companies in the EU with 20 or more staff' },
    { n: '189', text: 'work on what we make: materials, propulsion, qualification' },
    { n: '80', text: 'we can reach through our network, 2026 to 2031' },
    { n: '€48M', text: 'a year: what these 80 spend on developing and qualifying materials, about €600k each' },
];

const STEP_MS = 1500;

/**
 * 472 dots narrow to the 189 that fit and the 80 we can reach, and the steps beside them light up
 * in turn. It plays when the slide arrives (in the phone reader, when it scrolls into view); without
 * motion every step shows at once.
 */
export function MarketFunnel() {
    const { live, reader, reduced } = useLive();
    const [ref, seen] = useInView<HTMLDivElement>('0px 0px -20% 0px', true);
    const play = live && (!reader || seen);
    const [run, setRun] = useState(-1);

    useEffect(() => {
        if (!play) return;
        const timers = FUNNEL.map((_, s) => window.setTimeout(() => setRun(s), 250 + s * STEP_MS));
        return () => {
            timers.forEach(clearTimeout);
            setRun(-1);
        };
    }, [play]);

    const stage = play ? run : reduced ? 3 : -1;
    const at = FUNNEL.map((_, s) => (stage >= s ? ` at-${s}` : '')).join('');

    return (
        <div ref={ref} className={`d-funnel${at}`}>
            <svg
                className="d-funnel__dots"
                viewBox={`0 0 ${W} ${H}`}
                role="img"
                aria-label="472 dots, one for every aerospace company in the EU with 20 or more staff. 189 are marked as a fit for what we make, and 80 of those as companies we can reach."
            >
                {DOTS.kind.map((k, i) => (
                    <circle
                        key={i}
                        className={`k${k}`}
                        cx={(i % COLS) * PITCH + PITCH / 2}
                        cy={Math.floor(i / COLS) * PITCH + PITCH / 2}
                        r={5}
                        style={{ '--d': `${DOTS.delay[i]}ms` } as CSSProperties}
                    />
                ))}
            </svg>
            <ol className="d-funnel__steps">
                {FUNNEL.map((s, i) => (
                    <li key={s.n} data-on={stage >= i ? 'true' : 'false'} className={`d-funnel__step--${i}`}>
                        <strong>{s.n}</strong>
                        <span>{s.text}</span>
                    </li>
                ))}
            </ol>
        </div>
    );
}

/* ── How we earn: one line, from the first contract to licensing ──────── */

const EARN = [
    { name: 'Programme', text: 'A development contract, judged on your requirements' },
    { name: 'Pilot', text: 'A first trial on your problem' },
    { name: 'Deployment', text: 'PRISM run by us for your programme' },
    { name: 'Support', text: 'Updates, recalibration, traceable data' },
    { name: 'Supply', text: 'The material, made at scale by Bimo Tech' },
    { name: 'Licensing', text: 'The right to use what we develop' },
];

/** The six ways we are paid, on one line, with a light that runs along it while the slide is up. */
export function EarnLine() {
    const { live, reader } = useLive();
    const [ref, seen] = useInView<HTMLDivElement>('0px 0px -10% 0px', true);
    const play = live && (!reader || seen);
    return (
        <div ref={ref} className={`d-earn${play ? ' is-live' : ''}`}>
            <p className="pm-column">How we earn</p>
            <div className="d-earn__track">
                <ol className="d-earn__line">
                    {EARN.map((e, i) => (
                        <li key={e.name} style={{ '--i': i } as CSSProperties}>
                            <i aria-hidden="true" />
                            <b>{e.name}</b>
                            <span>{e.text}</span>
                        </li>
                    ))}
                </ol>
                <span className="d-earn__light" aria-hidden="true" />
            </div>
            <p className="d-earn__open">
                <span className="pm-data-label">Open source</span> Some of our tools are free to use and check. Our own models are
                not: cluster expansions, short-range order, property prediction. We license them.
            </p>
        </div>
    );
}
