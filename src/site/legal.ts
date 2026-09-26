/**
 * The company facts the Impressum and the privacy policy need, in one place. A `null` shows on the
 * page as a marked blank, and the page says it is a draft until every required fact is filled in.
 * Do not publish the pages while anything here is still null.
 */
export const COMPANY = {
    /** The legal name with its legal form, as registered, e.g. "Mirdyne GmbH". */
    name: null as string | null,
    /** The address where the company can receive post and legal papers: street and number. No P.O. box. */
    street: null as string | null,
    /** Postcode and town, e.g. "35390 Gießen". */
    town: null as string | null,
    country: 'Germany',
    /** Everyone registered as managing director (Geschäftsführer). The website names Kevin Grüning. */
    managingDirectors: ['Kevin Grüning'] as string[] | null,
    email: 'info@mirdyne.com',
    /** A phone number is the safest way to meet the "quick contact" rule. */
    phone: null as string | null,
    /** The commercial register entry, once the company is registered. */
    registerCourt: null as string | null,
    registerNumber: null as string | null,
    /** The VAT identification number (USt-IdNr.), if the company has one. */
    vatId: null as string | null,
    /** Who answers for the News and the site's other editorial content (§ 18(2) MStV). */
    editor: null as string | null,
};

/** When the privacy policy was last changed. */
export const PRIVACY_UPDATED = { en: 'September 2026', de: 'September 2026' };

/** The facts every page needs before it may go live. */
export const MISSING = (
    [
        ['name', COMPANY.name],
        ['street', COMPANY.street],
        ['town', COMPANY.town],
        ['managing directors', COMPANY.managingDirectors],
        ['phone', COMPANY.phone],
        ['register court', COMPANY.registerCourt],
        ['register number', COMPANY.registerNumber],
        ['editor', COMPANY.editor],
    ] as const
)
    .filter(([, v]) => v === null || (Array.isArray(v) && v.length === 0))
    .map(([k]) => k);
