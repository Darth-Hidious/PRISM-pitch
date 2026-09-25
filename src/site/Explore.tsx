import { Arrow, Idx } from './ui';

const PAGES = [
    {
        href: '/platform/',
        label: 'Platform',
        title: 'Five stacks. One system.',
        text: 'What PRISM is built from, and how ready each part is.',
    },
    {
        href: '/method/',
        label: 'Method',
        title: 'Every experiment has to earn its place.',
        text: 'Four live demos, and Forager, our open research.',
    },
    {
        href: '/evidence/',
        label: 'Evidence and IP',
        title: 'Every result keeps its proof.',
        text: 'Who can see what, a real lineage, and what a part gives away.',
    },
    {
        href: '/company/',
        label: 'Company',
        title: 'Mirdyne discovers. Bimo Tech delivers.',
        text: 'Who we are, the founders, and how to work with us.',
    },
    {
        href: '/news/',
        label: 'News',
        title: 'PRISM wins the AI special prize at Hessen Ideen.',
        text: 'And the latest from our projects.',
    },
];

/** The rest of the site, one card per page. */
export default function Explore({ n = '03' }: { n?: string }) {
    return (
        <section id="more" className="sec explore" data-theme="paper" data-nav="paper" aria-labelledby="explore-title">
            <div className="wrap">
                <header className="explore__head rv">
                    <Idx n={n}>More</Idx>
                    <h2 id="explore-title" className="w-h2">
                        Go deeper.
                    </h2>
                </header>
                <ul className="explore__grid">
                    {PAGES.map((p, i) => (
                        <li key={p.href} className="rv" style={{ ['--d' as string]: `${i * 70}ms` }}>
                            <a className="explore__card" href={p.href}>
                                <span className="w-label">{p.label}</span>
                                <strong>{p.title}</strong>
                                <span className="explore__text">{p.text}</span>
                                <span className="explore__go">
                                    Open <Arrow />
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
