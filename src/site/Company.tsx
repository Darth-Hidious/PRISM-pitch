import { Button } from '../ds';
import { useT } from './i18n';
import { LINKS } from './links';
import { Arrow, Idx, Words } from './ui';

/* ── Company: Mirdyne, Bimo Tech and PRISM ────────────────────────────── */

/** Our advisors, from the universities and institutes we work with. */
const ADVISORS = [
    { name: 'Prof. Jan Wróbel', where: 'Warsaw University of Technology', text: 'Computer models of how the atoms in an alloy arrange, and what that does to it.' },
    { name: 'Prof. Dariusz Jarząbek', where: 'IPPT PAN, Warsaw', text: 'Materials research, from powder to how a sample holds up under load.' },
];

export function Company({ n = '01', h1 = false }: { n?: string; h1?: boolean }) {
    const H = h1 ? 'h1' : 'h2';
    const Sub = h1 ? 'h2' : 'h3';
    const Name = h1 ? 'h3' : 'h4';
    const t = useT();
    return (
        <section id="company" className="sec company" data-theme="paper" data-nav="paper" aria-labelledby="company-title">
            <div className="wrap">
                <header className="sec-head rv">
                    <Idx n={n}>{t('Company')}</Idx>
                    <H id="company-title" className="w-h2">
                        {t('We design new materials, and Bimo Tech makes them.')}
                    </H>
                </header>

                <div className="rel rel--two rv" aria-label={t('How Mirdyne and Bimo Tech share the work')}>
                    <article className="rel__card">
                        <p className="w-label">{t('Giessen')}</p>
                        <img className="rel__logo" src="/brand/mirdyne-lockup-ink.png" alt="Mirdyne" width={183} height={50} />
                        <p className="rel__head">{t('Designs new materials with PRISM and proves that they work.')}</p>
                        <ul className="rel__tags" aria-label={t('What Mirdyne does')}>
                            <li>{t('Design with PRISM')}</li>
                            <li>{t('First samples')}</li>
                            <li>{t('Test evidence')}</li>
                        </ul>
                    </article>
                    <p className="rel__arrow">
                        <span>{t('proven material')}</span>
                        <i aria-hidden="true" />
                    </p>
                    <article className="rel__card rel__card--bimo" data-theme="navy">
                        <p className="w-label">{t('Wrocław')}</p>
                        <img className="rel__logo" src="/bimo-logo.png" alt="Bimo Tech" width={182} height={66} />
                        <p className="rel__head">{t('Makes them at scale and supplies them. Bimo Tech already supplies ITER, the fusion project.')}</p>
                        <ul className="rel__tags" aria-label={t('What Bimo Tech does')}>
                            <li>{t('Scale-up')}</li>
                            <li>{t('Powder and parts')}</li>
                            <li>{t('Supply')}</li>
                        </ul>
                        <a className="rel__link" href={LINKS.bimotech} target="_blank" rel="noopener noreferrer">
                            bimotech.pl <Arrow external />
                        </a>
                    </article>
                    <p className="rel__under">
                        <i aria-hidden="true" />
                        <span>
                            {t('Mirdyne is a spin-off of Bimo Tech. PRISM is being developed in ESA projects that Bimo Tech leads.')}
                        </span>
                    </p>
                </div>
                <figure className="company__photos rv">
                    <div>
                        <img
                            src="/img/lab-arc-melter.webp"
                            alt={t('An arc melter in a university materials lab: the steel melting chamber with two round windows on its control cabinet, a chiller and gas bottles beside it.')}
                            width={1400}
                            height={786}
                            loading="lazy"
                        />
                        <img
                            src="/img/spark-hearth-column.webp"
                            alt={t('Close-up of the copper hearth: small pieces of raw metal in its hollows, ready to be melted.')}
                            width={900}
                            height={1200}
                            loading="lazy"
                        />
                    </div>
                    <figcaption>{t('Where our alloys are melted: the materials lab at WUST, Wrocław.')}</figcaption>
                </figure>
                <div className="founders rv">
                    <Sub className="w-label">{t('Founders')}</Sub>
                    <div className="founders__grid">
                        <article className="founder">
                            <Name>Kevin Grüning</Name>
                            <p className="founder__role">{t('CEO and Managing Director, Mirdyne')}</p>
                            <p>
                                {t('Space Systems Lead at Bimo Tech. Physics and technology for space applications, JLU Giessen and THM.')}
                            </p>
                        </article>
                        <article className="founder">
                            <Name>Siddhartha Yash Kovid</Name>
                            <p className="founder__role">{t('Technical Lead, Mirdyne')}</p>
                            <p>
                                {t('Technical lead of the ESA projects SPARK and PRISM Alpha at Bimo Tech. Applied AI and data science, MIT Professional Education; biomedical engineering, THM.')}
                            </p>
                        </article>
                        <article className="founder">
                            <Name>Marcin Orzechowski</Name>
                            <p className="founder__role">{t('CFO, Mirdyne')}</p>
                            <p>
                                {t('CEO and Head of R&D at Bimo Tech, which supplies special metals and precision parts for space, energy and science. Wrocław University of Technology.')}
                            </p>
                        </article>
                    </div>
                </div>
                <div className="experts rv">
                    <Sub className="w-label">{t('Advisors')}</Sub>
                    <ul className="experts__grid">
                        {ADVISORS.map((e) => (
                            <li key={e.name}>
                                <b>{t(e.name)}</b>
                                <span className="founder__role">{t(e.where)}</span>
                                <p>{t(e.text)}</p>
                            </li>
                        ))}
                    </ul>
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
        title: 'PRISM Alpha kicks off',
        text: 'PRISM Alpha has started: a project in ESA’s Future Launchers Preparatory Programme (FLPP), led by Bimo Tech with ArianeGroup, Fraunhofer IAPT and amsight. It is the first project built around the full PRISM loop, for European space transport. The award ceremony follows in October.',
    },
    {
        when: 'Ongoing',
        tag: 'Project',
        title: 'Project SPARK: our first alloys are real',
        text: 'In SPARK, an ESA project led by Bimo Tech, eight candidate alloys from our early screening were narrowed to two and made as real metal. Testing continues.',
        image: {
            src: '/img/spark-hearth-charge.webp',
            alt: 'Close-up of a copper hearth: small pieces of raw metal loaded into its hollows, ready to be melted.',
            width: 1600,
            height: 1067,
        },
    },
    {
        when: 'July 2025',
        tag: 'Proposal',
        title: 'PRISM put to ESA',
        text: 'We submitted PRISM to ESA’s Open Space Innovation Platform (OSIP), where ESA collects new ideas. PRISM Alpha, which followed, is a larger project, in ESA’s launcher programme FLPP.',
    },
];

