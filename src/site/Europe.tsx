import { useEffect, useRef, useState } from 'react';
import { createGlobe, type Globe, type GlobeView } from './globe';
import { Note, Words } from './ui';

const EOX = 'https://cloudless.eox.at';
const CC_BY_4 = 'https://creativecommons.org/licenses/by/4.0/';

/** Where PRISM's materials are designed and where they are made. */
const PLACES = [
    { name: 'Giessen', role: 'Designed here', lat: 50.587, lon: 8.678 },
    { name: 'Wrocław', role: 'Made here', lat: 51.108, lon: 17.039 },
];

/** From the Atlantic to the middle of Europe, closing in on the way. */
const FROM = { lon: -64, lat: 14, zoom: 0.92 };
const TO = { lon: 13, lat: 49.5, zoom: 2.3 };
/** Share of the scroll spent travelling; the rest holds on Europe. */
const TRAVEL = 0.72;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Screens wider than tall and not too short show the Earth beside the text. */
const SIDE = '(min-aspect-ratio: 1/1) and (min-height: 501px)';
/** There the scene is pinned and scroll turns the Earth; elsewhere it turns as it passes. */
const PINNED = `${SIDE} and (prefers-reduced-motion: no-preference)`;
const REDUCED = '(prefers-reduced-motion: reduce)';

/**
 * Why Europe: the Earth turns from the Atlantic to Europe as you scroll, and the two places PRISM
 * works from light up. The map is real (EOxCloudless 2016, CC BY 4.0); without WebGL 2, ESA's
 * photograph of Europe stands in.
 */
