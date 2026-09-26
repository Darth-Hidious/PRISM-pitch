import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LangProvider, MISSING, setDictionary, translate, type Lang } from './i18n';
import { DE } from './i18n-de';
import { page as company } from './pages/company';
import { page as contact } from './pages/contact';
import { page as home } from './pages/home';
import { page as impressum } from './pages/impressum';
import { page as interest } from './pages/interest';
import { page as method } from './pages/method';
import { page as news } from './pages/news';
import { page as notfound } from './pages/notfound';
import { page as platform } from './pages/platform';
import { page as privacy } from './pages/privacy';
import { structuredData } from './structured-data';

/**
 * The build's view of the site (scripts/prerender.mjs): every page, in English and in German under /de/,
 * its address and its built HTML file. The build renders each page into its file, so the text is there
 * without JavaScript, and writes a Markdown copy beside it (`index.html.md`, as llmstxt.org proposes).
 */
export interface Prerendered {
    /** The page's address, with a trailing slash; null for the 404 page, which has none of its own. */
    path: string | null;
    /** The built HTML file, relative to dist/. */
    file: string;
    element: ReactElement;
    lang: Lang;
}

const ENGLISH: Omit<Prerendered, 'lang'>[] = [
    { path: '/', file: 'index.html', element: home },
    { path: '/platform/', file: 'platform/index.html', element: platform },
    { path: '/method/', file: 'method/index.html', element: method },
    { path: '/company/', file: 'company/index.html', element: company },
    { path: '/news/', file: 'news/index.html', element: news },
    { path: '/interest/', file: 'interest/index.html', element: interest },
    { path: '/contact/', file: 'contact/index.html', element: contact },
    { path: '/impressum/', file: 'impressum/index.html', element: impressum },
    { path: '/privacy/', file: 'privacy/index.html', element: privacy },
    { path: null, file: '404.html', element: notfound },
];

export const PAGES: Prerendered[] = [
    ...ENGLISH.map((p) => ({ ...p, lang: 'en' as const })),
    ...ENGLISH.filter((p) => p.path).map((p) => ({ ...p, path: `/de${p.path}`, file: `de/${p.file}`, lang: 'de' as const })),
];

setDictionary(DE);

export const render = (page: Prerendered) => renderToStaticMarkup(createElement(LangProvider, { lang: page.lang }, page.element));

/** Text a German page asked for that the dictionary does not have; the build fails on any. */
export const missingGerman = () => [...MISSING];

/**
 * Text that is German already: every translation in the dictionary, including names and symbols it keeps
 * the same on purpose by mapping them to themselves.
 */
export const keptTheSame = () => new Set(Object.values(DE));

export { translate };

export { structuredData };
export { COMPANY } from './legal';
