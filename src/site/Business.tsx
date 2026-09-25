import { Idx } from './ui';

const LADDER = [
    { name: 'Open source', text: 'Prediction and data tools that anyone can use and check.', tag: 'Free' },
    { name: 'Project', text: 'We run a project against your requirement. You judge it on the test results.' },
    { name: 'Pilot', text: 'We install our sensors, calibrate them and run a first trial on your problem.' },
    { name: 'Deployment', text: 'PRISM on your own machines, under your own approval process.' },
    { name: 'Support', text: 'Recalibration, traceable data and regular updates.' },
    { name: 'Transfer', text: 'The proven process, written down and handed to your team.' },
];

const MARKETS = [
    { name: 'Space propulsion', text: 'Alloys for rocket engines. Our first application.' },
    { name: 'Defence', text: 'Materials, robots and test systems for defence, with export rules built into the data.' },
    { name: 'Fusion and energy', text: 'Materials for fusion reactors, efficient turbines and batteries.' },
    { name: 'Supply independence', text: 'Replacements for hard-to-get materials such as tungsten and magnet metals.' },
    { name: 'Replacing harmful substances', text: 'Alternatives for more than 250 substances the EU lists as of very high concern (REACH), starting with PFAS.' },
    { name: 'Key technologies', text: 'Semiconductors and lightweight polymers.' },
];

export default function Business({ n = '02' }: { n?: string }) {
    return (
        <section id="business" className="sec business" data-theme="paper" data-nav="paper" aria-labelledby="business-title">
            <div className="wrap">
                <header className="sec-head rv">
                    <Idx n={n}>Working with us</Idx>
                    <h2 id="business-title" className="w-h2">
                        The software is open. We earn when the material is real.
                    </h2>
                    <p className="w-lead">
                        Our prediction and data tools are free and open source. We are paid when a material has to
                        exist: in a project, a pilot or on your own machines.
                    </p>
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
