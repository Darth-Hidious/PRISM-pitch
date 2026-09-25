import { useScrollsSideways } from './hooks';
import { Idx } from './ui';

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

/** Home: the ideas are real metal. Five photographs, from raw metal to a machined part. */
export default function Made({ n = '02' }: { n?: string }) {
    const [strip, scrolls] = useScrollsSideways<HTMLUListElement>();
    return (
        <section id="made" className="sec made" data-theme="paper" data-nav="paper" aria-labelledby="made-title">
            <div className="wrap">
                <header className="made__head rv">
                    <Idx n={n}>Made for real</Idx>
                    <h2 id="made-title" className="w-h2">
                        An idea only counts once it is metal.
                    </h2>
                </header>
                {/* On phones the row scrolls sideways; then it takes keyboard focus so it can be scrolled without a mouse. */}
                <ul
                    ref={strip}
                    className="made__grid rv"
                    aria-label="From raw metal to a machined part, in five photographs"
                    tabIndex={scrolls ? 0 : undefined}
                >
                    {PHOTOS.map((p, i) => (
                        <li key={p.src}>
                            <figure>
                                <img src={p.src} alt={p.alt} width={1000} height={1000} loading="lazy" />
                                <figcaption>
                                    <span className="made__step">{String(i + 1).padStart(2, '0')}</span>
                                    {p.caption}
                                </figcaption>
                            </figure>
                        </li>
                    ))}
                </ul>
                <p className="made__note rv">Our own photographs.</p>
            </div>
        </section>
    );
}
