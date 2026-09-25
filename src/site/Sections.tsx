import { Button, EvidenceLineage, Kicker, ObjectCard, Painting, ProcessChain, RightsManifest, RightsState, SourceLine, Stat, StatusTable, Timeline, WindowPlot } from '../ds';
import VideoBackground from '../components/VideoBackground';
import { LINKS } from './links';

/* ── Hero ─────────────────────────────────────────────────────────────── */

export function Hero() {
    return (
        <section id="top" className="hero" aria-labelledby="hero-title">
            <div className="hero__copy">
                <Kicker className="pm-rise">PRISM by Mirdyne</Kicker>
                <h1 id="hero-title" className="pm-display pm-rise" style={{ animationDelay: '80ms' }}>
                    Specify the capability. We deliver the material.
                </h1>
                <p className="pm-lead pm-rise" style={{ animationDelay: '160ms', maxWidth: 640 }}>
                    PRISM is a closed-loop materials platform. It designs candidate alloys and polymers, screens them
                    against physics and manufacturability, has them made in real processes and tested against your
                    requirement. Every result feeds the next round, with its evidence attached.
                </p>
                <div className="hero__actions pm-rise" style={{ animationDelay: '240ms' }}>
                    <Button href={LINKS.interest} external>
                        Register interest
                    </Button>
                    <Button variant="secondary" href="#platform">
                        See the platform
                    </Button>
                </div>
                <ul className="hero__facts pm-rise" style={{ animationDelay: '320ms' }}>
                    <li>
                        <strong>ESA-funded</strong>
                        PRISM Alpha, a 12-month FLPP activity taking PRISM from TRL 3 to 4.
                    </li>
                    <li>
                        <strong>Refractory alloys for rockets</strong>
                        First application: oxygen-rich preburner environments.
                    </li>
                    <li>
                        <strong>PFAS-free polymers</strong>
                        First privately funded programme, under contract.
                    </li>
                </ul>
            </div>
            <figure className="hero__media">
                <Painting
                    src="/img/spark-furnace.webp"
                    alt="Painted rendering of a vacuum-arc melting furnace with a glowing alloy button, from Project SPARK."
                    seed={7}
                    direction={-16}
                    motion={0.55}
                    focusX={0.5}
                    focusY={0.55}
                />
                <figcaption className="hero__caption">Vacuum-arc melting, Project SPARK. Photograph repainted in code.</figcaption>
            </figure>
        </section>
    );
}

/* ── 01 Why PRISM exists ──────────────────────────────────────────────── */

export function Why() {
    return (
        <section id="why" className="section" aria-labelledby="why-title">
            <div className="site-container">
                <header className="section-head reveal">
                    <Kicker>01 · Why PRISM exists</Kicker>
                    <h2 id="why-title" className="pm-title">
                        Materials decide what engineers are free to build.
                    </h2>
                    <div className="why__body">
                        <p className="pm-lead">
                            A rocket engine, a fusion reactor or an aircraft can be viable on paper and impossible in
                            practice, because no available material survives the environment it has to work in.
                            Bringing a new one into service still takes ten to twenty years.
                        </p>
                        <p className="pm-emphasis">
                            PRISM changes the starting point: define the capability first, then find the material
                            and the process that deliver it.
                        </p>
                    </div>
                </header>

                <div className="why__gap reveal">
                    <h3 className="pm-subtitle">Prediction has outrun validation.</h3>
                    <div className="why__stats">
                        <Stat size="lg" value="2.2M" label="Crystal structures predicted" note="by a single AI model" />
                        <Stat size="lg" value="381,000" label="Of them predicted stable" />
                        <Stat size="lg" value="736" label="Independently made in a lab" />
                        <Stat size="lg" value="0" label="Qualified as engineering materials" />
                    </div>
                    <SourceLine label="Sources">
                        Merchant et al., “Scaling deep learning for materials discovery”, Nature 624, 80–85 (2023).
                        Qualification count: Mirdyne.
                    </SourceLine>
                </div>

                <aside className="precedent reveal" aria-label="A precedent">
                    <div className="precedent__figures">
                        <Kicker tone="muted">A precedent</Kicker>
                        <Stat value="SX500" label="An in-house superalloy" note="became engine infrastructure" />
                        <Stat value="~12,000 psi" label="Hot oxygen-rich gas" note="the stated operating condition" />
                    </div>
                    <div className="precedent__text">
                        <p className="pm-subtitle">SpaceX built a foundry. Europe needs the same capability.</p>
                        <p className="pm-body">
                            When no available alloy survived the oxygen-rich side of Raptor, SpaceX developed SX500 and
                            built its own superalloy foundry, so materials could iterate at the speed of the engine
                            programme. European propulsion faces the same bottleneck. PRISM is building that
                            capability in Europe, and making it available to every programme that needs it.
                        </p>
                        <SourceLine>Elon Musk, 23 December 2018 and 25 May 2019.</SourceLine>
                    </div>
                </aside>
            </div>
        </section>
    );
}

