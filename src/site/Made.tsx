import { Idx } from './ui';

/** Our own photographs, as taken: cropped, never retouched. */
const PHOTOS = [
    {
        src: '/img/spark-melt.webp',
        alt: 'Looking through the viewport of an arc-melting furnace: a small alloy button glows orange inside.',
        caption: 'Melted with an electric arc',
    },
    {
        src: '/img/spark-hearth.webp',
        alt: 'Looking down into the furnace: the hearth with its hollows, each holding a cooled alloy button.',
        caption: 'Cooled in the hearth',
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

/** Home: the ideas are real metal. Four photographs, a few words each. */
export default function Made({ n = '02' }: { n?: string }) {
    return (
        <section id="made" className="sec made" data-theme="paper" data-nav="paper" aria-labelledby="made-title">
            <div className="wrap">
                <header className="made__head rv">
                    <Idx n={n}>Made for real</Idx>
                    <h2 id="made-title" className="w-h2">
                        An idea only counts once it is metal.
                    </h2>
                </header>
                <ul className="made__grid">
                    {PHOTOS.map((p, i) => (
                        <li key={p.src} className="rv" style={{ ['--d' as string]: `${i * 80}ms` }}>
                            <figure>
                                <img src={p.src} alt={p.alt} width={1000} height={1000} loading="lazy" />
                                <figcaption>{p.caption}</figcaption>
                            </figure>
                        </li>
                    ))}
                </ul>
                <p className="made__note rv">Our own photographs.</p>
            </div>
        </section>
    );
}
