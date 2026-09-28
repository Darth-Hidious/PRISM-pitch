import { useEffect, useRef, type ReactElement } from 'react';
import { useT } from './i18n';
import { ChooseDrawing, ClassesDrawing, DedDrawing, GenerateDrawing, LiteratureDrawing, RequirementDrawing } from './route-drawings';
import { Idx, Note, Words } from './ui';

/**
 * Before any metal: the design steps, drawn. It starts from the customer's requirement, not from the
 * metal: PRISM reads the literature on it, we pick the classes of material worth researching, our
 * generative models propose recipes in them, and the best few are chosen.
 */
const DESIGN: { Art: () => ReactElement; caption: string; note: string }[] = [
    { Art: RequirementDrawing, caption: 'Your requirement', note: 'What the part must survive, and what it has to beat.' },
    { Art: LiteratureDrawing, caption: 'PRISM reads the literature', note: 'Papers and data on your requirement, with their sources.' },
    { Art: ClassesDrawing, caption: 'Classes worth researching', note: 'The families of material that could meet it.' },
    {
        Art: GenerateDrawing,
        caption: 'Our generative models propose recipes',
        note: 'They build each recipe step by step; the better a recipe, the more of the flow reaches it.',
    },
    { Art: ChooseDrawing, caption: 'The best few are chosen', note: 'Several models judge each one; where they disagree, an exact calculation decides.' },
];

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
        alt: 'A metal block being milled down: bright curled chips cover it, with milled channels beside them.',
        caption: 'Milled down',
    },
];

/**
 * The steps after milling. Our own photograph of a coupon; for the steps we have no photographs of our own
 * of yet, photographs of the same steps in other labs (credited in the Impressum, credits-data.ts), and a
 * drawing where no free photograph was good enough.
 */
type Later = { caption: string; note?: string } & ({ src: string; alt: string } | { Art: () => ReactElement });
const LATER: Later[] = [
    {
        src: '/img/route-powder.webp',
        alt: 'Metal powder for 3D printing under an electron microscope: tiny, almost perfect spheres.',
        caption: 'Made into powder',
    },
    {
        src: '/img/route-powder-bed.webp',
        alt: 'Through the tinted safety window of a laser powder-bed printer: small test pieces stand in the metal powder they were printed from.',
        caption: 'Printed in a powder bed',
        note: 'LPBF: research at Fraunhofer IAPT, industrial at Bimo Tech.',
    },
    { Art: DedDrawing, caption: 'Or built up by DED', note: 'Directed energy deposition.' },
    {
        src: '/img/ippt-coupon.webp',
        alt: 'A small round test coupon held between two fingers in the lab at IPPT PAN, Warsaw.',
        caption: 'Coupons, then tests',
        note: 'Density and flaws first, then real conditions.',
    },
];

/** With motion, on every screen: the row is wider than the screen, so scrolling down slides it across. */
const SLIDE = '(prefers-reduced-motion: no-preference)';

/**
 * Home: from the customer's requirement to tested metal. The lab, then the design steps, drawn, then the route from raw metal to a tested coupon: our own
 * photographs up to the milled chips, then the steps we have no photographs of our own of yet.
 * Nothing here scrolls sideways: where the row is wider than the screen, the section holds still and
 * the page's own scroll moves the photographs across, the way Apple's product pages do.
 */
export default function Made({ n = '02' }: { n?: string }) {
    const pin = useRef<HTMLDivElement>(null);
    const stage = useRef<HTMLDivElement>(null);
    const track = useRef<HTMLUListElement>(null);
    const bar = useRef<HTMLElement>(null);
    const t = useT();

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
                    alt={t('A melt spinner in a university materials lab: a steel vacuum sphere with a round window, its power supply and gas bottles beside it.')}
                    width={1932}
                    height={1287}
                    loading="lazy"
                />
            </figure>
            <div ref={pin} className="made__pin">
                <div ref={stage} className="made__stage">
                    <div className="wrap made__inner">
                        <header className="made__head rv">
                            <Idx n={n}>{t('From your requirement to tested metal')}</Idx>
                            <h2 id="made-title" className="w-h2">
                                <Words>{t('We design it, then we make it.')}</Words>
                            </h2>
                            <Note label={t('Photos')}>
                                {t('01 to 05 are drawn. 06 to 10 and 14 are our own photographs. 11 and 12 show the same steps in other labs, until we have our own; 13 is drawn.')}
                            </Note>
                        </header>
                        <div className="made__view rv">
                            <ul ref={track} className="made__grid" aria-label={t('From your requirement to a tested coupon, in fourteen steps')}>
                                {DESIGN.map((step, i) => (
                                    <li key={step.caption} className="made__design">
                                        <figure>
                                            <div className="made__art">
                                                <step.Art />
                                            </div>
                                            <figcaption>
                                                <span className="made__step">{String(i + 1).padStart(2, '0')}</span>
                                                <span>
                                                    {t(step.caption)}
                                                    <small className="made__note">{t(step.note)}</small>
                                                </span>
                                            </figcaption>
                                        </figure>
                                    </li>
                                ))}
                                {PHOTOS.map((ph, i) => (
                                    <li key={ph.src}>
                                        <figure>
                                            <img src={ph.src} alt={t(ph.alt)} width={1000} height={1000} loading="lazy" />
                                            <figcaption>
                                                <span className="made__step">{String(DESIGN.length + i + 1).padStart(2, '0')}</span>
                                                {t(ph.caption)}
                                            </figcaption>
                                        </figure>
                                    </li>
                                ))}
                                {LATER.map((step, i) => (
                                    <li key={step.caption} className="made__later">
                                        <figure>
                                            {'src' in step ? (
                                                <img src={step.src} alt={t(step.alt)} width={1000} height={1000} loading="lazy" />
                                            ) : (
                                                <div className="made__art">
                                                    <step.Art />
                                                </div>
                                            )}
                                            <figcaption>
                                                <span className="made__step">{String(DESIGN.length + PHOTOS.length + i + 1).padStart(2, '0')}</span>
                                                <span>
                                                    {t(step.caption)}
                                                    {step.note && <small className="made__note">{t(step.note)}</small>}
                                                </span>
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
