/**
 * The German site: every piece of English text on the site, and its German. Keys are the English exactly
 * as the components pass it to `t` (src/site/i18n.tsx); values are what German pages show instead.
 * Rich text keeps its numbered tags ("<0>…</0>") and may move them within the sentence.
 *
 * Voice: plain, factual German for engineers and investors, addressed with "Sie". Names stay as they are
 * (PRISM, Mirdyne, Bimo Tech, ESA, CAMEO, Forager); units and numbers follow German usage.
 */
export const DE: Readonly<Record<string, string>> = {
    // Menu and footer (src/site/Chrome.tsx, SitePage.tsx)
    Platform: 'Plattform',
    Method: 'Methode',
    Company: 'Unternehmen',
    News: 'Aktuelles',
    Contact: 'Kontakt',
    Home: 'Startseite',
    'Register interest': 'Interesse anmelden',
    'Investor room': 'Investorenbereich',
    'PRISM by Mirdyne, home': 'PRISM by Mirdyne, Startseite',
    'Open menu': 'Menü öffnen',
    'Close menu': 'Menü schließen',
    Site: 'Website',
    Pages: 'Seiten',
    Elsewhere: 'Andere Websites',
    Legal: 'Rechtliches',
    Impressum: 'Impressum',
    Privacy: 'Datenschutz',
    'Picture credits': 'Bildnachweis',
    'Technology concept by marc27': 'Technologiekonzept von marc27',
    'Skip to content': 'Zum Inhalt springen',
};
