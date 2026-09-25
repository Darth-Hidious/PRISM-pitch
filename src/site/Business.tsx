import { Idx } from './ui';

const LADDER = [
    { name: 'Open source', text: 'Prediction, ranking and materials informatics that anyone can use and inspect.', tag: 'Free' },
    { name: 'Programme', text: 'An experimental campaign against your requirements, accepted on evidence.' },
    { name: 'Pilot', text: 'Probe deployment, calibration and a reference run on your problem.' },
    { name: 'Deployment', text: 'PRISM installed on your hardware, under your sign-off process.' },
    { name: 'Support', text: 'Recalibration, data traceability and versioned releases.' },
    { name: 'Transfer', text: 'Validated process documentation handed to your own team.' },
];

const MARKETS = [
    { name: 'Space propulsion', text: 'Refractory alloys for rocket engines. Our first application.' },
    { name: 'Defence and dual-use', text: 'Materials, robotics and test systems for defence programmes, with export control designed into the data layer.' },
    { name: 'Fusion and energy', text: 'Plasma-facing materials, efficient turbines and batteries.' },
    { name: 'Strategic autonomy', text: 'Substitutes for critical inputs such as tungsten and permanent magnets.' },
    { name: 'Regulatory replacement', text: 'Alternatives for more than 250 materials under EU REACH, starting with PFAS.' },
    { name: 'Key technologies', text: 'Semiconductors and lightweight polymers.' },
];

export default function Business() {
    return (
        <section id="business" className="sec business" data-theme="paper" data-nav="paper" aria-labelledby="business-title">
            <div className="wrap">
                <header className="sec-head rv">
                    <Idx n="06">Working with us</Idx>
                    <h2 id="business-title" className="w-h2">
                        Open where it learns. Paid where it becomes physical.
                    </h2>
                    <p className="w-lead">
                        Prediction, ranking and materials informatics are released open source. Mirdyne is paid when a
                        material has to exist: in a programme, a pilot or a deployment on your own hardware.
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
