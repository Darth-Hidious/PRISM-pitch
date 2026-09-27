import { MarketCards } from './Markets';
import { useT } from './i18n';
import { Idx, Words } from './ui';

const LADDER = [
    { name: 'Our models', text: 'Our own models predict how an alloy’s atoms arrange and what it will do.', tag: 'Licensed' },
    { name: 'Project', text: 'We solve your requirement. You judge the test results.' },
    { name: 'Pilot', text: 'A first trial on your problem, with our sensors.' },
    { name: 'Deployment', text: 'PRISM at work on your programme, run by us.' },
    { name: 'Support', text: 'Updates, recalibration, traceable data.' },
    { name: 'Supply', text: 'The qualified material, made at scale by Bimo Tech.' },
];

export default function Business({ n = '02' }: { n?: string }) {
    const t = useT();
    return (
        <section id="business" className="sec business" data-theme="paper" data-nav="paper" aria-labelledby="business-title">
            <div className="wrap">
                <header className="sec-head rv">
                    <Idx n={n}>{t('Working with us')}</Idx>
                    <h2 id="business-title" className="w-h2">
                        <Words>{t('We earn from development contracts and licensing.')}</Words>
                    </h2>
                    <p className="w-lead">
                        {t('Customers want the material now, for what it can do. Certifying a part takes ten years or more; that comes later.')}
                    </p>
                </header>

                <ol className="ladder rv" aria-label={t('How Mirdyne works with you, from our models to supply')}>
                    {LADDER.map((s, i) => (
                        <li key={s.name} className="ladder__step" style={{ ['--i' as string]: i }}>
                            <span className="ladder__num">{String(i + 1).padStart(2, '0')}</span>
                            <h3>{t(s.name)}</h3>
                            <p>{t(s.text)}</p>
                            {s.tag && <span className="ladder__tag">{t(s.tag)}</span>}
                        </li>
                    ))}
                </ol>
                <p className="ladder__axis rv" aria-hidden="true">
                    <span>{t('Our models')}</span>
                    <i />
                    <span>{t('Materials on your line')}</span>
                </p>

                <div className="markets">
                    <p className="w-label markets__label rv">{t('Where PRISM is used first')}</p>
                    <MarketCards />
                </div>
            </div>
        </section>
    );
}
