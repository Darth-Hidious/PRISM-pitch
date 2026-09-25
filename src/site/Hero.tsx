import { Button } from '../ds';
import { LINKS } from './links';
import { Grain } from './ui';

export default function Hero() {
    return (
        <section id="top" className="hero" data-theme="navy" data-nav="hero" aria-labelledby="hero-title">
            <figure className="hero__photo">
                <img
                    src="/img/spark-furnace.webp"
                    alt="View through the window of a vacuum-arc melting furnace in Project SPARK: a glowing alloy button on the hearth, cooled buttons from earlier melts beside it, the electrode above."
                    width={989}
                    height={1144}
                    fetchPriority="high"
                />
                <figcaption>Vacuum-arc melting, Project SPARK. Photograph: Bimo Tech.</figcaption>
            </figure>
            <Grain />
            <div className="wrap hero__content">
                <p className="hero__kicker rise">PRISM by Mirdyne</p>
                <h1 id="hero-title" className="w-mega rise" style={{ animationDelay: '90ms' }}>
                    Tell us what your part must survive. We&nbsp;deliver the material.
                </h1>
                <div className="hero__row">
                    <p className="w-lead rise" style={{ animationDelay: '180ms' }}>
                        PRISM uses AI to design new alloys and polymers. Then we make them, test them and hand you the
                        proof.
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
                        <strong>Alloys for extreme heat</strong>
                        <span>For rocket engines</span>
                    </li>
                    <li>
                        <span className="w-label">Next</span>
                        <strong>PFAS‑free polymers</strong>
                        <span>Replacing “forever chemicals”, with an industrial partner</span>
                    </li>
                </ul>
            </div>
        </section>
    );
}
