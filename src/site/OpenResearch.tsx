import { Button } from '../ds';
import { KnownAnswer, KnownAnswerList } from './diagrams';
import { useT } from './i18n';
import { LINKS } from './links';
import { Idx, Note, Words } from './ui';

/** Forager: the team's open research, built with PRISM. Every figure here is from Forager's public record. */
export default function OpenResearch({ n = '02' }: { n?: string }) {
    const t = useT();
    return (
        <section id="open-research" className="sec open" data-theme="paper" data-nav="paper" aria-labelledby="open-title">
            <div className="wrap">
                <header className="sec-head rv">
                    <Idx n={n}>{t('Open research')}</Idx>
                    <h2 id="open-title" className="w-h2">
                        <Words>{t('Forager: a fruit fly’s brain, searching for new alloys.')}</Words>
                    </h2>
                    <p className="w-lead">
                        {t('Our open research project. The wiring map of a fruit fly’s brain steers an AI that suggests high-melting alloys.')}
                    </p>
                </header>

                <dl className="facts rv">
                    <div>
                        <dt>{t.num(164506)}</dt>
                        <dd>{t('brain cells in the wiring map that steers the search')}</dd>
                    </div>
                    <div>
                        <dt>
                            5 {t('checks')}
                        </dt>
                        <dd>{t('from a quick estimate to full quantum calculations')}</dd>
                    </div>
                    <div>
                        <dt>240+</dt>
                        <dd>{t('experiments in the public log, each with its prediction written first')}</dd>
                    </div>
                </dl>

                <figure className="open__figure rv">
                    <div className="drawing wide-only">
                        <KnownAnswer />
                    </div>
                    <KnownAnswerList />
                    <figcaption>
                        <p className="fig-cap">{t('Before a check is trusted, it has to reproduce a known answer.')}</p>
                        <Note>
                            {t('Forager, experiment E242; published value from Kim and Widom, Phys. Rev. Materials 7, 063803 (2023), with Forager’s own error rule applied to it.')}
                        </Note>
                    </figcaption>
                </figure>

                <div className="open__cta rv">
                    <Button href={LINKS.forager} external>
                        Forager
                    </Button>
                    <p>{t('Forager uses only public data. It is separate from the projects above.')}</p>
                </div>
            </div>
        </section>
    );
}
