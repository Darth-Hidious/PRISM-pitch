import { useEffect, useRef } from 'react';
import { Idx, Words } from './ui';

/** Our own photographs, as taken: cropped, never retouched. In order, from raw metal to a part. */
const PHOTOS = [
    {
        src: '/img/spark-charge.webp',
        alt: 'Small pieces of raw metal spread out on a paper towel before a melt.',
        caption: 'Raw metals, ready to melt',
    },
    {
        src: '/img/spark-hearth-charge-sq.webp',
        alt: 'Close-up of a copper hearth: small pieces of raw metal loaded into its hollows.',
        caption: 'Loaded into the hearth',
    },
    {
        src: '/img/spark-melt.webp',
        alt: 'Looking through the viewport of an arc-melting furnace: a small alloy button glows orange inside.',
        caption: 'Melted with an electric arc',
    },
    {
        src: '/img/spark-button.webp',
        alt: 'A cast alloy button with a crystalline surface pattern, resting in a red lid on a lab bench.',
        caption: 'An alloy button, as cast',
    },
    {
        src: '/img/machining.webp',
        alt: 'A machined metal block covered in bright curled metal chips, with milled channels beside them.',
        caption: 'Machined to shape',
    },
];

/** Narrower screens: the row is wider than the screen, so scrolling down slides it across. */
const SLIDE = '(max-width: 900px) and (prefers-reduced-motion: no-preference)';

/**
 * Home: the ideas are real metal. The lab, then five photographs from raw metal to a machined part.
 * Nothing here scrolls sideways: where the row is wider than the screen, the section holds still and
 * the page's own scroll moves the photographs across, the way Apple's product pages do.
 */
export default function Made({ n = '02' }: { n?: string }) {
    const pin = useRef<HTMLDivElement>(null);
    const stage = useRef<HTMLDivElement>(null);
    const track = useRef<HTMLUListElement>(null);
    const bar = useRef<HTMLElement>(null);

    useEffect(() => {
        const p = pin.current;
        const st = stage.current;
        const tr = track.current;
        const b = bar.current;
        if (!p || !st || !tr || !b) return;
        const mq = window.matchMedia(SLIDE);
        let travel = 0;
        let raf = 0;

        const update = () => {
            raf = 0;
            if (!mq.matches || travel <= 0) return;
            const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0;
            const r = p.getBoundingClientRect();
            const room = r.height - st.getBoundingClientRect().height;
            const t = Math.min(1, Math.max(0, (nav - r.top) / Math.max(1, room)));
            tr.style.transform = `translate3d(${(-t * travel).toFixed(1)}px, 0, 0)`;
            b.style.transform = `scaleX(${t.toFixed(4)})`;
        };
        const schedule = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };

        // How far the row must travel, and so how much extra page the section holds still for.
        const measure = () => {
            if (!mq.matches) {
                travel = 0;
                p.style.height = '';
                tr.style.transform = '';
                b.style.transform = '';
                return;
            }
            // Offsets are measured inside the row itself (it is positioned), so the slide does not skew them.
            const last = tr.lastElementChild as HTMLElement | null;
            const end = parseFloat(getComputedStyle(tr).paddingRight) || 0;
            travel = last ? Math.max(0, last.offsetLeft + last.offsetWidth + end - tr.clientWidth) : 0;
            p.style.height = `${Math.round(st.getBoundingClientRect().height + travel)}px`;
            schedule();
        };

        const ro = new ResizeObserver(measure);
        ro.observe(st);
        ro.observe(tr);
        mq.addEventListener('change', measure);
        window.addEventListener('scroll', schedule, { passive: true });
        measure();
        return () => {
            ro.disconnect();
            mq.removeEventListener('change', measure);
            window.removeEventListener('scroll', schedule);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <section id="made" className="sec made" data-theme="paper" data-nav="paper" aria-labelledby="made-title">
            <figure className="made__lab">
                <img
                    src="/img/lab-melt-spinner.webp"
                    srcSet="/img/lab-melt-spinner-1200.webp 1200w, /img/lab-melt-spinner.webp 1932w"
                    sizes="100vw"
                    alt="A melt spinner in a university materials lab: a steel vacuum sphere with a round window, its power supply and gas bottles beside it."
                    width={1932}
                    height={1287}
                    loading="lazy"
                />
            </figure>
            <div ref={pin} className="made__pin">
                <div ref={stage} className="made__stage">
                    <div className="wrap made__inner">
                        <header className="made__head rv">
                            <Idx n={n}>Made for real</Idx>
                            <h2 id="made-title" className="w-h2">
                                <Words>An idea only counts once it is metal.</Words>
                            </h2>
                        </header>
                        <div className="made__view rv">
                            <ul ref={track} className="made__grid" aria-label="From raw metal to a machined part, in five photographs">
                                {PHOTOS.map((ph, i) => (
                                    <li key={ph.src}>
                                        <figure>
                                            <img src={ph.src} alt={ph.alt} width={1000} height={1000} loading="lazy" />
                                            <figcaption>
                                                <span className="made__step">{String(i + 1).padStart(2, '0')}</span>
                                                {ph.caption}
                                            </figcaption>
                                        </figure>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <span className="made__progress" aria-hidden="true">
                            <i ref={bar} />
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