/* ── Active-learning sampling grid ────────────────────────────────────── */

// 177 candidate points; the 19 measured: wide exploration first, then convergence on the optimum (last).
const SAMPLED: [number, number][] = [
    [2, 1], [17, 7], [9, 4], [4, 6], [15, 2], [12, 7], [6, 2], [13, 5], [10, 1], [16, 5],
    [11, 4], [13, 3], [12, 5], [11, 3], [13, 4], [12, 3], [11, 5], [10, 4], [12, 4],
];

function SamplingGrid() {
    const cols = 20;
    const x = (c: number) => 62 + c * 23.2;
    const y = (r: number) => 84 + r * 26;
    const hit = new Map(SAMPLED.map(([c, r], i) => [`${c},${r}`, i]));
    const dots = [];
    for (let i = 0; i < 177; i++) {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const k = hit.get(`${c},${r}`);
        const cls = k === undefined ? 'sampling__dot' : k === SAMPLED.length - 1 ? 'sampling__dot sampling__dot--best' : 'sampling__dot sampling__dot--hit';
        dots.push(<circle key={i} className={cls} cx={x(c)} cy={y(r)} r={k === undefined ? 3 : 5.5} />);
    }
    return (
        <svg className="sampling" viewBox="0 0 560 360" role="img" aria-label="177 candidate points; 19 measured before the optimum was found.">
            <text className="sampling__label" x="62" y="48">19 of 177 points measured</text>
            {dots}
            <circle className="sampling__dot sampling__dot--hit" cx="66" cy="326" r="5.5" />
            <text className="sampling__text" x="78" y="330">Measured</text>
            <circle className="sampling__dot sampling__dot--best" cx="170" cy="326" r="5.5" />
            <text className="sampling__text" x="182" y="330">Optimum</text>
            <circle className="sampling__dot" cx="270" cy="326" r="3" />
            <text className="sampling__text" x="282" y="330">Not measured</text>
        </svg>
    );
}

/* ── 03 How the stacks work together ──────────────────────────────────── */

