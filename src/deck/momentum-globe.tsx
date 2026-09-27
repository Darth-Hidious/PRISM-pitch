import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { createGlobe, projectPoint, type Globe, type GlobeView } from '../site/globe';
import { useLive } from './slideContext';

const EOX = 'https://cloudless.eox.at';
const CC_BY_4 = 'https://creativecommons.org/licenses/by/4.0/';
const MAP = '/img/earth-s2cloudless-4096.webp';
/** The still frame, drawn from the same map, for browsers without WebGL 2. */
const STILL_IMG = '/img/momentum-globe.webp';

/**
 * Where the money went, and where PRISM is. Each tag sits at a fixed offset from its place, joined
 * by a short line; the offsets keep the close places on the US east coast apart.
 */
const PLACES: { names: string[]; lat: number; lon: number; dx: number; dy: number; at: 'r' | 'l' | 't'; ours?: boolean }[] = [
    { names: ['Periodic Labs', 'Discovery Loop'], lat: 37.44, lon: -122.16, dx: 12, dy: -28, at: 'r' },
    { names: ['Lila Sciences'], lat: 42.37, lon: -71.11, dx: 35, dy: 40, at: 'r' },
    { names: ['Radical AI'], lat: 40.71, lon: -74.01, dx: 46, dy: 62, at: 'r' },
    { names: ['Genesis Mission'], lat: 38.9, lon: -77.04, dx: 58, dy: 83, at: 'r' },
    { names: ['Mirdyne, Giessen'], lat: 50.587, lon: 8.678, dx: -18, dy: 26, at: 'l', ours: true },
    { names: ['Bimo Tech, Wrocław'], lat: 51.108, lon: 17.039, dx: 8, dy: -30, at: 't', ours: true },
];

/** Over the North Atlantic: California on one side, Europe on the other. */
const STILL = { lon: -48, lat: 40 };
/** The turn starts over the Pacific. */
const START = { lon: -150, lat: 28 };
const TURN_MS = 3400;
/** After the turn, the Earth sways a little either side of the still. */
const SWAY = 8;
const SWAY_MS = 24000;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function at(ms: number) {
    if (ms < TURN_MS) {
        const e = ease(ms / TURN_MS);
        return { lon: START.lon + (STILL.lon - START.lon) * e, lat: START.lat + (STILL.lat - START.lat) * e };
    }
    return { lon: STILL.lon + SWAY * Math.sin((2 * Math.PI * (ms - TURN_MS)) / SWAY_MS), lat: STILL.lat };
}

/**
 * The market momentum globe: a real Earth (EOxCloudless 2016, CC BY 4.0) turns from the Pacific to
 * the Atlantic when the slide arrives, and each company lights up as it comes round. Without motion
 * it holds still over the Atlantic; without WebGL 2 a picture of that still stands in.
 */
