import { Button } from '../ds';
import { LINKS } from './links';
import { CONSORTIUM, PartnerLogo } from './partners';
import { Grain } from './ui';

/**
 * The first screen: one clear line over what the material has to survive. The photograph runs edge to
 * edge where the screen is wider than tall; on upright screens it sits whole above the text. Credited in
 * the footer.
 */
export default function Hero() {
    return (
        <>
            <section id="top" className="hero" data-theme="navy" data-nav="hero" aria-labelledby="hero-title">
                <figure className="hero__media">
                    <img
                        src="/img/dlr-vulcain2-p5.webp"
                        alt="A Vulcain 2 rocket engine firing on a test stand: flame pours out beneath the ribbed metal nozzle."
                        width={1348}
                        height={758}
                        fetchPriority="high"
                    />
                </figure>
                <Grain />
                <div className="wrap hero__content">
                    <h1 id="hero-title" className="w-mega rise" style={{ animationDelay: '90ms' }}>
                        Materials built for the&nbsp;extreme.
                    </h1>
                    <p className="w-lead hero__lead rise" style={{ animationDelay: '180ms' }}>
                        Designed with AI. Made and tested in Europe.
                    </p>
                    <div className="hero__actions rise" style={{ animationDelay: '260ms' }}>
                        <Button href={LINKS.interest}>Register interest</Button>
                        <Button variant="secondary" href="#gap">
                            The problem
                        </Button>
                    </div>
                </div>
            </section>
            <aside className="proof" data-theme="navy" data-nav="navy" aria-label="PRISM in brief">
                <ul className="wrap proof__list">
                    <li>
                        <span className="w-label">Funded by</span>
                        <strong>The European Space Agency</strong>
                        <span>PRISM’s first deployment</span>
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
                <div className="wrap proof__partners">
                    <p className="w-label">PRISM Alpha, with</p>
                    <ul aria-label="PRISM Alpha consortium">
                        {CONSORTIUM.map((p) => (
                            <li key={p.id}>
                                <PartnerLogo p={p} />
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
        </>
    );
}
