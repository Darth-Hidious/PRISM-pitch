import { SourceLine } from '../ds';

const CC = 'https://creativecommons.org/licenses/by-sa/3.0/igo/';

/**
 * Why Europe: the case for making materials here, over ESA's true-colour
 * mosaic of Europe from the Envisat satellite (CC BY-SA 3.0 IGO).
 */
export default function Europe() {
    return (
        <section id="europe" className="europe" data-theme="navy" data-nav="navy" aria-labelledby="europe-title">
            <figure className="europe__photo">
                <img
                    src="/img/esa-europe-2400.webp"
                    srcSet="/img/esa-europe-1280.webp 1280w, /img/esa-europe-2400.webp 2400w"
                    sizes="100vw"
                    alt="Europe from space: a true-colour satellite mosaic from Iceland and Ireland to the Black Sea."
                    width={2400}
                    height={1599}
                    loading="lazy"
                />
            </figure>
            <div className="europe__shade" aria-hidden="true" />
            <div className="wrap europe__inner rv">
                <p className="w-label europe__kicker">Why Europe</p>
                <h2 id="europe-title" className="w-h2">
                    Materials are a question of sovereignty.
                </h2>
                <p className="w-lead europe__lead">
                    What a country can build depends on what it can make. For some raw materials, the EU depends almost
                    entirely on a single country.
                </p>
                <dl className="europe__facts">
                    <div>
                        <dt>65%</dt>
                        <dd>
                            The most that any one country outside the EU should supply of a strategic raw material, by
                            2030. That is the EU’s own target.
                        </dd>
                    </div>
                    <div>
                        <dt>SX500</dt>
                        <dd>
                            No existing alloy could survive inside SpaceX’s Raptor engine. So SpaceX invented its own,
                            and built a foundry to make it.
                        </dd>
                    </div>
                </dl>
                <p className="europe__close">
                    <b>Europe needs the same ability. PRISM builds it here:</b> designed in Giessen, Germany, made and
                    scaled up by Bimo Tech.
                </p>
                <div className="europe__foot">
                    <SourceLine label="Sources">
                        EU Critical Raw Materials Act, Regulation (EU) 2024/1252, recital 12 and Article 5. SX500: Elon
                        Musk, 23 December 2018 and 25 May 2019. Image: ESA, Envisat MERIS mosaic of Europe,{' '}
                        <a href={CC} target="_blank" rel="noopener noreferrer license">
                            CC BY-SA 3.0 IGO
                        </a>
                        , resized.
                    </SourceLine>
                </div>
            </div>
        </section>
    );
}
