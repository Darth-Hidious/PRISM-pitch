import { Button, MirdyneMark, Painting, SourceLine } from '../ds';
import { LINKS } from './links';
import { Arrow, Idx } from './ui';

/* ── Company: Mirdyne, Bimo Tech and PRISM ────────────────────────────── */

export function Company() {
    return (
        <section id="company" className="sec company" data-theme="paper" data-nav="paper" aria-labelledby="company-title">
            <div className="wrap">
                <header className="sec-head rv">
                    <Idx n="08">Company</Idx>
                    <h2 id="company-title" className="w-h2">
                        A platform company, born inside a manufacturer.
                    </h2>
                    <p className="w-lead">
                        Mirdyne is a spin-off of Bimo Tech, which develops and manufactures high-performance metal
                        components and high-entropy alloys. PRISM is developed in the European Space Agency activities
                        that Bimo Tech leads, and built by Mirdyne in Giessen, Germany, for any programme that needs a
                        new material.
                    </p>
                </header>

                <div className="rel rv" aria-label="How Bimo Tech, Mirdyne and PRISM relate">
                    <article className="rel__card rel__card--bimo" data-theme="navy">
                        <p className="w-label">The industrial parent</p>
                        <img className="rel__logo" src="/bimo-logo.png" alt="Bimo Tech" width={182} height={66} />
                        <p>
                            Develops and manufactures high-performance metal components, with a focus on high-entropy
                            alloys. A supplier to ITER, the international fusion project, and prime contractor of the
                            ESA activities in which PRISM is developed.
                        </p>
                        <a className="rel__link" href={LINKS.bimotech} target="_blank" rel="noopener noreferrer">
                            bimotech.pl <Arrow external />
                        </a>
                    </article>
                    <p className="rel__arrow">
                        <span>spin-off</span>
                        <i aria-hidden="true" />
                    </p>
                    <article className="rel__card">
                        <p className="w-label">The platform company</p>
                        <img className="rel__logo" src="/brand/mirdyne-lockup-ink.png" alt="Mirdyne" width={183} height={50} />
                        <p>
                            Based in Giessen, Germany. Builds PRISM and takes it to programmes beyond space, starting
                            with PFAS-free polymers for an industrial partner.
                        </p>
                    </article>
                    <p className="rel__arrow">
                        <span>builds</span>
                        <i aria-hidden="true" />
                    </p>
                    <article className="rel__card rel__card--prism">
                        <p className="w-label">The platform</p>
                        <p className="rel__prism">
                            <MirdyneMark title="" />
                            PRISM
                        </p>
                        <p>
                            Design, orchestration, autonomous experiments, manufacture, test and evidence, run as one
                            closed loop.
                        </p>
                    </article>
                    <p className="rel__under">
                        <i aria-hidden="true" />
                        <span>Bimo Tech’s ESA activities are where PRISM’s designs meet real manufacture and test.</span>
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
                        <SourceLine label="Project SPARK">Powder preparation, melting and polishing. Real project photographs.</SourceLine>
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
        when: 'August 2026',
        tag: 'Industry',
        title: 'First privately funded programme: PFAS‑free polymers',
        text: 'Mirdyne has signed its first privately funded programme, with an industrial partner under NDA: PFAS-free polymer materials designed with PRISM. It is the platform’s first polymer class, and work starts next.',
    },
    {
        when: 'July 2026',
        tag: 'Programme',
        title: 'ESA awards PRISM Alpha',
        text: 'The European Space Agency has awarded PRISM Alpha to a consortium led by Bimo Tech, under the Future Launchers Preparatory Programme (FIRST! Simulation & Intelligence). It is the first activity built around the complete PRISM loop, for European space transportation.',
    },
    {
        when: 'Active',
        tag: 'Project',
        title: 'Project SPARK: refractory high-entropy alloys, made for real',
        text: 'In SPARK, an ESA activity led by Bimo Tech, candidate refractory high-entropy alloys left the computer and became physical alloys: powder, melting, polishing and test. The photographs on this site come from the project.',
    },
];

export function News() {
    return (
        <section id="news" className="sec news" data-theme="paper" data-nav="paper" aria-labelledby="news-title">
            <div className="wrap">
                <header className="news__head rv">
                    <Idx n="09">News</Idx>
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
                <Painting
                    src="/img/search-manifold.webp"
                    alt="Painted materials search landscape: basins, sampled points and a path descending to the optimum."
                    seed={29}
                    direction={-10}
                    motion={0.4}
                    focusX={0.7}
                    focusY={0.5}
                />
            </div>
            <div className="cta__shade" aria-hidden="true" />
            <div className="wrap cta__inner rv">
                <p className="w-label cta__kicker">Start</p>
                <h2 id="contact-title" className="w-mega cta__title">
                    Start with the capability you need.
                </h2>
                <p className="w-lead">
                    Tell us the environment your part has to survive. We will tell you what PRISM can search, how we
                    would prove it and what it would take.
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
