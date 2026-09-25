import { MarketCards } from './Markets';
import { Idx, Words } from './ui';

const LADDER = [
    { name: 'Open source', text: 'Tools anyone can use and check.', tag: 'Free' },
    { name: 'Project', text: 'We solve your requirement. You judge the test results.' },
    { name: 'Pilot', text: 'A first trial on your problem, with our sensors.' },
    { name: 'Deployment', text: 'PRISM at work on your programme, run by us.' },
    { name: 'Support', text: 'Updates, recalibration, traceable data.' },
    { name: 'Supply', text: 'The qualified material, made at scale by Bimo Tech.' },
];

export default function Business({ n = '02' }: { n?: string }) {
    return (
        <section id="business" className="sec business" data-theme="paper" data-nav="paper" aria-labelledby="business-title">
            <div className="wrap">
                <header className="sec-head rv">
                    <Idx n={n}>Working with us</Idx>
                    <h2 id="business-title" className="w-h2">
                        <Words>The software is open. We earn when the material is real.</Words>
                    </h2>
                    <p className="w-lead">Our prediction tools are free and open source. We are paid when a material has to exist.</p>
                </header>

                <ol className="ladder rv" aria-label="How Mirdyne works with you, from open source to supply">
                    {LADDER.map((s, i) => (
                        <li key={s.name} className={`ladder__step${i === 0 ? ' ladder__step--open' : ''}`} style={{ ['--i' as string]: i }}>
                            <span className="ladder__num">{String(i + 1).padStart(2, '0')}</span>
                            <h3>{s.name}</h3>
                            <p>{s.text}</p>
                            {s.tag && <span className="ladder__tag">{s.tag}</span>}
                        </li>
                    ))}
                </ol>
                <p className="ladder__axis rv" aria-hidden="true">
                    <span>Open software</span>
                    <i />
                    <span>Materials on your line</span>
                </p>

                <div className="markets">
                    <p className="w-label markets__label rv">Where PRISM goes first</p>
                    <MarketCards />
                </div>
            </div>
        </section>
    );
}
