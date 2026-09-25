import { Button, LivePainting, SourceLine } from '../ds';
import { LINKS } from './links';
import { contactScene } from './scenes';
import { Arrow, Idx } from './ui';

/* ── Company: Mirdyne, Bimo Tech and PRISM ────────────────────────────── */

export function Company() {
    return (
        <section id="company" className="sec company" data-theme="paper" data-nav="paper" aria-labelledby="company-title">
            <div className="wrap">
                <header className="sec-head rv">
                    <Idx n="09">Company</Idx>
                    <h2 id="company-title" className="w-h2">
                        Mirdyne discovers. Bimo Tech delivers.
                    </h2>
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

                <figure className="strip rv">
                    <img
                        src="/img/spark-lab.webp"
                        alt="Four photographs from Project SPARK: powder preparation, a powder container, melting equipment and sample polishing."
                        width={1080}
                        height={270}
                        loading="lazy"
                    />
                    <figcaption>
                        <SourceLine label="Project SPARK">Preparing powder, melting and polishing. Real photographs from the project.</SourceLine>
                    </figcaption>
                </figure>

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
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── News ─────────────────────────────────────────────────────────────── */

const NEWS = [
    {
        when: '2026',
        tag: 'Award',
        title: 'PRISM wins the AI special prize at Hessen Ideen',
        text: 'Team PRISM, from Justus Liebig University Giessen, won the KI‑Sonderpreis, the special prize for artificial intelligence, in the Hessen Ideen competition 2026.',
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
        text: 'In SPARK, an ESA project led by Bimo Tech, the first alloys from our early screening were made as real metal: powder, melting and polishing. We are still testing them, and two or three look promising. The photographs on this site come from the project.',
    },
];

export function News() {
    return (
        <section id="news" className="sec news" data-theme="paper" data-nav="paper" aria-labelledby="news-title">
            <div className="wrap">
                <header className="news__head rv">
                    <Idx n="10">News</Idx>
                    <h2 id="news-title" className="w-h2">
                        Latest from Mirdyne.
                    </h2>
                </header>
                <ol className="news__list">
                    {NEWS.map((n, i) => (
                        <li key={n.title} className="news__item rv" style={{ ['--d' as string]: `${i * 90}ms` }}>
                            <p className="news__meta">
                                <span>{n.when}</span>
                                <span className="news__tag">{n.tag}</span>
                            </p>
                            <h3>{n.title}</h3>
                            <p>{n.text}</p>
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
            <div className="cta__art">
                <LivePainting
                    scene={contactScene}
                    alt="Painted materials search landscape: basins, measured points and a path descending to the best point."
                    fallback={{ src: '/img/search-manifold.webp', seed: 29, direction: -10, motion: 0.4, focusX: 0.7, focusY: 0.5 }}
                />
            </div>
            <div className="cta__shade" aria-hidden="true" />
            <div className="wrap cta__inner rv">
                <p className="w-label cta__kicker">Start</p>
                <h2 id="contact-title" className="w-mega cta__title">
                    Tell us what your part must survive.
                </h2>
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
                <p className="cta__caption">Illustrative search landscape, repainted in code.</p>
            </div>
        </section>
    );
}
