import { Button } from '../ds';
import { LINKS } from './links';
import { Arrow, Idx } from './ui';

/* ── Company: Mirdyne, Bimo Tech and PRISM ────────────────────────────── */

export function Company({ n = '01', h1 = false }: { n?: string; h1?: boolean }) {
    const H = h1 ? 'h1' : 'h2';
    return (
        <section id="company" className="sec company" data-theme="paper" data-nav="paper" aria-labelledby="company-title">
            <div className="wrap">
                <header className="sec-head rv">
                    <Idx n={n}>Company</Idx>
                    <H id="company-title" className="w-h2">
                        Mirdyne discovers. Bimo Tech delivers.
                    </H>
                    <p className="w-lead">
                        Finding a new material is half the job. Someone also has to make it in quantity and supply it
                        for years. So the work is split between two companies: one finds and proves the material, the
                        other scales it up and supplies it.
                    </p>
                </header>

                <div className="rel rel--two rv" aria-label="How Mirdyne and Bimo Tech share the work">
                    <article className="rel__card">
                        <p className="w-label">Discovers</p>
                        <img className="rel__logo" src="/brand/mirdyne-lockup-ink.png" alt="Mirdyne" width={183} height={50} />
                        <p className="rel__head">Finds the material and proves it works.</p>
                        <p>
                            Designs new materials with PRISM, makes the first samples and tests them against the
                            requirement. Based in Giessen, Germany.
                        </p>
                        <ul className="rel__tags" aria-label="What Mirdyne does">
                            <li>Design with PRISM</li>
                            <li>First samples</li>
                            <li>Test evidence</li>
                        </ul>
                    </article>
                    <p className="rel__arrow">
                        <span>proven material</span>
                        <i aria-hidden="true" />
                    </p>
                    <article className="rel__card rel__card--bimo" data-theme="navy">
                        <p className="w-label">Delivers</p>
                        <img className="rel__logo" src="/bimo-logo.png" alt="Bimo Tech" width={182} height={66} />
                        <p className="rel__head">Makes it at scale and supplies it.</p>
                        <p>
                            An industrial manufacturer of high-performance metal parts and high-entropy alloys, and a
                            supplier to ITER, the international fusion project. It takes a proven material into
                            production.
                        </p>
                        <ul className="rel__tags" aria-label="What Bimo Tech does">
                            <li>Scale-up</li>
                            <li>Powder and parts</li>
                            <li>Supply</li>
                        </ul>
                        <a className="rel__link" href={LINKS.bimotech} target="_blank" rel="noopener noreferrer">
                            bimotech.pl <Arrow external />
                        </a>
                    </article>
                    <p className="rel__under">
                        <i aria-hidden="true" />
                        <span>
                            Mirdyne is a spin-off of Bimo Tech. PRISM is being developed in ESA projects that Bimo Tech
                            leads.
                        </span>
                    </p>
                </div>
                <div className="founders rv">
                    <p className="w-label">Founders</p>
                    <div className="founders__grid">
                        <article className="founder">
                            <h3>Kevin Grüning</h3>
                            <p className="founder__role">Managing Director, Mirdyne</p>
                            <p>
                                Space Systems Lead at Bimo Tech. Physics and technology for space applications, JLU
                                Giessen and THM.
                            </p>
                        </article>
                        <article className="founder">
                            <h3>Siddhartha Yash Kovid</h3>
                            <p className="founder__role">Technical Lead, Mirdyne</p>
                            <p>
                                Technical lead of the ESA projects SPARK and PRISM Alpha at Bimo Tech. Applied AI and
                                data science, MIT Professional Education; biomedical engineering, THM.
                            </p>
                        </article>
                        <article className="founder">
                            <h3>Marcin Orzechowski</h3>
                            <p className="founder__role">Co-founder, Mirdyne</p>
                            <p>
                                CEO and Head of R&amp;D at Bimo Tech, which supplies special metals and precision parts for
                                space, energy and science. Wrocław University of Technology.
                            </p>
                        </article>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── News ─────────────────────────────────────────────────────────────── */

interface NewsItem {
    when: string;
    tag: string;
    title: string;
    text: string;
    image?: { src: string; alt: string; width: number; height: number; credit?: string };
}

const NEWS: NewsItem[] = [
    {
        when: '2026',
        tag: 'Award',
        title: 'PRISM wins the AI special prize at Hessen Ideen',
        text: 'Team PRISM, from Justus Liebig University Giessen, won the KI‑Sonderpreis, the special prize for artificial intelligence, in the Hessen Ideen competition 2026.',
        image: {
            src: '/img/news-hessen-ideen-2026.webp',
            alt: 'Team PRISM on stage at the Hessen Ideen awards, holding the KI-Sonderpreis certificate, with the organisers.',
            width: 1600,
            height: 1066,
        },
    },
    {
        when: 'August 2026',
        tag: 'Industry',
        title: 'First privately funded project: PFAS‑free polymers',
        text: 'Mirdyne has signed its first privately funded project, with an industrial partner under NDA. We will design PFAS‑free polymers with PRISM, to replace “forever chemicals”. Work starts next.',
    },
    {
        when: 'July 2026',
        tag: 'Programme',
        title: 'ESA awards PRISM Alpha',
        text: 'The European Space Agency has awarded PRISM Alpha to a team led by Bimo Tech. It is the first project built around the full PRISM loop, for European space transport.',
    },
    {
        when: 'Ongoing',
        tag: 'Project',
        title: 'Project SPARK: our first alloys are real',
        text: 'In SPARK, an ESA project led by Bimo Tech, the first alloys from our early screening were made as real metal: powder, melting and polishing. We are still testing them, and two or three look promising.',
        image: {
            src: '/img/spark-lab.webp',
            alt: 'Four photographs from Project SPARK: powder preparation, a powder container, melting equipment and sample polishing.',
            width: 1080,
            height: 270,
            credit: 'Project SPARK: preparing powder, melting and polishing. Photographs: Bimo Tech.',
        },
    },
];

export function News({ n = '01', h1 = false }: { n?: string; h1?: boolean }) {
    const H = h1 ? 'h1' : 'h2';
    return (
        <section id="news" className="sec news" data-theme="paper" data-nav="paper" aria-labelledby="news-title">
            <div className="wrap">
                <header className="news__head rv">
                    <Idx n={n}>News</Idx>
                    <H id="news-title" className="w-h2">
                        Latest from Mirdyne.
                    </H>
                </header>
                <ol className="news__list">
                    {NEWS.map((n, i) => (
                        <li
                            key={n.title}
                            className={`news__item rv${n.image ? ' news__item--lead' : ''}`}
                            style={{ ['--d' as string]: `${i * 90}ms` }}
                        >
                            {n.image && (
                                <figure className="news__figure">
                                    <img
                                        className="news__img"
                                        src={n.image.src}
                                        alt={n.image.alt}
                                        width={n.image.width}
                                        height={n.image.height}
                                        loading="lazy"
                                    />
                                    {n.image.credit && <figcaption>{n.image.credit}</figcaption>}
                                </figure>
                            )}
                            <div className="news__body">
                                <p className="news__meta">
                                    <span>{n.when}</span>
                                    <span className="news__tag">{n.tag}</span>
                                </p>
                                <h3>{n.title}</h3>
                                <p>{n.text}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

/* ── Call to action ───────────────────────────────────────────────────── */

export function Contact() {
    return (
        <section id="contact" className="cta" data-theme="paper" data-nav="paper" aria-labelledby="contact-title">
            <div className="wrap cta__inner rv">
                <p className="w-label cta__kicker">Start</p>
                <h2 id="contact-title" className="w-h2 cta__title">
                    Tell us what your part must survive.
                </h2>
                <div className="cta__side">
                    <p className="w-lead">
                        We will tell you what PRISM can search for, how we would prove it and what it would take.
                    </p>
                    <div className="cta__actions">
                        <Button href={LINKS.interest} external>
                            Register interest
                        </Button>
                        <Button variant="secondary" href={LINKS.github} external>
                            Open-source layer on GitHub
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