export function Loop() {
    return (
        <section id="loop" className="section" aria-labelledby="loop-title">
            <div className="site-container">
                <header className="section-head reveal">
                    <Kicker>03 · How it works</Kicker>
                    <h2 id="loop-title" className="pm-title">
                        One loop, from requirement to physical evidence.
                    </h2>
                    <p className="pm-lead">
                        Language models can propose hypotheses. An engineering decision still has to pass through
                        requirements, physics, manufacture and physical test. PRISM runs all of it as one loop, and each
                        turn makes the next one cheaper.
                    </p>
                </header>
                <div className="reveal">
                    <ProcessChain
                        label="The PRISM loop"
                        steps={[
                            { label: 'Define', detail: 'Requirements and the benchmark to beat.' },
                            { label: 'Design', detail: 'Generative candidates, screened by physics.' },
                            { label: 'Make', detail: 'Real processes, from powder to printed coupon.' },
                            { label: 'Test', detail: 'Physical evidence against the requirement.' },
                            { label: 'Evidence', detail: 'Traceable, owned and ready for review.' },
                        ]}
                        loop="Learn: every result updates the models and the next campaign"
                    />
                </div>

                <div className="how__features">
                    <article className="feature reveal">
                        <div className="feature__media">
                            <WindowPlot />
                        </div>
                        <h3 className="pm-subtitle">A manufacturing window, not a single recipe.</h3>
                        <p className="pm-body">
                            A predicted optimum only matters if it survives real variation in feedstock, machine
                            energy and atmosphere. PRISM maps the region that can be made repeatably and shows the
                            evidence behind every boundary.
                        </p>
                        <SourceLine>PRISM programme architecture. The graphic is conceptual.</SourceLine>
                    </article>
                    <article className="feature reveal">
                        <div className="feature__media">
                            <SamplingGrid />
                        </div>
                        <h3 className="pm-subtitle">Each experiment is chosen for what it will teach.</h3>
                        <p className="pm-body">
                            PRISM uses Bayesian active learning. NIST’s CAMEO found a reported optimum in 19 iterations
                            instead of mapping all 177 points. PRISM applies the same principle while keeping several
                            promising regions open long enough to understand their physics and manufacturability.
                        </p>
                        <div className="feature__stats">
                            <Stat value="19" label="Iterations" />
                            <Stat value="177" label="Full-map points" />
                            <Stat value="~10 h" label="Instead of >90 h" />
                        </div>
                        <SourceLine>Kusne et al., Nature Communications 11, 5966 (2020). Point positions are illustrative; the counts are the paper’s.</SourceLine>
                    </article>
                </div>
            </div>
        </section>
    );
}

/* ── 04 Inside PRISM: modules and reuse (navy) ────────────────────────── */

