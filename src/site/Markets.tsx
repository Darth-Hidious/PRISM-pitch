import type { CSSProperties } from 'react';
import { Idx, Words } from './ui';

/** Where PRISM goes first: one photograph for each market, what PRISM does there, and how far along it is. */
const MARKETS = [
    {
        id: 'space',
        chip: 'Now',
        title: 'Space propulsion',
        text: 'Alloys for the hottest parts of rocket engines. First with ESA and ArianeGroup.',
        img: '/img/markets/space.webp',
        alt: 'The Aestus rocket engine in an altitude test stand: its dark nozzle hangs between tanks and pipework.',
        focus: '50% 60%',
    },
    {
        id: 'defence',
        chip: 'Next',
        title: 'Defence',
        text: 'Hot-section materials for aircraft engines, with export rules built in.',
        img: '/img/markets/defence.webp',
        alt: 'The afterburner of a Eurojet EJ200 jet engine, its ring of metal nozzle petals seen from behind.',
        focus: '50% 50%',
    },
    {
        id: 'fusion',
        chip: 'Next',
        title: 'Fusion and energy',
        text: 'Walls that face the plasma in fusion reactors, and parts for turbines. Bimo Tech already supplies ITER.',
        img: '/img/markets/fusion.webp',
        alt: 'Inside the Wendelstein 7-X fusion experiment: rows of carbon wall tiles being fitted.',
        focus: '50% 50%',
    },
    {
        id: 'supply',
        chip: 'Next',
        title: 'Supply independence',
        text: 'Alloys that do the job with metals Europe can get.',
        img: '/img/markets/supply.webp',
        alt: 'Tungsten rods grown over with metal crystals in a colourful tarnish.',
        focus: '50% 50%',
    },
    {
        id: 'pfas',
        chip: 'Signed',
        title: 'Replacing harmful substances',
        text: 'PFAS-free polymers to replace “forever chemicals”, with an industrial partner.',
        img: '/img/markets/pfas.webp',
        alt: 'A white PTFE block with drilled holes and two rolls of PTFE tape on a wooden table.',
        focus: '50% 50%',
    },
    {
        id: 'tech',
        chip: 'Next',
        title: 'Key technologies',
        text: 'Materials for semiconductors, and lightweight polymers.',
        img: '/img/markets/tech.webp',
        alt: 'A silicon wafer covered in rows of chips, lit so that it shimmers in colour.',
        focus: '50% 50%',
    },
];

/** The six markets as photo cards. Used on the home page and in Working with us. */
export function MarketCards() {
    return (
        <ul className="mcards">
            {MARKETS.map((m, i) => (
                <li key={m.id} className="mcard rv" style={{ '--d': `${i * 70}ms` } as CSSProperties}>
                    <img
                        className="mcard__img"
                        src={m.img}
                        alt={m.alt}
                        width={1100}
                        height={1100}
                        loading="lazy"
                        style={{ objectPosition: m.focus }}
                        onError={(e) => {
                            // A photo that fails to load leaves a plain dark card, never a broken image.
                            e.currentTarget.style.visibility = 'hidden';
                        }}
                    />
                    <span className={`mcard__chip mcard__chip--${m.chip.toLowerCase()}`}>
                        {String(i + 1).padStart(2, '0')} · {m.chip}
                    </span>
                    <div className="mcard__body">
                        <h3 className="mcard__title">{m.title}</h3>
                        <p className="mcard__text">{m.text}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
}

/** Home: where PRISM goes first, near the end of the page. */
export default function Markets({ n = '04' }: { n?: string }) {
    return (
        <section id="markets" className="sec markets-home" data-theme="navy" data-nav="navy" aria-labelledby="markets-title">
            <div className="wrap">
                <header className="sec-head rv">
                    <Idx n={n}>Where it goes</Idx>
                    <h2 id="markets-title" className="w-h2">
                        <Words>Where PRISM goes first.</Words>
                    </h2>
                </header>
                <MarketCards />
            </div>
        </section>
    );
}
