import { useEffect } from 'react';
import { LivePainting, SourceLine } from '../ds';
import { globeScene, globeState } from './globe';
import { useStickyValue } from './hooks';
import { Grain } from './ui';

const stepFor = (p: number) => (p < 0.3 ? 0 : p < 0.62 ? 1 : 2);

/**
 * Why Europe: a painted globe turns from the Americas to Europe as you
 * scroll, and the EU and ESA member states light up.
 */
export default function Europe() {
    const [ref, step] = useStickyValue<HTMLElement, number>(stepFor, 0);

    // The globe reads the scroll position itself, every frame it paints.
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        globeState.progress = () => {
            const r = el.getBoundingClientRect();
            const total = r.height - window.innerHeight;
            return total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
        };
        return () => {
            globeState.progress = () => 0;
        };
    }, [ref]);

    return (
        <section id="europe" ref={ref} className="europe" data-theme="navy" data-nav="navy" aria-labelledby="europe-title">
            <div className="europe__stage">
                <LivePainting
                    className="europe__art"
                    scene={globeScene}
                    alt="Painted globe turning from the Americas across the Atlantic to Europe, where the EU and ESA member states light up and Giessen is marked."
                    fallback={{ src: '/img/globe-europe.webp', seed: 13, direction: -10, motion: 0.4, focusX: 0.66, focusY: 0.5 }}
                />
                <div className="europe__shade" aria-hidden="true" />
                <Grain />
                <div className="wrap europe__inner">
                    <p className="w-label europe__kicker">Why Europe</p>
                    <div className="europe__steps">
                        <div className={`europe__step${step === 0 ? ' is-on' : ''}`}>
                            <h2 id="europe-title" className="w-h2">
                                Materials are a question of sovereignty.
                            </h2>
                            <p className="w-lead">
                                What a country can build depends on what it can make. For some raw materials, the EU
                                depends almost entirely on a single country.
                            </p>
                        </div>
                        <div className={`europe__step${step === 1 ? ' is-on' : ''}`} aria-hidden={step !== 1}>
                            <p className="w-num europe__num">65%</p>
                            <p className="europe__label">
                                The most that any one country outside the EU should supply of a strategic raw
                                material, by 2030. That is the EU’s own target.
                            </p>
                            <p className="europe__text">New materials, made from what Europe has, are part of the answer.</p>
                        </div>
                        <div className={`europe__step${step === 2 ? ' is-on' : ''}`} aria-hidden={step !== 2}>
                            <h3 className="w-h2 europe__h">PRISM builds that ability in Europe.</h3>
                            <ul className="europe__list">
                                <li>
                                    <b>Designed</b> in Giessen, Germany
                                </li>
                                <li>
                                    <b>Made and scaled up</b> by Bimo Tech
                                </li>
                                <li>
                                    <b>Funded</b> by the European Space Agency
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="europe__foot">
                        <SourceLine label="Sources">
                            EU Critical Raw Materials Act, Regulation (EU) 2024/1252, recital 12 and Article 5. Earth:
                            NASA Blue Marble (public domain), repainted in code. Lit: the EU member states and the ESA
                            member states outside the EU.
                        </SourceLine>
                    </div>
                </div>
            </div>
        </section>
    );
}
