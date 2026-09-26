import { COMPANY } from './legal';

/**
 * schema.org data (JSON-LD) for the pages' <head>, built from the same company facts as the Impressum,
 * so the two cannot drift apart. scripts/prerender.mjs writes it into the built pages.
 */

export const SITE = 'https://www.mirdyne.com';
const ORG = `${SITE}/#organization`;
const WEBSITE = `${SITE}/#website`;

/** ISO 3166-1 codes for the countries COMPANY.country may name. */
const COUNTRY_CODES: Record<string, string> = { Germany: 'DE' };

function required(value: string | null, what: string) {
    if (!value) throw new Error(`structured data: the company's ${what} is missing (src/site/legal.ts)`);
    return value;
}

/** COMPANY.town holds postcode and town together, as the Impressum prints them: "35394 Gießen". */
function address() {
    const town = required(COMPANY.town, 'postcode and town');
    const m = /^(\d{5})\s+(.+)$/.exec(town);
    if (!m) throw new Error(`structured data: cannot split "${town}" into postcode and town`);
    const country = COUNTRY_CODES[COMPANY.country];
    if (!country) throw new Error(`structured data: no country code for "${COMPANY.country}"`);
    return {
        '@type': 'PostalAddress',
        streetAddress: required(COMPANY.street, 'street'),
        postalCode: m[1],
        addressLocality: m[2],
        addressCountry: country,
    };
}

function organization() {
    return {
        '@type': 'Organization',
        '@id': ORG,
        name: 'Mirdyne',
        legalName: required(COMPANY.name, 'name'),
        url: `${SITE}/`,
        logo: `${SITE}/mirdyne-mark.svg`,
        description:
            'Mirdyne designs new alloys and polymers with PRISM, its AI platform, then makes them, tests them against the customer’s requirement and hands over the proof.',
        brand: { '@type': 'Brand', name: 'PRISM' },
        email: COMPANY.email,
        address: address(),
        contactPoint: [
            {
                '@type': 'ContactPoint',
                contactType: 'general enquiries',
                email: COMPANY.email,
                url: `${SITE}/contact/`,
                availableLanguage: ['en', 'de'],
            },
        ],
    };
}

/** The site, in English and German (/de/). */
function website() {
    return {
        '@type': 'WebSite',
        '@id': WEBSITE,
        url: `${SITE}/`,
        name: 'PRISM by Mirdyne',
        inLanguage: ['en-GB', 'de-DE'],
        publisher: { '@id': ORG },
    };
}

/** A page about the company itself: the About page (/company/) or the Contact page, in either language. */
function webPage(type: 'AboutPage' | 'ContactPage', path: string, name: string, german: boolean) {
    return {
        '@type': type,
        '@id': `${SITE}${path}#webpage`,
        url: `${SITE}${path}`,
        name,
        inLanguage: german ? 'de-DE' : 'en-GB',
        isPartOf: { '@id': WEBSITE },
        about: { '@id': ORG },
    };
}

/** The JSON-LD graph for a page, or null for pages that carry none. German pages are the same, under /de/. */
export function structuredData(path: string): object | null {
    const german = path.startsWith('/de/');
    const page = german ? path.slice(3) : path;
    const graph =
        page === '/'
            ? [organization(), website()]
            : page === '/company/'
              ? [webPage('AboutPage', path, german ? 'Über Mirdyne' : 'About Mirdyne', german), organization(), website()]
              : page === '/contact/'
                ? [webPage('ContactPage', path, german ? 'Kontakt zu Mirdyne' : 'Contact Mirdyne', german), organization(), website()]
                : null;
    return graph && { '@context': 'https://schema.org', '@graph': graph };
}