export function MomentumGlobe() {
    const box = useRef<HTMLDivElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const pins = useRef<(HTMLSpanElement | null)[]>([]);
    const [noGL, setNoGL] = useState(false);
    const [still, setStill] = useState<{ left: number; top: number; size: number } | null>(null);
    const { live, active, reader } = useLive();

    useEffect(() => {
        const el = box.current;
        const cv = canvas.current;
        if (!el || !cv) return;

        let globe: Globe | null = null;
        let failed = false;
        let raf = 0;
        let start = 0;
        let seen = !reader;

        /** The disc for a centre, in the box's own (unscaled) pixels. */
        const place = (c: { lon: number; lat: number }): GlobeView => {
            const w = el.clientWidth;
            const h = el.clientHeight;
            return { lon: c.lon, lat: c.lat, cx: w / 2, cy: h / 2, r: 0.43 * Math.min(w, h) };
        };

        // Tag widths, measured once per size; a tag shows only once it fits beside its place.
        let widths: number[] = [];
        const pinsAt = (view: GlobeView) => {
            const w = el.clientWidth;
            PLACES.forEach((pl, i) => {
                const pin = pins.current[i];
                if (!pin) return;
                const q = projectPoint(view, pl.lat, pl.lon);
                const tw = (widths[i] ??= (pin.querySelector('.d-globe__tag') as HTMLElement | null)?.offsetWidth ?? 0);
                const x = q.x + pl.dx;
                const [from, to] = pl.at === 'r' ? [x, x + tw] : pl.at === 'l' ? [x - tw, x] : [x - tw / 2, x + tw / 2];
                pin.style.transform = `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px)`;
                pin.dataset.show = q.front > 0.2 && from >= -8 && to <= w + 8 ? 'true' : 'false';
            });
        };

        const draw = (view: GlobeView) => {
            pinsAt(view);
            if (!globe) return;
            // The stage is scaled to the screen; the canvas backing follows the scaled size.
            const k = cv.getBoundingClientRect().width / Math.max(1, cv.offsetWidth);
            globe.draw({ ...view, cx: view.cx * k, cy: view.cy * k, r: view.r * k });
        };

        const showStill = () => {
            const v = place(STILL);
            pinsAt(v);
            setStill({ left: v.cx - 1.12 * v.r, top: v.cy - 1.12 * v.r, size: 2.24 * v.r });
        };

        const moving = () => live && seen && (reader || active);

        const frame = (now: number) => {
            raf = 0;
            if (!start) start = now;
            draw(place(at(now - start)));
            if (moving()) raf = requestAnimationFrame(frame);
        };

        const paint = () => {
            cancelAnimationFrame(raf);
            raf = 0;
            if (failed) return showStill();
            if (!globe) return;
            globe.resize();
            if (moving()) raf = requestAnimationFrame(frame);
            else draw(place(STILL));
        };

        const begin = () => {
            if (globe || failed) return paint();
            globe = createGlobe(cv, MAP, paint);
            if (!globe) {
                failed = true;
                setNoGL(true);
            }
            paint();
        };

        // On the stage, only the slide on screen draws. In the reader, the globe waits to be scrolled to.
        let io: IntersectionObserver | null = null;
        if (reader) {
            io = new IntersectionObserver(
                ([e]) => {
                    if (e.isIntersecting && !seen) {
                        seen = true;
                        start = 0;
                    }
                    if (e.isIntersecting) begin();
                    else cancelAnimationFrame(raf);
                },
                { rootMargin: '25% 0px' },
            );
            io.observe(el);
        } else if (active) {
            start = 0;
            begin();
        }

        const onResize = () => {
            widths = [];
            if (globe || failed) paint();
        };
        const ro = new ResizeObserver(onResize);
        ro.observe(el);
        window.addEventListener('resize', onResize);
        return () => {
            io?.disconnect();
            ro.disconnect();
            window.removeEventListener('resize', onResize);
            cancelAnimationFrame(raf);
            globe?.destroy();
        };
    }, [live, active, reader]);

    return (
        <figure className={`d-globe${noGL ? ' is-flat' : ''}`}>
            <div
                ref={box}
                className="d-globe__box"
                role="img"
                aria-label="A globe turning from the Pacific to the Atlantic. Marked: Periodic Labs and Discovery Loop in California; Lila Sciences, Radical AI and the Genesis Mission on the US east coast; Mirdyne in Giessen and Bimo Tech in Wrocław."
            >
                <canvas ref={canvas} className="d-globe__canvas" aria-hidden="true" />
                {noGL && still && (
                    <img
                        className="d-globe__still"
                        src={STILL_IMG}
                        alt=""
                        width={1120}
                        height={1120}
                        style={{ left: still.left, top: still.top, width: still.size, height: still.size }}
                    />
                )}
                {PLACES.map((pl, i) => (
                    <span
                        key={pl.names[0]}
                        ref={(n) => {
                            pins.current[i] = n;
                        }}
                        className={`d-globe__pin${pl.ours ? ' d-globe__pin--ours' : ''}`}
                        data-show="false"
                        aria-hidden="true"
                        style={{ '--dx': `${pl.dx}px`, '--dy': `${pl.dy}px`, '--i': i } as CSSProperties}
                    >
                        <svg className="d-globe__lead" width="1" height="1">
                            <line x1="0" y1="0" x2={pl.dx} y2={pl.dy} />
                        </svg>
                        <i />
                        <span className={`d-globe__tag d-globe__tag--${pl.at}`}>
                            {pl.names.map((n) => (
                                <b key={n}>{n}</b>
                            ))}
                        </span>
                    </span>
                ))}
            </div>
            <figcaption className="d-globe__credit">
                Earth:{' '}
                <a href={EOX} target="_blank" rel="noopener noreferrer">
                    EOxCloudless
                </a>{' '}
                by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2016),{' '}
                <a href={CC_BY_4} target="_blank" rel="noopener noreferrer license">
                    CC BY 4.0
                </a>
            </figcaption>
        </figure>
    );
}
