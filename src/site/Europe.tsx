import { Note } from './ui';

/**
 * Why Europe: the case for making materials here, over ESA's true-colour mosaic of Europe from the
 * Envisat satellite (CC BY-SA 3.0 IGO; credited in the footer).
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
                    Europe can’t build what it can’t make.
                </h2>
                <p className="w-lead europe__lead">
                    For some critical raw materials, the EU relies almost entirely on one country.
                </p>
                <dl className="europe__facts">
                    <div>
                        <dt>65%</dt>
                        <dd>The most of any strategic raw material the EU wants from one outside country by 2030.</dd>
                    </div>
                    <div>
                        <dt>SX500</dt>
                        <dd>No existing alloy could survive inside SpaceX’s Raptor engine, so SpaceX made its own.</dd>
                    </div>
                </dl>
                <p className="europe__close">
                    <b>PRISM builds that ability in Europe:</b> designed in Giessen, made by Bimo Tech.
                </p>
                <div className="europe__foot">
                    <Note>
                        EU Critical Raw Materials Act, Regulation (EU) 2024/1252, recital 12 and Article 5. SX500: Elon
                        Musk, 23 December 2018 and 25 May 2019.
                    </Note>
                </div>
            </div>
        </section>
    );
}
