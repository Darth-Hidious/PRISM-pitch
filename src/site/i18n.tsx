import { createContext, Fragment, useContext, type ReactNode } from 'react';

/**
 * The site in two languages: English at /…, German at /de/…, from the same components. Every piece of
 * text on a page goes through `t` (from useT). On English pages `t` returns the text as written; on German
 * pages it looks the English up in the German dictionary (src/site/i18n-de.ts). The build renders every
 * German page and fails if any text has no German (scripts/prerender.mjs), so nothing slips through in
 * English.
 */

export type Lang = 'en' | 'de';

export const LangContext = createContext<Lang>('en');

let dictionary: Readonly<Record<string, string>> = {};

/** The German dictionary. The browser loads it only on German pages (boot.ts); the build always has it. */
export function setDictionary(entries: Readonly<Record<string, string>>) {
    dictionary = entries;
}

/** Text asked for in German that the dictionary does not have (read by the build). */
export const MISSING = new Set<string>();

export function translate(lang: Lang, text: string): string {
    if (lang === 'en') return text;
    const de = dictionary[text];
    if (de === undefined) {
        MISSING.add(text);
        return text;
    }
    return de;
}

/**
 * Text with elements inside, written as "Our <0>form</0> asks …": each numbered pair is replaced by what
 * the matching function makes of the words inside it, so a translation can move a link within its sentence.
 */
export function richText(template: string, parts: ((inner: string) => ReactNode)[]): ReactNode[] {
    const out: ReactNode[] = [];
    const re = /<(\d+)>([\s\S]*?)<\/\1>/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(template))) {
        if (m.index > last) out.push(template.slice(last, m.index));
        const make = parts[Number(m[1])];
        if (!make) throw new Error(`richText: no part <${m[1]}> for "${template}"`);
        out.push(<Fragment key={out.length}>{make(m[2])}</Fragment>);
        last = m.index + m[0].length;
    }
    if (last < template.length) out.push(template.slice(last));
    return out;
}

/** The site's pages, which exist in both languages; everything else (the deck, files, other sites) does not. */
export const PAGE_PATHS = ['/', '/platform/', '/method/', '/company/', '/news/', '/interest/', '/contact/', '/impressum/', '/privacy/'];

/** An address inside the site, in the given language: "/company/#team" is "/de/company/#team" in German. */
export function localPath(lang: Lang, href: string): string {
    if (lang === 'en' || !href.startsWith('/') || href.startsWith('//')) return href;
    const m = /^([^?#]*)(.*)$/.exec(href);
    if (!m) return href;
    return PAGE_PATHS.includes(m[1]) ? `/de${m[1]}${m[2]}` : href;
}

/** The same page in the other language. */
export function otherLanguage(lang: Lang, path: string): { lang: Lang; href: string } {
    return lang === 'en' ? { lang: 'de', href: localPath('de', path) } : { lang: 'en', href: path };
}

export interface Translator {
    (text: string): string;
    /** See richText. */
    rich: (template: string, ...parts: ((inner: string) => ReactNode)[]) => ReactNode[];
    /** An address inside the site, in this page's language. */
    link: (href: string) => string;
    /** A number written the way the language writes it: 474,311,376 or 474.311.376. */
    num: (n: number) => string;
    lang: Lang;
}

export function makeTranslator(lang: Lang): Translator {
    const t = (text: string) => translate(lang, text);
    return Object.assign(t, {
        rich: (template: string, ...parts: ((inner: string) => ReactNode)[]) => richText(translate(lang, template), parts),
        link: (href: string) => localPath(lang, href),
        num: (n: number) => n.toLocaleString(lang === 'de' ? 'de-DE' : 'en-GB'),
        lang,
    });
}

export const useLang = () => useContext(LangContext);

export function useT(): Translator {
    return makeTranslator(useContext(LangContext));
}

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
    return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}
