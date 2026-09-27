import { useT } from './i18n';
import type { AreaId } from './interest-areas';
import { COMPANY } from './legal';
import { LINKS } from './links';

/** Ways into the form, each opening it with one topic chosen; worded for this page, not the form. */
const TOPICS: { id: AreaId; label: string }[] = [
    { id: 'material', label: 'A new material for a part' },
    { id: 'deployment', label: 'PRISM on your programme' },
    { id: 'supply', label: 'Supply of a qualified material' },
    { id: 'research', label: 'Research collaboration' },
    { id: 'partnership', label: 'Partnership' },
    { id: 'investment', label: 'Investment' },
];

/** /contact/: every way to reach Mirdyne, on one page. Styled like the legal pages. */
export default function ContactDetails() {
    const t = useT();
    return (
        <section className="sec legal" data-theme="paper" data-nav="paper" aria-labelledby="contact-page-title">
            <div className="wrap legal__wrap">
                <header className="legal__head">
                    <p className="w-label">{t('Contact')}</p>
                    <h1 id="contact-page-title" className="w-h2">
                        {t('Contact Mirdyne.')}
                    </h1>
                    <p className="w-lead">
                        {t('Write to us about a material your part needs, about PRISM on your programme, or about investing in Mirdyne.')}
                    </p>
                </header>
                <div className="legal__body">
                    <h2>{t('Email')}</h2>
                    <p>
                        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> {t('reaches the team, whatever your question.')}
                    </p>

                    <h2>{t('Register interest')}</h2>
                    <p>
                        {t.rich('Our <0>form</0> asks the few things we need to answer well: who you are, your organisation and what you would like to do with us. Start it on a topic:', (s) => (
                            <a href={t.link(LINKS.interest)}>{s}</a>
                        ))}
                    </p>
                    <ul className="legal__list">
                        {TOPICS.map((topic) => (
                            <li key={topic.id}>
                                <a href={`${t.link(LINKS.interest)}?topic=${topic.id}`}>{t(topic.label)}</a>
                            </li>
                        ))}
                    </ul>

                    <h2>{t('Investors')}</h2>
                    <p>{t.rich('The <0>investor room</0> holds our investor deck.', (s) => <a href={LINKS.deck}>{s}</a>)}</p>

                    <h2>{t('Post')}</h2>
                    <p className="legal__address">
                        {COMPANY.name}
                        <br />
                        {COMPANY.street}
                        <br />
                        {COMPANY.town}
                        <br />
                        {t(COMPANY.country)}
                    </p>
                    <p>
                        {t.rich('Legal details are in the <0>Impressum</0>. How we handle what you send us is in the <1>privacy policy</1>.', (s) => (
                            <a href={t.link('/impressum/')}>{s}</a>
                        ), (s) => (
                            <a href={t.link('/privacy/')}>{s}</a>
                        ))}
                    </p>

                    <h2>{t('Code')}</h2>
                    <p>
                        {t.rich('Parts of PRISM are open source; our models are our own. The open code and its issues are on <0>GitHub</0>.', (s) => (
                            <a href={LINKS.github} target="_blank" rel="noopener noreferrer">
                                {s}
                            </a>
                        ))}
                    </p>
                </div>
            </div>
        </section>
    );
}
