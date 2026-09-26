import { RightsState } from '../ds';
import type { Visibility } from '../ds/RightsState';
import CameoLineage from './Cameo';
import { PartDiagram } from './diagrams';
import RecordMap from './RecordMap';
import { Grain, Idx, Note, Rails, Words } from './ui';

const STATES: { state: Visibility; text: string }[] = [
    { state: 'private', text: 'Stays with the company that made it.' },
    { state: 'computable', text: 'Software may use it. No person reads it.' },
    { state: 'released', text: 'Shared with named partners, signed.' },
    { state: 'public', text: 'Published on purpose, never by default.' },
];

const RULES = [
    'Anything made from data keeps the strictest rules of its inputs.',
    'Training AI on a partner’s data needs its own permission.',
    'Export rules travel with the data.',
    'Partners can leave at any time and take their data with them.',
];

const GIVES = [
    ['What it is made of', 'Standard lab analysis'],
    ['Trace gases', 'Oxygen, nitrogen and carbon'],
    ['Its inner structure', 'X-ray and electron microscopes'],
    ['Clues about how it was made', 'Hints, not the recipe'],
];

const KEEPS = [
    ['The safe settings', 'What still works when things vary'],
    ['The failures', 'Every idea that did not work, and why'],
    ['The history', 'From requirement to decision'],
    ['The proof', 'Test results, and the ability to make it again'],
];

/**
 * Proof: on the Method page. Every record carries where it came from and who may see it,
 * shown as a live map; then a real lineage (NIST's CAMEO) and what a finished part does and does not
 * give away.
 */
export default function Proof({ n = '03' }: { n?: string }) {
    return (
        <section id="proof" className="sec evidence" data-theme="navy" data-nav="navy" aria-labelledby="proof-title">
            <Rails />
            <Grain />
            <div className="wrap">
                <header className="sec-head rv">
                    <Idx n={n}>Proof</Idx>
                    <h2 id="proof-title" className="w-h2">
                        <Words>We keep the evidence for every result.</Words>
                    </h2>
                    <p className="w-lead">
                        Each record shows where it came from and who may see it. Switch the viewer to see what each
                        partner sees.
                    </p>
                </header>

                <div id="sharing" className="rv">
                    <RecordMap />
                    <ul className="proof__key" aria-label="Four levels of sharing">
                        {STATES.map((st) => (
                            <li key={st.state}>
                                <RightsState state={st.state} />
                                <span>{st.text}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="evidence__src">
                        <Note label="Illustrative">
                            Made-up parties and records, not customer data. Tracing and export labels work today;
                            automatic enforcement of sharing rules is being built.
                        </Note>
                    </div>
                </div>

                <div className="trust rv">
                    <p className="w-label trust__label">Rules PRISM follows</p>
                    <ol className="trust__rules">
                        {RULES.map((r, i) => (
                            <li key={r}>
                                <span>{String(i + 1).padStart(2, '0')}</span>
                                {r}
                            </li>
                        ))}
                    </ol>
                </div>

                <CameoLineage />

                <div id="ip" className="ip rv" aria-labelledby="ip-title">
                    <div className="ip__head">
                        <p className="w-label trust__label">What stays yours</p>
                        <h3 id="ip-title" className="w-h2 ip__title">
                            <Words>A finished part does not give away how it was made.</Words>
                        </h3>
                        <figure className="ip__photo">
                            <img
                                src="/img/spark-button-side.webp"
                                alt="A cast alloy button with a crystalline surface, resting in a red lid on a lab bench."
                                width={1120}
                                height={940}
                                loading="lazy"
                            />
                            <figcaption>An alloy button, as cast.</figcaption>
                        </figure>
                    </div>
                    <figure className="ip__plate" data-theme="paper">
                        <PartDiagram />
                    </figure>
                    <div className="ip__grid">
                        <div className="ip__col">
                            <p className="w-label">What a part gives away</p>
                            <ul>
                                {GIVES.map(([k, v]) => (
                                    <li key={k}>
                                        <strong>{k}</strong>
                                        <span>{v}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="ip__col ip__col--keep">
                            <p className="w-label">What stays with its owner</p>
                            <ul>
                                {KEEPS.map(([k, v]) => (
                                    <li key={k}>
                                        <strong>{k}</strong>
                                        <span>{v}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <p className="ip__foot">Patent filings on PRISM’s methods are in progress.</p>
                </div>
            </div>
        </section>
    );
}
