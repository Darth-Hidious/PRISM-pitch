import { Button, Painting } from '../ds';
import { LINKS } from './links';
import { Grain } from './ui';

export default function Hero() {
    return (
        <section id="top" className="hero" data-theme="navy" data-nav="hero" aria-labelledby="hero-title">
            <div className="hero__art">
                <Painting
                    src="/img/spark-furnace.webp"
                    alt="Painted view into a vacuum-arc melting furnace: a glowing alloy button on the hearth, beside cooled buttons from earlier melts."
                    seed={7}
                    direction={-16}
                    motion={0.5}
                    focusX={0.5}
                    focusY={0.84}
                />
            </div>
            <div className="hero__shade" aria-hidden="true" />
            <Grain />
            <div className="wrap hero__content">
                <p className="hero__kicker rise">PRISM by Mirdyne</p>
                <h1 id="hero-title" className="w-mega rise" style={{ animationDelay: '90ms' }}>
                    Specify the capability. We&nbsp;deliver the material.
                </h1>
                <div className="hero__row">
                    <p className="w-lead rise" style={{ animationDelay: '180ms' }}>
                        PRISM is a closed-loop materials platform. It designs new alloys and polymers, has them made in
                        real processes, tests them against your requirement and keeps the evidence attached to every
                        result.
                    </p>
                    <div className="hero__actions rise" style={{ animationDelay: '260ms' }}>
                        <Button href={LINKS.interest} external>
                            Register interest
                        </Button>
                        <Button variant="secondary" href="#gap">
                            See why it matters
                        </Button>
                    </div>
                </div>
                <ul className="hero__facts rise" style={{ animationDelay: '340ms' }}>
                    <li>
                        <span className="w-label">Funded by</span>
                        <strong>The European Space Agency</strong>
                        <span>Initial development of PRISM</span>
                    </li>
                    <li>
                        <span className="w-label">First application</span>
                        <strong>Refractory alloys</strong>
                        <span>For rocket engines</span>
                    </li>
                    <li>
                        <span className="w-label">Next material class</span>
                        <strong>PFAS‑free polymers</strong>
                        <span>With an industrial partner</span>
                    </li>
                </ul>
            </div>
            <p className="hero__caption">Vacuum-arc melting, Project SPARK. Photograph repainted in code.</p>
        </section>
    );
}