export function Modules() {
    return (
        <section id="modules" className="section" data-theme="navy" aria-labelledby="modules-title">
            <div className="site-container">
                <header className="section-head reveal">
                    <Kicker>04 · Inside PRISM</Kicker>
                    <h2 id="modules-title" className="pm-title">
                        A reusable core. Material-specific modules.
                    </h2>
                    <p className="pm-lead">
                        Orchestration, sampling, evaluation and provenance stay the same from one programme to the
                        next. Requirements, material physics and test criteria are exchanged for each application.
                        That is how one platform moves from refractory alloys to polymers.
                    </p>
                </header>
                <div className="modules__grid reveal">
                    <ObjectCard
                        type="Module · Evolver"
                        title="Campaign planner"
                        properties={[
                            ['Does', 'Plans each campaign'],
                            ['How', 'Generator, reflector and curator over a shared playbook'],
                        ]}
                    />
                    <ObjectCard
                        type="Module · Mutator fleet"
                        title="Generative samplers"
                        properties={[
                            ['Does', 'Explores composition space'],
                            ['How', 'Diversity-weighted, conditioned on thermodynamic feasibility'],
                        ]}
                    />
                    <ObjectCard
                        type="Module · Evaluator"
                        title="Evaluator and laboratory"
                        properties={[
                            ['Does', 'Scores every candidate'],
                            ['How', 'Learned potentials, first principles, thermodynamics, then physical test'],
                        ]}
                    />
                    <ObjectCard
                        type="Module · MKG"
                        title="Materials knowledge graph"
                        emphasis
                        properties={[
                            ['Does', 'Holds what is known'],
                            ['How', 'Literature, patents and instrument data, with provenance'],
                        ]}
                    />
                </div>
                <div className="reuse reveal">
                    <div className="reuse__col">
                        <p className="pm-column">Reusable core</p>
                        <ul>
                            <li>Orchestrator, playbooks and samplers</li>
                            <li>Evaluator, knowledge-graph provenance and interfaces</li>
                            <li>Manufacturability index and evidence packaging</li>
                        </ul>
                    </div>
                    <div className="reuse__col">
                        <p className="pm-column">Changes with each application</p>
                        <ul>
                            <li>Requirements, the benchmark material and its constraints</li>
                            <li>Reward functions and material-physics modules</li>
                            <li>Test criteria and the facility interface</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── 05 Evidence and IP (navy console) ────────────────────────────────── */

export function Evidence() {
    return (
        <section id="evidence" className="section" data-theme="navy" aria-labelledby="evidence-title">
            <div className="site-container">
                <header className="section-head reveal">
                    <Kicker>05 · Evidence and IP</Kicker>
                    <h2 id="evidence-title" className="pm-title">
                        Every claim keeps its evidence, its owner and its rights attached.
                    </h2>
                    <p className="pm-lead">
                        Industrial partners share data only when they keep control of it. PRISM treats provenance and
                        data rights as part of the material: every requirement, composition, build, specimen, test and
                        decision records where it came from, who owns it and what it may be used for.
                    </p>
                </header>

                <div className="trust">
                    <div className="reveal">
                        <p className="pm-column" style={{ marginBottom: 16 }}>
                            Lineage of one engineering decision
                        </p>
                        <EvidenceLineage
                            nodes={[
                                { type: 'Requirement', title: 'Oxygen-rich preburner environment', state: 'private' },
                                { type: 'Candidate design', title: 'Refractory high-entropy alloy', state: 'private' },
                                { type: 'Build', title: 'LPBF coupon build', state: 'computable' },
                                { type: 'Specimen', title: 'Test coupon', state: 'computable' },
                                { type: 'Test', title: 'Oxygen-compatibility test', state: 'computable' },
                                { type: 'Property estimate', title: 'Ignition resistance against the benchmark', state: 'released' },
                                { type: 'Decision', title: 'Carry forward to the next round', state: 'released' },
                            ]}
                            links={['motivates', 'instantiated as', 'produced', 'measured by', 'supports', 'justifies']}
                        />
                    </div>
                    <div className="trust__side">
                        <div className="reveal">
                            <p className="pm-column" style={{ marginBottom: 16 }}>
                                Four states, never changed implicitly
                            </p>
                            <div className="trust__states">
                                <div className="trust__state">
                                    <RightsState state="private" />
                                    <p>Stays inside the organisation that produced it.</p>
                                </div>
                                <div className="trust__state">
                                    <RightsState state="computable" />
                                    <p>Approved workloads may compute on it. No person or party inspects it.</p>
                                </div>
                                <div className="trust__state">
                                    <RightsState state="released" />
                                    <p>An approved derivative, shared with named parties under a signed release.</p>
                                </div>
                                <div className="trust__state">
                                    <RightsState state="public" />
                                    <p>Deliberately published.</p>
                                </div>
                            </div>
                        </div>
                        <ol className="trust__rules reveal">
                            <li>
                                <span>01</span>Derived results inherit the strictest rights of their inputs.
                            </li>
                            <li>
                                <span>02</span>Training is a separate right. Analysing a partner’s data never implies
                                permission to train on it.
                            </li>
                            <li>
                                <span>03</span>Export classification is a property of the data, checked at every exit.
                            </li>
                            <li>
                                <span>04</span>Partners can take their data and its provenance with them. Nobody is
                                locked in.
                            </li>
                        </ol>
                        <div className="reveal">
                            <RightsManifest
                                caption="Rights manifest"
                                note="Illustrative"
                                rows={[
                                    ['owner', 'Customer A'],
                                    ['custodian', 'Mirdyne'],
                                    ['purpose', 'programme-x material development'],
                                    ['aggregate properties', { allow: 'permitted' }],
                                    ['raw composition', { deny: 'prohibited' }],
                                    ['model training', 'explicit approval required'],
                                    ['export', 'EU regime · classification on file'],
                                ]}
                            />
                        </div>
                    </div>
                </div>

                <div className="trust__ip reveal">
                    <Kicker tone="muted" as="span">
                        IP
                    </Kicker>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <p className="pm-emphasis">
                            Generative sampling conditioned on thermodynamic feasibility reaches metastable alloys that
                            equilibrium screening excludes. Patent filings are in progress.
                        </p>
                        <SourceLine label="Maturity">
                            Provenance and export classification are maintained on ESA work today. Machine-enforced data
                            rights and controlled release are in development. The lineage and manifest shown are
                            illustrative, not customer data.
                        </SourceLine>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── 06 Programmes ────────────────────────────────────────────────────── */

export function Programmes() {
    return (
        <section id="programmes" className="section" aria-labelledby="programmes-title">
            <div className="site-container">
                <header className="section-head reveal">
                    <Kicker>06 · Programmes</Kicker>
                    <h2 id="programmes-title" className="pm-title">
                        Funded, contracted and in the lab.
                    </h2>
                    <p className="pm-lead">
                        PRISM works inside a European Space Agency programme with an industrial consortium around it,
                        and its next material class is already under contract.
                    </p>
                </header>
                <div className="reveal">
                    <StatusTable
                        rows={[
                            {
                                entity: 'Project SPARK',
                                entityNote: 'ESA activity · Bimo Tech',
                                status: { label: 'Active', tone: 'accent' },
                                statement: [
                                    'Moved the work from candidate space into real alloys.',
                                    'Eight refractory high-entropy alloy candidates taken to two physical down-selections, now assessed for oxygen ignition, hot-gas erosion and LPBF manufacturability near 1,200 °C.',
                                ],
                            },
                            {
                                entity: 'PRISM Alpha',
                                entityNote: 'ESA · FLPP FIRST! Simulation & Intelligence',
                                status: { label: 'Awarded', tone: 'accent' },
                                statement: [
                                    'The first complete PRISM loop, on an oxygen-rich preburner problem.',
                                    'Twelve months to take PRISM from TRL 3 to 4: at least three candidates, one complete closed loop and coupon-level evidence against the Monel K500 benchmark.',
                                ],
                            },
                            {
                                entity: 'PFAS-free polymers',
                                entityNote: 'Industrial partner · under NDA',
                                status: { label: 'Contracted', tone: 'teal' },
                                statement: [
                                    'PRISM’s first privately funded programme and its first polymer class.',
                                    'Contract and NDA signed; work starts next. ESA has flagged the same need to replace PFAS-based materials.',
                                ],
                            },
                            {
                                entity: 'Fusion heritage',
                                entityNote: 'Bimo Tech · ITER',
                                status: { label: 'Delivered', tone: 'accent' },
                                statement: [
                                    'Bimo Tech has supplied materials and components to ITER.',
                                    'Including titanium first-wall materials and rhodium targets.',
                                ],
                            },
                        ]}
                    />
                    <div style={{ marginTop: 16 }}>
                        <SourceLine label="Sources">ESA contract records; Mirdyne and Bimo Tech programme records.</SourceLine>
                    </div>
                </div>

                <div className="consortium reveal" aria-label="PRISM Alpha consortium">
                    <div>
                        <strong>European Space Agency</strong>
                        <span>Customer, through the Future Launchers Preparatory Programme</span>
                    </div>
                    <div>
                        <strong>Bimo Tech</strong>
                        <span>Prime contractor. High-entropy alloys and industrial manufacturing</span>
                    </div>
                    <div>
                        <strong>ArianeGroup</strong>
                        <span>Requirements and validation</span>
                    </div>
                    <div>
                        <strong>Fraunhofer IAPT</strong>
                        <span>LPBF process windows and manufacturability</span>
                    </div>
                    <div>
                        <strong>amsight</strong>
                        <span>Manufacturing and test data infrastructure</span>
                    </div>
                </div>

                <figure className="programmes__photo reveal">
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
            </div>
        </section>
    );
}

/* ── 07 Business ──────────────────────────────────────────────────────── */

const OFFERS = [
    { name: 'Programme', text: 'An experimental campaign against your requirements, accepted on evidence.' },
    { name: 'Pilot', text: 'Probe deployment, calibration and a reference run on your problem.' },
    { name: 'Deployment', text: 'PRISM installed on your hardware, under your sign-off process.' },
    { name: 'Support', text: 'Recalibration, data traceability and versioned releases.' },
    { name: 'Transfer', text: 'Validated process documentation handed to your own team.' },
];

const MARKETS = [
    { name: 'Space propulsion', text: 'Refractory alloys for oxygen-rich rocket engine environments. Our first application.' },
    { name: 'Defence and dual-use', text: 'Materials, robotics and test systems for defence programmes, with export control built into the data layer.' },
    { name: 'Fusion and energy', text: 'Plasma-facing materials, efficient turbines and batteries.' },
    { name: 'Strategic autonomy', text: 'Substitutes for critical inputs such as tungsten and permanent magnets.' },
    { name: 'Regulatory replacement', text: 'Alternatives for more than 250 materials under EU REACH, starting with PFAS.' },
    { name: 'Key technologies', text: 'Semiconductors and lightweight polymers.' },
];

export function Business() {
    return (
        <section id="business" className="section" aria-labelledby="business-title">
            <div className="site-container">
                <header className="section-head reveal">
                    <Kicker>07 · How we work with you</Kicker>
                    <h2 id="business-title" className="pm-title">
                        Open where it learns. Paid where it becomes physical.
                    </h2>
                    <p className="pm-lead">
                        Prediction, ranking and materials informatics are released open source. Mirdyne is paid when a
                        material has to exist: in a programme, a pilot or a deployment on your own hardware.
                    </p>
                </header>
                <div className="offers reveal">
                    <div className="offer offer--open">
                        <p className="pm-column">Open source</p>
                        <h3>Prediction and ranking</h3>
                        <p>Materials informatics anyone can use and inspect.</p>
                    </div>
                    {OFFERS.map((o) => (
                        <div key={o.name} className="offer">
                            <span className="offer__rule" aria-hidden="true" />
                            <h3>{o.name}</h3>
                            <p>{o.text}</p>
                        </div>
                    ))}
                </div>
                <div className="markets reveal">
                    {MARKETS.map((m) => (
                        <div key={m.name} className="market">
                            <h3>{m.name}</h3>
                            <p>{m.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── 08 Roadmap (navy) ────────────────────────────────────────────────── */

export function Roadmap() {
    return (
        <section id="roadmap" className="section" data-theme="navy" aria-labelledby="roadmap-title">
            <div className="site-container">
                <header className="section-head reveal">
                    <Kicker>08 · Where it goes</Kicker>
                    <h2 id="roadmap-title" className="pm-title">
                        Two branches. One discipline.
                    </h2>
                    <p className="pm-lead">
                        One branch extends the loop across material classes. The other applies the same provenance,
                        uncertainty and network models to how a change moves through suppliers, materials, components
                        and programmes.
                    </p>
                </header>
                <div className="roadmap reveal">
                    <div className="roadmap__branch">
                        <h3>Materials programmes</h3>
                        <Timeline
                            label="Materials programmes"
                            items={[
                                { date: 'Active', title: 'Project SPARK', detail: 'Refractory high-entropy alloys' },
                                { date: 'Awarded', title: 'PRISM Alpha', detail: 'The first complete loop', state: 'current' },
                                { date: 'Contracted', title: 'PFAS-free polymers', detail: 'First polymer class', state: 'next' },
                                { date: 'Next', title: 'Polymers and bio-based materials', state: 'next' },
                            ]}
                        />
                    </div>
                    <div className="roadmap__branch">
                        <h3>Systems intelligence</h3>
                        <Timeline
                            label="Systems intelligence"
                            items={[
                                { date: 'Internal', title: 'Supply risk', detail: 'Internal capability' },
                                { date: 'Prototype', title: 'Market signals', state: 'current' },
                                { date: 'Exploratory', title: 'Programme risk', state: 'next' },
                                { date: 'Next', title: 'Weak signals', state: 'next' },
                            ]}
                        />
                    </div>
                </div>
                <figure className="roadmap__figure reveal">
                    <img
                        src="/img/event-network.webp"
                        alt="Illustrative network: an event propagating from a supplier through material and manufacturing to a component."
                        width={1800}
                        height={581}
                        loading="lazy"
                    />
                    <figcaption>
                        <SourceLine label="Illustrative">
                            An event propagating from supplier to material, manufacturing and component. Method: PRISM’s
                            proposed adaptation of Okawa et al., “Dynamic Hawkes Processes for Discovering Time-evolving
                            Communities”, KDD 2021.
                        </SourceLine>
                    </figcaption>
                </figure>
                <p className="pm-subtitle roadmap__close reveal">
                    The branches differ in application. The discipline is the same: every claim keeps its source, its
                    uncertainty and its consequences attached.
                </p>
            </div>
        </section>
    );
}

/* ── 09 Company ───────────────────────────────────────────────────────── */

export function Company() {
    return (
        <section id="company" className="section" aria-labelledby="company-title">
            <div className="site-container split">
                <header className="reveal" style={{ display: 'grid', gap: 24, alignContent: 'start' }}>
                    <Kicker>09 · Company</Kicker>
                    <h2 id="company-title" className="pm-title">
                        Mirdyne builds PRISM.
                    </h2>
                    <p className="pm-lead">
                        Mirdyne is a spin-off of Bimo Tech, which develops and manufactures high-performance metal
                        components and high-entropy alloys. We are based in Giessen, Germany, and build PRISM with the
                        European Space Agency, ArianeGroup, Fraunhofer IAPT and amsight.
                    </p>
                    <img src="/brand/mirdyne-lockup-ink.png" alt="Mirdyne" width={183} height={50} style={{ marginTop: 8 }} />
                </header>
                <div className="founders reveal" style={{ alignContent: 'start' }}>
                    <div className="founder">
                        <p className="pm-column">Managing Director</p>
                        <h3>Kevin Grüning</h3>
                        <p>
                            Space Systems Lead at Bimo Tech. Physics and technology for space applications, JLU Giessen
                            and THM.
                        </p>
                    </div>
                    <div className="founder">
                        <p className="pm-column">Technical Lead</p>
                        <h3>Siddhartha Yash Kovid</h3>
                        <p>
                            Technical lead of Project SPARK and PRISM Alpha at Bimo Tech. Applied AI and data science,
                            MIT Professional Education; biomedical engineering, THM.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── Contact (navy, video) ────────────────────────────────────────────── */

export function Contact() {
    return (
        <section id="contact" className="section contact" data-theme="navy" aria-labelledby="contact-title">
            <div className="contact__video" aria-hidden="true">
                <VideoBackground src="https://stream.mux.com/00qQnfNo7sSpn3pB1hYKkyeSDvxs01NxiQ3sr29uL3e028.m3u8" />
            </div>
            <div className="site-container">
                <div className="contact__inner reveal">
                    <Kicker>Start</Kicker>
                    <h2 id="contact-title" className="pm-display">
                        Start with the capability you need.
                    </h2>
                    <p className="pm-lead">
                        Tell us the environment your part has to survive. We will tell you what PRISM can search, how we
                        would prove it and what it would take.
                    </p>
                    <div className="contact__actions">
                        <Button href={LINKS.interest} external>
                            Register interest
                        </Button>
                        <Button variant="secondary" href={LINKS.deck}>
                            Read the investor briefing
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
