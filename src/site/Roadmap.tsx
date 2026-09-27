import { useT } from './i18n';
import { CONSORTIUM, PartnerLogo } from './partners';
import SupplyShock from './SupplyShock';
import { Grain, Idx, Note, Rails, Words } from './ui';

type TrackState = 'done' | 'current' | 'next';

const BRANCHES: { name: string; text: string; items: { title: string; status: string; state: TrackState }[] }[] = [
    {
        name: 'Materials programmes',
        text: 'The loop, taken to new kinds of material.',
        items: [
            { title: 'Refractory alloys', status: 'Active', state: 'current' },
            { title: 'PFAS‑free polymers', status: 'Contracted', state: 'next' },
            { title: 'Polymers and bio-based materials', status: 'Next', state: 'next' },
        ],
    },
    {
        name: 'Supply-chain intelligence',
        text: 'The same tools, used to see how a change at one supplier spreads.',
        items: [
            { title: 'Supply risk', status: 'Internal', state: 'done' },
            { title: 'Market signals', status: 'Prototype', state: 'current' },
            { title: 'Programme risk', status: 'Exploratory', state: 'next' },
            { title: 'Early warnings', status: 'Next', state: 'next' },
        ],
    },
];

export default function Roadmap({ n = '02' }: { n?: string }) {
    const t = useT();
    return (
        <section id="roadmap" className="sec roadmap" data-theme="navy" data-nav="navy" aria-labelledby="roadmap-title">
            <Rails />
            <Grain />
            <div className="wrap">
                <header className="sec-head rv">
                    <Idx n={n}>{t('Progress')}</Idx>
                    <h2 id="roadmap-title" className="w-h2">
                        <Words>{t('What PRISM has done, and what comes next.')}</Words>
                    </h2>
                </header>

                <article className="alpha rv" aria-labelledby="alpha-title">
                    <div className="alpha__head">
                        <p className="w-label alpha__kicker">{t('Running now · funded by ESA')}</p>
                        <h3 id="alpha-title" className="w-h3 alpha__title">
                            PRISM Alpha
                        </h3>
                        <p className="alpha__lead">
                            {t('The first project built around the full PRISM loop, for European space transport.')}
                        </p>
                        <dl className="alpha__facts">
                            <div>
                                <dt>{t('12 months')}</dt>
                                <dd>{t('TRL 3 to 4')}</dd>
                            </div>
                            <div>
                                <dt>3+</dt>
                                <dd>{t('candidate alloys')}</dd>
                            </div>
                            <div>
                                <dt>1</dt>
                                <dd>{t('complete closed loop')}</dd>
                            </div>
                        </dl>
                        <p className="alpha__when">{t('Kicked off in July 2026. Award ceremony in October.')}</p>
                    </div>
                    <ul className="alpha__team" aria-label={t('PRISM Alpha consortium')}>
                        {CONSORTIUM.map((p) => (
                            <li key={p.id}>
                                <PartnerLogo p={p} />
                                <span className="alpha__name">{t(p.name)}</span>
                                <span className="alpha__role">{t(p.role)}</span>
                            </li>
                        ))}
                    </ul>
                </article>

                <div className="stands rv" aria-labelledby="stands-title">
                    <h3 id="stands-title" className="w-h3">
                        {t('Where it stands')}
                    </h3>
                    <div className="stands__cols">
                        <div>
                            <p className="w-label">{t('Done so far')}</p>
                            <ul>
                                <li>{t('Project SPARK: eight candidate alloys narrowed to two, made as real metal.')}</li>
                                <li>{t('PRISM Alpha, funded by ESA, kicked off in July 2026.')}</li>
                                <li>{t('Our first privately funded project, for PFAS‑free polymers, is signed.')}</li>
                                <li>{t('PRISM won the AI special prize (KI‑Sonderpreis) at Hessen Ideen 2026.')}</li>
                            </ul>
                        </div>
                        <div>
                            <p className="w-label">{t('Still to prove')}</p>
                            <ul>
                                <li>{t('One full loop, from requirement to test results. That is PRISM Alpha’s job.')}</li>
                                <li>{t('Robots making samples and software driving the instruments, on a real line.')}</li>
                                <li>{t('A material taken from test sample to real part, with the evidence certification needs.')}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="branches rv">
                    {BRANCHES.map((b) => (
                        <div key={b.name} className="branch">
                            <h3 className="branch__name">{t(b.name)}</h3>
                            <p className="branch__text">{t(b.text)}</p>
                            <ol className="track">
                                {b.items.map((it) => (
                                    <li key={it.title} className="track__item" data-state={it.state}>
                                        <span className="w-label">{t(it.status)}</span>
                                        <strong>{t(it.title)}</strong>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    ))}
                </div>

                <figure className="roadmap__net rv">
                    <SupplyShock />
                    <figcaption>
                        <Note label={t('Illustrative')}>
                            {t('The network and its rates are made up; the mathematics is exact. The model is a multivariate Hawkes process (Hawkes, 1971), simulated through its branching structure (Hawkes and Oakes, 1974). On Granger causality in it: Eichler, Dahlhaus and Dueck, 2017. On its uses in finance: Bacry, Mastromatteo and Muzy, 2015. Our method for supply chains is adapted from Okawa et al., “Dynamic Hawkes Processes for Discovering Time-evolving Communities’ States behind Diffusion Processes”, KDD 2021.')}
                        </Note>
                    </figcaption>
                </figure>

                <p className="roadmap__close rv">
                    {t('Whatever PRISM is used for, every claim keeps its source and says how sure it is.')}
                </p>
            </div>
        </section>
    );
}