export default function Europe() {
    const section = useRef<HTMLElement>(null);
    const box = useRef<HTMLDivElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const pins = useRef<(HTMLSpanElement | null)[]>([]);
    const [noGL, setNoGL] = useState(false);
    const [arrived, setArrived] = useState(false);
    const arrivedRef = useRef(false);

    useEffect(() => {
        const sec = section.current;
        const el = box.current;
        const cv = canvas.current;
        if (!sec || !el || !cv) return;

        let globe: Globe | null = null;
        let raf = 0;
        let near = false;
        const sideMq = window.matchMedia(SIDE);
        const pinnedMq = window.matchMedia(PINNED);
        const reducedMq = window.matchMedia(REDUCED);

        const progress = () => {
            if (reducedMq.matches) return 1;
            const vh = window.innerHeight;
            if (pinnedMq.matches) {
                const r = sec.getBoundingClientRect();
                return clamp01(-r.top / Math.max(1, r.height - vh));
            }
            // Not pinned: turn while the globe travels from the bottom of the screen to above the middle.
            const r = el.getBoundingClientRect();
            return clamp01((vh - (r.top + r.height / 2)) / (0.6 * vh));
        };

        const frame = () => {
            raf = 0;
            if (!globe) return;
            const p = progress();
            const t = ease(clamp01(p / TRAVEL));
            const w = el.clientWidth;
            const h = el.clientHeight;
            const side = sideMq.matches;
            const zoom = FROM.zoom + (TO.zoom - FROM.zoom) * t;
            // Beside the text, the Earth sits to the right of the screen; otherwise it fills its own box.
            const base = side ? 0.44 * Math.min(w * 0.62, h) : 0.46 * Math.min(w, h);
            const view: GlobeView = {
                lon: FROM.lon + (TO.lon - FROM.lon) * t,
                lat: FROM.lat + (TO.lat - FROM.lat) * t,
                cx: side ? w * 0.66 : w / 2,
                cy: side ? h * 0.54 : h / 2,
                r: base * zoom,
            };
            globe.draw(view);
            const here = p >= TRAVEL * 0.9;
            PLACES.forEach((pl, i) => {
                const pin = pins.current[i];
                if (!pin) return;
                const q = globe!.project(view, pl.lat, pl.lon);
                pin.style.transform = `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px)`;
                pin.dataset.show = here && q.front > 0.15 ? 'true' : 'false';
            });
            if (here !== arrivedRef.current) {
                arrivedRef.current = here;
                setArrived(here);
            }
        };
        const schedule = () => {
            if (!raf && near) raf = requestAnimationFrame(frame);
        };

        const start = () => {
            if (globe) return;
            globe = createGlobe(cv, '/img/earth-s2cloudless-4096.webp', schedule);
            if (!globe) {
                setNoGL(true);
                return;
            }
            schedule();
        };

        // Load the map only when the section comes near, and only work while it is on screen.
        const io = new IntersectionObserver(
            ([e]) => {
                near = e.isIntersecting;
                if (near) {
                    start();
                    schedule();
                }
            },
            { rootMargin: '100% 0px' },
        );
        io.observe(sec);
        const ro = new ResizeObserver(() => {
            globe?.resize();
            schedule();
        });
        ro.observe(el);
        const onChange = () => schedule();
        window.addEventListener('scroll', schedule, { passive: true });
        [sideMq, pinnedMq, reducedMq].forEach((mq) => mq.addEventListener('change', onChange));
        return () => {
            io.disconnect();
            ro.disconnect();
            window.removeEventListener('scroll', schedule);
            [sideMq, pinnedMq, reducedMq].forEach((mq) => mq.removeEventListener('change', onChange));
            cancelAnimationFrame(raf);
            globe?.destroy();
        };
    }, []);

    return (
        <section
            ref={section}
            id="europe"
            className={`europe${arrived || noGL ? ' is-arrived' : ''}${noGL ? ' is-flat' : ''}`}
            data-theme="navy"
            data-nav="navy"
            aria-labelledby="europe-title"
        >
            <div className="europe__stage">
                <div
                    ref={box}
                    className="europe__globe"
                    role="img"
                    aria-label="A satellite view of the Earth turning to Europe, with Giessen and Wrocław marked."
                >
                    <canvas ref={canvas} className="europe__canvas" aria-hidden="true" />
                    {noGL && (
                        <img
                            className="europe__flat"
                            src="/img/esa-europe-1280.webp"
                            alt=""
                            width={1280}
                            height={853}
                            loading="lazy"
                        />
                    )}
                    {PLACES.map((pl, i) => (
                        <span
                            key={pl.name}
                            ref={(n) => {
                                pins.current[i] = n;
                            }}
                            className={`europe__pin europe__pin--${i}`}
                            data-show="false"
                            aria-hidden="true"
                        >
                            <i />
                            <span className="europe__tag">
                                <b>{pl.name}</b>
                                <span>{pl.role}</span>
                            </span>
                        </span>
                    ))}
                    {!noGL && (
                        <p className="europe__credit">
                            Earth:{' '}
                            <a href={EOX} target="_blank" rel="noopener noreferrer">
                                EOxCloudless
                            </a>{' '}
                            by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2016),{' '}
                            <a href={CC_BY_4} target="_blank" rel="noopener noreferrer license">
                                CC BY 4.0
                            </a>
                        </p>
                    )}
                </div>
                <div className="wrap europe__inner">
                    <p className="w-label europe__kicker">Why Europe</p>
                    <h2 id="europe-title" className="w-h2">
                        <Words>Europe depends on others for key materials.</Words>
                    </h2>
                    <div className="europe__more">
                        <p className="w-lead europe__lead">
                            For some critical raw materials, the EU relies almost entirely on one country.
                        </p>
                        <dl className="europe__facts">
                            <div>
                                <dt>65%</dt>
                                <dd>By 2030, the EU wants no more than this share of any strategic raw material to come from one outside country.</dd>
                            </div>
                            <div>
                                <dt>SX500</dt>
                                <dd>No existing alloy could survive inside SpaceX’s Raptor engine, so SpaceX made its own.</dd>
                            </div>
                        </dl>
                        <p className="europe__close">
                            We design new alloys in Giessen, and Bimo Tech makes them in Wrocław.
                        </p>
                        <div className="europe__foot">
                            <Note>
                                EU Critical Raw Materials Act, Regulation (EU) 2024/1252, recital 12 and Article 5. SX500:
                                Elon Musk, 23 December 2018 and 25 May 2019.
                            </Note>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