export function News({ n = '01', h1 = false }: { n?: string; h1?: boolean }) {
    const H = h1 ? 'h1' : 'h2';
    const Item = h1 ? 'h2' : 'h3';
    const t = useT();
    return (
        <section id="news" className="sec news" data-theme="paper" data-nav="paper" aria-labelledby="news-title">
            <div className="wrap">
                <header className="news__head rv">
                    <Idx n={n}>{t('News')}</Idx>
                    <H id="news-title" className="w-h2">
                        {t('Latest from Mirdyne.')}
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
                                        alt={t(n.image.alt)}
                                        width={n.image.width}
                                        height={n.image.height}
                                        loading="lazy"
                                    />
                                    {n.image.credit && <figcaption>{n.image.credit}</figcaption>}
                                </figure>
                            )}
                            <div className="news__body">
                                <p className="news__meta">
                                    <span>{t(n.when)}</span>
                                    <span className="news__tag">{t(n.tag)}</span>
                                </p>
                                <Item>{t(n.title)}</Item>
                                <p>{t(n.text)}</p>
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
    const t = useT();
    return (
        <section id="contact" className="cta" data-theme="paper" data-nav="paper" aria-labelledby="contact-title">
            <div className="wrap cta__inner rv">
                <p className="w-label cta__kicker">{t('Start')}</p>
                <h2 id="contact-title" className="w-h2 cta__title">
                    <Words>{t('Tell us what your part must survive.')}</Words>
                </h2>
                <div className="cta__side">
                    <p className="w-lead">{t('We’ll tell you what PRISM can find, and how we’d prove it.')}</p>
                    <div className="cta__actions">
                        <Button href={t.link(LINKS.interest)}>{t('Register interest')}</Button>
                        <Button variant="secondary" href={LINKS.github} external>
                            GitHub
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
