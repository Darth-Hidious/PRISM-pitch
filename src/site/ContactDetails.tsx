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
    return (
        <section className="sec legal" data-theme="paper" data-nav="paper" aria-labelledby="contact-page-title">
            <div className="wrap legal__wrap">
                <header className="legal__head">
                    <p className="w-label">Contact</p>
                    <h1 id="contact-page-title" className="w-h2">
                        Contact Mirdyne.
                    </h1>
                    <p className="w-lead">
                        Write to us about a material your part needs, about PRISM on your programme, or about investing in
                        Mirdyne.
                    </p>
                </header>
                <div className="legal__body">
                    <h2>Email</h2>
                    <p>
                        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> reaches the team, whatever your question.
                    </p>

                    <h2>Register interest</h2>
                    <p>
                        Our <a href={LINKS.interest}>form</a> asks the few things we need to answer well: who you are, your
                        organisation and what you would like to do with us. Start it on a topic:
                    </p>
                    <ul className="legal__list">
                        {TOPICS.map((t) => (
                            <li key={t.id}>
                                <a href={`${LINKS.interest}?topic=${t.id}`}>{t.label}</a>
                            </li>
                        ))}
                    </ul>

                    <h2>Investors</h2>
                    <p>
                        The <a href={LINKS.deck}>investor room</a> holds our investor deck.
                    </p>

                    <h2>Post</h2>
                    <p className="legal__address">
                        {COMPANY.name}
                        <br />
                        {COMPANY.street}
                        <br />
                        {COMPANY.town}
                        <br />
                        {COMPANY.country}
                    </p>
                    <p>
                        Legal details are in the <a href="/impressum/">Impressum</a>. How we handle what you send us is in the{' '}
                        <a href="/privacy/">privacy policy</a>.
                    </p>

                    <h2>Code</h2>
                    <p>
                        PRISM’s software is open source. Code and issues are on{' '}
                        <a href={LINKS.github} target="_blank" rel="noopener noreferrer">
                            GitHub
                        </a>
                        .
                    </p>
                </div>
            </div>
        </section>
    );
}
