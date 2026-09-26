import type { ReactNode } from 'react';
import { COMPANY, MISSING, PRIVACY_UPDATED, TO_CONFIRM } from './legal';

/* ── Shared ───────────────────────────────────────────────────────────── */

/** A fact the company still has to supply: marked on the page so it cannot be missed. */
function Blank({ children }: { children: ReactNode }) {
    return <mark className="legal__blank">{children}</mark>;
}

/** A fact filled in but not yet confirmed. */
function Unsure({ children }: { children: ReactNode }) {
    return (
        <mark className="legal__unsure" title="To be confirmed">
            {children}
        </mark>
    );
}

/** A company fact: marked blank while missing, marked as unsure while it waits for confirmation. */
const or = (value: string | null, label: string, key?: keyof typeof COMPANY) =>
    value === null ? <Blank>{label}</Blank> : key && TO_CONFIRM[key] ? <Unsure>{value}</Unsure> : value;

const UNSURE = Object.values(TO_CONFIRM);

function Draft() {
    if (!MISSING.length && !UNSURE.length) return null;
    return (
        <p className="legal__draft" role="note">
            <b>Draft.</b> Fill in the marked details before this page goes live.
            {MISSING.length > 0 && <> Missing: {MISSING.join(', ')}.</>}
            {UNSURE.length > 0 && <> To confirm: {UNSURE.join(', ')}.</>}
        </p>
    );
}

function Address({ de = false }: { de?: boolean }) {
    return (
        <p className="legal__address">
            {or(COMPANY.name, de ? 'Firma mit Rechtsform' : 'company name with legal form')}
            <br />
            {or(COMPANY.street, de ? 'Straße und Hausnummer' : 'street and number', 'street')}
            <br />
            {or(COMPANY.town, de ? 'Postleitzahl und Ort' : 'postcode and town')}
            <br />
            {de ? 'Deutschland' : COMPANY.country}
        </p>
    );
}

const email = <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>;

function Page({ label, title, children }: { label: string; title: string; children: ReactNode }) {
    return (
        <section className="sec legal" data-theme="paper" data-nav="paper" aria-labelledby="legal-title">
            <div className="wrap legal__wrap">
                <Draft />
                <header className="legal__head">
                    <p className="w-label">{label}</p>
                    <h1 id="legal-title" className="w-h2">
                        {title}
                    </h1>
                    <nav className="legal__lang" aria-label="Language">
                        <a href="#en" hrefLang="en">
                            English
                        </a>
                        <a href="#de" hrefLang="de">
                            Deutsch
                        </a>
                    </nav>
                </header>
                {children}
            </div>
        </section>
    );
}

/* ── Impressum ────────────────────────────────────────────────────────── */

export function Impressum() {
    const md = COMPANY.managingDirectors;
    const many = (md?.length ?? 0) > 1;
    return (
        <Page label="Impressum" title="Legal notice">
            <article id="en" lang="en" className="legal__body">
                <h2>Information according to § 5 DDG</h2>
                <Address />
                <p>
                    {many ? 'Managing directors' : 'Managing director'}:{' '}
                    {md?.length ? or(md.join(', '), '', 'managingDirectors') : <Blank>managing director</Blank>}
                </p>

                <h2>Contact</h2>
                <p>
                    Email: {email}
                    <br />
                    Phone: {or(COMPANY.phone, 'phone number')}
                </p>

                <h2>Commercial register</h2>
                {COMPANY.registered ? (
                    <p>
                        Register court: {or(COMPANY.registerCourt, 'e.g. Amtsgericht Gießen', 'registerCourt')}
                        <br />
                        Register number: {or(COMPANY.registerNumber, 'HRB number')}
                    </p>
                ) : (
                    <p>
                        The company is being formed (i. G.) and is not yet entered in the commercial register. The register
                        court and number will be added here once it is.
                    </p>
                )}

                {COMPANY.vatId && (
                    <>
                        <h2>VAT ID</h2>
                        <p>VAT identification number according to § 27a of the German VAT Act: {COMPANY.vatId}</p>
                    </>
                )}

                <h2>Responsible for content according to § 18(2) MStV</h2>
                <p>{or(COMPANY.editor, 'name')}, address as above.</p>

                <h2>Consumer dispute resolution</h2>
                <p>We are neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board.</p>
            </article>

            <article id="de" lang="de" className="legal__body">
                <p className="legal__langhead">Deutsch</p>
                <h2>Angaben gemäß § 5 DDG</h2>
                <Address de />
                <p>
                    Vertreten durch {many ? 'die Geschäftsführer' : 'den Geschäftsführer'}:{' '}
                    {md?.length ? or(md.join(', '), '', 'managingDirectors') : <Blank>Geschäftsführung</Blank>}
                </p>

                <h2>Kontakt</h2>
                <p>
                    E-Mail: {email}
                    <br />
                    Telefon: {or(COMPANY.phone, 'Telefonnummer')}
                </p>

                <h2>Registereintrag</h2>
                {COMPANY.registered ? (
                    <p>
                        Registergericht: {or(COMPANY.registerCourt, 'z. B. Amtsgericht Gießen', 'registerCourt')}
                        <br />
                        Registernummer: {or(COMPANY.registerNumber, 'HRB-Nummer')}
                    </p>
                ) : (
                    <p>
                        Die Gesellschaft befindet sich in Gründung (i. G.) und ist noch nicht im Handelsregister eingetragen.
                        Registergericht und Registernummer werden hier ergänzt, sobald die Eintragung erfolgt ist.
                    </p>
                )}

                {COMPANY.vatId && (
                    <>
                        <h2>Umsatzsteuer-ID</h2>
                        <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: {COMPANY.vatId}</p>
                    </>
                )}

                <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
                <p>{or(COMPANY.editor, 'Name')}, Anschrift wie oben.</p>

                <h2>Verbraucherstreitbeilegung</h2>
                <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
            </article>
        </Page>
    );
}

