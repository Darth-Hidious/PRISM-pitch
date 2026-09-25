import { Button, SourceLine } from '../ds';
import { KnownAnswer } from './diagrams';
import { LINKS } from './links';
import { Idx } from './ui';

/** Forager: the team's open research, built with PRISM. Every figure here is from Forager's public record. */
export default function OpenResearch() {
    return (
        <section id="open-research" className="sec open" data-theme="paper" data-nav="paper" aria-labelledby="open-title">
            <div className="wrap">
                <header className="sec-head rv">
                    <Idx n="08">Open research</Idx>
                    <h2 id="open-title" className="w-h2">
                        Forager, a fly’s brain searching for refractory alloys.
                    </h2>
                    <p className="w-lead">
                        <b>
                            Is there a refractory alloy that stays one body-centred cubic phase at every temperature from
                            90 to 1000 K?
                        </b>{' '}
                        Forager is our open research on that question, built with PRISM. A generator steered by the whole
                        connectome of a male fruit fly proposes alloys; a fidelity ladder of five rungs decides, at rising
                        cost, whether each one passes.
                    </p>
                </header>

                <dl className="facts rv">
                    <div>
                        <dt>164,506</dt>
                        <dd>neurons and 25.1 million connections in the connectome that steers the search</dd>
                    </div>
                    <div>
                        <dt>5 rungs</dt>
                        <dd>from a cluster expansion to density-functional theory, each asked one plain question</dd>
                    </div>
                    <div>
                        <dt>240+</dt>
                        <dd>experiments in the log, each with its question, a prediction written before the run, the result and a verdict</dd>
                    </div>
                </dl>

                <figure className="open__figure rv">
                    <div className="scroll-x">
                        <KnownAnswer />
                    </div>
                    <figcaption>
                        <SourceLine label="Sources">
                            Before a rung is trusted it has to reproduce a known answer. Forager, experiment E242;
                            published value from Kim and Widom, Phys. Rev. Materials 7, 063803 (2023), with Forager’s
                            own error rule applied to it. Connectome: MaleCNS v1.0 (FlyEM, HHMI Janelia), CC BY 4.0.
                        </SourceLine>
                    </figcaption>
                </figure>

                <div className="open__cta rv">
                    <Button href={LINKS.forager} external>
                        Open Forager
                    </Button>
                    <p>Forager runs on public data and is separate from the programmes above.</p>
                </div>
            </div>
        </section>
    );
}
