import { Button } from '../ds';
import { useT } from './i18n';
import { LINKS } from './links';
import { CONSORTIUM, PartnerLogo } from './partners';
import { Grain } from './ui';

/**
 * The first screen: one clear line over what the material has to survive. The photograph runs edge to
 * edge where the screen is wider than tall; on upright screens it sits whole above the text. The
 * KI‑Sonderpreis badge sits with the headline on wide screens and on the photograph when the screen is
 * upright, and links to the News page. Photograph credited in the Impressum.
 */
export default function Hero() {
    const t = useT();
    return (
        <>
            <section id="top" className="hero" data-theme="navy" data-nav="hero" aria-labelledby="hero-title">
                <figure className="hero__media">
                    <img
                        src="/img/dlr-vulcain2-p5.webp"
                        alt={t('A Vulcain 2 rocket engine firing on a test stand: flame pours out beneath the ribbed metal nozzle.')}
                        width={1348}
                        height={758}
                        fetchPriority="high"
                    />
                </figure>
                <Grain />
                <div className="wrap hero__content">
                    <h1 id="hero-title" className="w-mega rise" style={{ animationDelay: '90ms' }}>
                        {t('Materials built for the extreme.')}
                    </h1>
                    <p className="w-lead hero__lead rise" style={{ animationDelay: '180ms' }}>
                        {t('We design them with AI, and make and test them in Europe.')}
                    </p>
                    <div className="hero__actions rise" style={{ animationDelay: '260ms' }}>
                        <Button href={t.link(LINKS.interest)}>{t('Register interest')}</Button>
                        <Button variant="secondary" href="#gap">
                            {t('The problem')}
                        </Button>
                    </div>
                </div>
                <a className="hero__award rise" href={t.link('/news/')} style={{ animationDelay: '320ms' }}>
                    <img
                        src="/awards/ki-sonderpreis-badge.png"
                        alt={t('Hessen Ideen Wettbewerb 2026 – KI‑Sonderpreis von hessian.AI')}
                        width={394}
                        height={394}
                        loading="lazy"
                        fetchPriority="low"
                        decoding="async"
                    />
                </a>
            </section>
            <aside className="proof" data-theme="navy" data-nav="navy" aria-label={t('PRISM in brief')}>
                <ul className="wrap proof__list">
                    <li>
                        <span className="w-label">{t('Funded by')}</span>
                        <strong>{t('The European Space Agency')}</strong>
                        <span>{t('PRISM’s first deployment')}</span>
                    </li>
                    <li>
                        <span className="w-label">{t('First application')}</span>
                        <strong>{t('Alloys for extreme heat')}</strong>
                        <span>{t('For rocket engines')}</span>
                    </li>
                    <li>
                        <span className="w-label">{t('Next')}</span>
                        <strong>{t('PFAS‑free polymers')}</strong>
                        <span>{t('Replacing “forever chemicals”, with an industrial partner')}</span>
                    </li>
                </ul>
                <div className="wrap proof__partners">
                    <p className="w-label">{t('PRISM Alpha, with')}</p>
                    <ul aria-label={t('PRISM Alpha consortium')}>
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