/* ── Privacy policy ───────────────────────────────────────────────────── */

const VERCEL = 'Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, USA';
const ZOHO = 'Zoho Corporation B.V., Beneluxlaan 4B, 3527 HT Utrecht';
const AUTHORITY = 'Der Hessische Beauftragte für Datenschutz und Informationsfreiheit, Gustav-Stresemann-Ring 1, 65189 Wiesbaden';

function Controller({ de = false }: { de?: boolean }) {
    return (
        <p>
            {or(COMPANY.name, de ? 'Firma mit Rechtsform' : 'company name with legal form')},{' '}
            {or(COMPANY.street, de ? 'Straße und Hausnummer' : 'street and number', 'street')},{' '}
            {or(COMPANY.town, de ? 'Postleitzahl und Ort' : 'postcode and town')},{' '}
            {de ? 'Deutschland' : COMPANY.country}. {de ? 'E-Mail' : 'Email'}: {email}.
        </p>
    );
}

export function Privacy() {
    return (
        <Page label="Datenschutz" title="Privacy policy">
            <article id="en" lang="en" className="legal__body">
                <p className="legal__meta">Last updated: {PRIVACY_UPDATED.en}</p>

                <h2>1. Who is responsible</h2>
                <p>The controller under the General Data Protection Regulation (GDPR) is:</p>
                <Controller />

                <h2>2. In short</h2>
                <p>
                    We collect as little as we can. This website sets no cookies, stores nothing in your browser and uses no
                    analytics or tracking. Fonts and images come from our own servers; nothing is loaded from other companies’
                    servers. We only use what you send us, through the form or by email, and only to answer you.
                </p>

                <h2>3. Visiting this website</h2>
                <p>
                    Our website is hosted by {VERCEL}. When you open a page, your browser sends technical data that every website
                    receives: your IP address, the date and time, the page requested, the page you came from, and your browser and
                    operating system. Vercel uses these data to deliver the website and keep it secure, and keeps them in server logs
                    only as long as it needs to for that. Our own code does not store your IP address.
                </p>
                <p>Legal basis: Art. 6(1)(f) GDPR. Our legitimate interest is a website that works and is protected against attacks.</p>
                <p>
                    Vercel processes these data on our behalf, under a data processing agreement (Art. 28 GDPR). Vercel is based in
                    the USA and is certified under the EU-U.S. Data Privacy Framework, for which the European Commission has adopted
                    an adequacy decision (Art. 45 GDPR); Vercel also uses the EU standard contractual clauses. The code that handles
                    our form runs in Vercel’s Frankfurt region, and submissions are stored there.
                </p>

                <h2>4. The Register interest form</h2>
                <p>
                    If you use our form, we receive what you enter: your name, work email, organisation, role (optional), the areas you
                    are interested in, your message (optional) and your consent. We also note the page of our website you came from,
                    and the time. We use these details only to reply to you and, if you wish, to discuss working together.
                </p>
                <p>
                    Legal basis: your consent (Art. 6(1)(a) GDPR) and steps you ask us to take before a possible contract (Art. 6(1)(b)
                    GDPR).
                </p>
                <p>
                    Each submission is stored with Vercel in Frankfurt, Germany, and a copy is emailed to {email}. Our email is hosted
                    by {ZOHO}, the Netherlands, in its data centres in the EU, also on our behalf.
                </p>
                <p>
                    We delete submissions after twelve months, or sooner if you ask or withdraw your consent. If your enquiry leads to
                    a contract, we keep what the contract and the law require.
                </p>
                <p>
                    Using the form is voluntary. Without the required fields we cannot reply. To keep out spam, the form has a hidden
                    field that only bots fill in, and it checks that it was not sent within two seconds of opening. Neither stores
                    anything about you.
                </p>

                <h2>5. Email</h2>
                <p>
                    If you email us, we use your address and your message to reply. Legal basis: Art. 6(1)(b) GDPR where it concerns a
                    contract or its preparation, otherwise Art. 6(1)(f) GDPR; our legitimate interest is answering you. Emails are held
                    by Zoho in the EU. We delete them when they are no longer needed, unless the law requires us to keep them, for
                    example as business letters (§ 257 HGB, § 147 AO).
                </p>

                <h2>6. Links to other websites</h2>
                <p>
                    We link to other websites, such as GitHub, Bimo Tech and Forager. We share nothing with them; once you follow a link,
                    their own privacy policy applies.
                </p>

                <h2>7. Who else receives your data</h2>
                <p>
                    Only the service providers named above, who process data on our behalf. We do not sell your data, and we do not use
                    it for automated decisions or profiling.
                </p>

                <h2>8. Your rights</h2>
                <p>
                    You have the right to access your data (Art. 15 GDPR), to have it corrected (Art. 16), deleted (Art. 17) or its
                    processing restricted (Art. 18), to receive it in a portable format (Art. 20), and to object to processing based on
                    legitimate interests (Art. 21). You can withdraw your consent at any time, with effect for the future (Art. 7(3)).
                    To do any of this, email {email}.
                </p>
                <p>
                    You can also complain to a data protection supervisory authority (Art. 77 GDPR). Ours is {AUTHORITY}, Germany,{' '}
                    <a href="https://datenschutz.hessen.de" target="_blank" rel="noopener noreferrer">
                        datenschutz.hessen.de
                    </a>
                    .
                </p>

                <h2>9. Changes</h2>
                <p>We update this policy when what we do changes. The current version is always on this page.</p>
            </article>

            <article id="de" lang="de" className="legal__body">
                <p className="legal__langhead">Deutsch</p>
                <p className="legal__meta">Stand: {PRIVACY_UPDATED.de}</p>

                <h2>1. Verantwortlicher</h2>
                <p>Verantwortlich im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:</p>
                <Controller de />

                <h2>2. Kurz gesagt</h2>
                <p>
                    Wir erheben so wenig wie möglich. Diese Website setzt keine Cookies, speichert nichts in Ihrem Browser und nutzt
                    keine Analyse- oder Tracking-Werkzeuge. Schriften und Bilder kommen von unseren eigenen Servern; es wird nichts von
                    Servern anderer Unternehmen geladen. Wir verwenden nur, was Sie uns über das Formular oder per E-Mail schicken, und
                    nur, um Ihnen zu antworten.
                </p>

                <h2>3. Besuch dieser Website</h2>
                <p>
                    Unsere Website wird von {VERCEL} gehostet. Beim Aufruf einer Seite übermittelt Ihr Browser technische Daten, die
                    jede Website erhält: Ihre IP-Adresse, Datum und Uhrzeit, die aufgerufene Seite, die Seite, von der Sie kommen, sowie
                    Browser und Betriebssystem. Vercel verarbeitet diese Daten, um die Website auszuliefern und zu schützen, und
                    speichert sie in Server-Logs nur so lange, wie es dafür nötig ist. Unser eigener Code speichert Ihre IP-Adresse
                    nicht.
                </p>
                <p>
                    Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse ist eine funktionierende und vor
                    Angriffen geschützte Website.
                </p>
                <p>
                    Vercel verarbeitet diese Daten in unserem Auftrag auf Grundlage eines Vertrags zur Auftragsverarbeitung (Art. 28
                    DSGVO). Vercel hat seinen Sitz in den USA und ist nach dem EU-US Data Privacy Framework zertifiziert, für das ein
                    Angemessenheitsbeschluss der Europäischen Kommission besteht (Art. 45 DSGVO); zusätzlich nutzt Vercel die
                    EU-Standardvertragsklauseln. Der Code, der unser Formular verarbeitet, läuft in Vercels Rechenzentrum in Frankfurt
                    am Main; dort werden auch die Anfragen gespeichert.
                </p>

                <h2>4. Das Formular „Register interest“</h2>
                <p>
                    Wenn Sie unser Formular nutzen, erhalten wir Ihre Angaben: Name, geschäftliche E-Mail-Adresse, Organisation,
                    Funktion (freiwillig), Ihre Interessengebiete, Ihre Nachricht (freiwillig) und Ihre Einwilligung. Außerdem vermerken
                    wir, von welcher Seite unserer Website Sie kamen, und den Zeitpunkt. Wir verwenden diese Angaben nur, um Ihnen zu
                    antworten und, wenn Sie es wünschen, eine Zusammenarbeit zu besprechen.
                </p>
                <p>
                    Rechtsgrundlagen sind Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) und Maßnahmen vor einem möglichen Vertrag, die
                    auf Ihre Anfrage erfolgen (Art. 6 Abs. 1 lit. b DSGVO).
                </p>
                <p>
                    Jede Anfrage wird bei Vercel in Frankfurt am Main gespeichert, und eine Kopie geht per E-Mail an {email}. Unsere
                    E-Mails werden von der {ZOHO}, Niederlande, in ihren Rechenzentren in der EU betrieben, ebenfalls in unserem
                    Auftrag.
                </p>
                <p>
                    Wir löschen Anfragen nach zwölf Monaten, oder früher, wenn Sie es wünschen oder Ihre Einwilligung widerrufen. Führt
                    Ihre Anfrage zu einem Vertrag, bewahren wir auf, was der Vertrag und das Gesetz verlangen.
                </p>
                <p>
                    Die Nutzung des Formulars ist freiwillig. Ohne die Pflichtfelder können wir Ihnen nicht antworten. Gegen Spam hat das
                    Formular ein verborgenes Feld, das nur Programme ausfüllen, und es prüft, dass es nicht innerhalb von zwei Sekunden
                    nach dem Öffnen abgeschickt wurde. Dabei wird nichts über Sie gespeichert.
                </p>

                <h2>5. E-Mail</h2>
                <p>
                    Wenn Sie uns eine E-Mail schreiben, verwenden wir Ihre Adresse und Ihre Nachricht, um zu antworten. Rechtsgrundlage
                    ist Art. 6 Abs. 1 lit. b DSGVO, wenn es um einen Vertrag oder seine Anbahnung geht, sonst Art. 6 Abs. 1 lit. f DSGVO;
                    unser berechtigtes Interesse ist, Ihnen zu antworten. E-Mails liegen bei Zoho in der EU. Wir löschen sie, wenn sie
                    nicht mehr gebraucht werden, es sei denn, das Gesetz verlangt eine Aufbewahrung, etwa als Handelsbrief (§ 257 HGB,
                    § 147 AO).
                </p>

                <h2>6. Links zu anderen Websites</h2>
                <p>
                    Wir verlinken auf andere Websites, etwa GitHub, Bimo Tech und Forager. Wir geben dabei nichts an sie weiter; sobald
                    Sie einem Link folgen, gilt deren eigene Datenschutzerklärung.
                </p>

                <h2>7. Empfänger</h2>
                <p>
                    Nur die oben genannten Dienstleister, die Daten in unserem Auftrag verarbeiten. Wir verkaufen Ihre Daten nicht und
                    nutzen sie weder für automatisierte Entscheidungen noch für Profiling.
                </p>

                <h2>8. Ihre Rechte</h2>
                <p>
                    Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der
                    Verarbeitung (Art. 18) und Datenübertragbarkeit (Art. 20) sowie das Recht, einer Verarbeitung auf Grundlage
                    berechtigter Interessen zu widersprechen (Art. 21). Eine Einwilligung können Sie jederzeit mit Wirkung für die
                    Zukunft widerrufen (Art. 7 Abs. 3). Schreiben Sie dazu an {email}.
                </p>
                <p>
                    Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO). Für uns zuständig ist{' '}
                    {AUTHORITY},{' '}
                    <a href="https://datenschutz.hessen.de" target="_blank" rel="noopener noreferrer">
                        datenschutz.hessen.de
                    </a>
                    .
                </p>

                <h2>9. Änderungen</h2>
                <p>Wir passen diese Erklärung an, wenn sich unsere Verarbeitung ändert. Die aktuelle Fassung steht immer auf dieser Seite.</p>
            </article>
        </Page>
    );
}
