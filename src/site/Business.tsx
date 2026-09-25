import { Idx, Words } from './ui';

const LADDER = [
    { name: 'Open source', text: 'Tools anyone can use and check.', tag: 'Free' },
    { name: 'Project', text: 'We solve your requirement. You judge the test results.' },
    { name: 'Pilot', text: 'A first trial on your problem, with our sensors.' },
    { name: 'Deployment', text: 'PRISM on your own machines.' },
    { name: 'Support', text: 'Updates, recalibration, traceable data.' },
    { name: 'Transfer', text: 'The proven process, handed to your team.' },
];

const MARKETS = [
    { name: 'Space propulsion', text: 'Alloys for rocket engines. Our first application.' },
    { name: 'Defence', text: 'Materials and test systems, with export rules built in.' },
    { name: 'Fusion and energy', text: 'Fusion reactors, turbines and batteries.' },
    { name: 'Supply independence', text: 'Replacements for hard-to-get metals.' },
    { name: 'Replacing harmful substances', text: 'Alternatives to substances of very high concern, starting with PFAS.' },
    { name: 'Key technologies', text: 'Semiconductors and lightweight polymers.' },
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

                <ol className="ladder rv" aria-label="How Mirdyne works with you, from open source to transfer">
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

                <div className="markets rv">
                    <p className="w-label">Where PRISM goes first</p>
                    <ul className="markets__grid">
                        {MARKETS.map((m, i) => (
                            <li key={m.name}>
                                <span className="markets__num">{String(i + 1).padStart(2, '0')}</span>
                                <h3>{m.name}</h3>
                                <p>{m.text}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
