/**
 * The company facts the Impressum and the privacy policy need, in one place. A `null` shows on the
 * page as a marked blank, and the page says it is a draft until every required fact is filled in.
 * Do not publish the pages while anything here is still null.
 */
export const COMPANY = {
    /**
     * The legal name with its legal form, as registered. Until the commercial register entry exists, a GmbH
     * has to add "i. G." (in Gründung): "Mirdyne GmbH i. G.".
     */
    name: 'Mirdyne GmbH i. G.' as string | null,
    /**
     * False while the GmbH is being formed and not yet in the commercial register. The pages then say so
     * instead of naming a register court and number. When the entry is made: set this to true, drop
     * "i. G." from the name, and fill in the court and number below.
     */
    registered: false as boolean,
    /**
     * The company's business address: the one that goes into the commercial register filing, where post and
     * legal papers reach the company. No P.O. box. Never a founder's private home unless it is that address.
     */
    street: null as string | null,
    /** Postcode and town. */
    town: null as string | null,
    country: 'Germany',
    /** Everyone registered as managing director (Geschäftsführer). */
    managingDirectors: ['Kevin Grüning'] as string[] | null,
    email: 'info@mirdyne.com',
    /** A phone number is the safest way to meet the "quick contact" rule. */
    phone: null as string | null,
    /** The commercial register entry, once the company is registered. The seat is Gießen, so: Amtsgericht Gießen. */
    registerCourt: null as string | null,
    registerNumber: null as string | null,
    /** The VAT identification number (USt-IdNr.), if the company has one. */
    vatId: null as string | null,
    /** Who answers for the News and the site's other editorial content (§ 18(2) MStV). */
    editor: 'Kevin Grüning' as string | null,
};

/** Facts filled in but not yet confirmed: marked on the pages, and named in the draft notice. */
export const TO_CONFIRM: Partial<Record<keyof typeof COMPANY, string>> = {
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
        ...(COMPANY.registered
            ? ([
                  ['register court', COMPANY.registerCourt],
                  ['register number', COMPANY.registerNumber],
              ] as const)
            : []),
        ['editor', COMPANY.editor],
    ] as const
)
    .filter(([, v]) => v === null || (Array.isArray(v) && v.length === 0))
    .map(([k]) => k);
