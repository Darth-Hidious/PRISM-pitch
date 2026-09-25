import { Button, SourceLine } from '../ds';
import { KnownAnswer } from './diagrams';
import { LINKS } from './links';
import { Idx } from './ui';

/** Forager: the team's open research, built with PRISM. Every figure here is from Forager's public record. */
export default function OpenResearch({ n = '02' }: { n?: string }) {
    return (
        <section id="open-research" className="sec open" data-theme="paper" data-nav="paper" aria-labelledby="open-title">
            <div className="wrap">
                <header className="sec-head rv">
                    <Idx n={n}>Open research</Idx>
                    <h2 id="open-title" className="w-h2">
                        Forager: a fruit fly’s brain, searching for new alloys.
                    </h2>
                    <p className="w-lead">
                        <b>Can a fly’s brain help find a new alloy?</b> Forager is our open research project, built with
                        PRISM. The complete wiring map of a fruit fly’s brain steers an AI that suggests alloys. The
                        question: is there a high-melting alloy that keeps one simple crystal structure from −183&nbsp;°C
                        to 727&nbsp;°C? Five checks, each more expensive than the last, decide which ideas pass.
                    </p>
                </header>

                <dl className="facts rv">
                    <div>
                        <dt>164,506</dt>
                        <dd>brain cells and 25.1 million connections in the wiring map that steers the search</dd>
                    </div>
                    <div>
                        <dt>5 checks</dt>
                        <dd>from a quick estimate to full quantum calculations, each asking one plain question</dd>
                    </div>
                    <div>
                        <dt>240+</dt>
                        <dd>experiments in the public log, each with its question, a prediction written before the run, the result and a verdict</dd>
                    </div>
                </dl>

                <figure className="open__figure rv">
                    <div className="scroll-x">
                        <KnownAnswer />
                    </div>
                    <figcaption>
                        <SourceLine label="Sources">
                            Before a check is trusted, it has to reproduce a known answer. Forager, experiment E242;
                            published value from Kim and Widom, Phys. Rev. Materials 7, 063803 (2023), with Forager’s own
                            error rule applied to it. Brain map: MaleCNS v1.0 (FlyEM, HHMI Janelia), CC BY 4.0.
                        </SourceLine>
                    </figcaption>
                </figure>

                <div className="open__cta rv">
                    <Button href={LINKS.forager} external>
                        Open Forager
                    </Button>
                    <p>Forager uses only public data. It is separate from the projects above.</p>
                </div>
            </div>
        </section>
    );
}
