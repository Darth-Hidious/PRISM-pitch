import { StrictMode, createElement, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/tokens.css';
import '../styles/prism.css';
import '@fontsource-variable/newsreader/wght-italic.css';
import '../styles/engrave.css';
import './site.css';
import { LangProvider, setDictionary, type Lang } from './i18n';

/**
 * Renders a page. Scroll reveals hide content only when this script runs; without it everything shows.
 *
 * The built HTML also carries the page as plain markup, for readers without JavaScript (see
 * scripts/prerender.mjs). The browser never shows that copy while this script runs: it is hidden from the
 * first paint and removed here, and React draws the page as before.
 *
 * The page's language is the one its HTML declares (`<html lang="de">` under /de/). German pages load
 * their dictionary first; if that fails, the German plain copy stays on screen instead.
 */
export function mount(page: ReactNode) {
    // The build imports the pages to render them to HTML; there is nothing to mount then.
    if (import.meta.env.SSR) return;
    const root = document.documentElement;
    root.classList.add('js');
    const lang: Lang = root.lang === 'de' ? 'de' : 'en';
    const draw = () => {
        document.querySelector('[data-prerender]')?.remove();
        createRoot(document.getElementById('root')!).render(
            createElement(StrictMode, null, createElement(LangProvider, { lang }, page)),
        );
    };
    if (lang === 'en') {
        draw();
        return;
    }
    import('./i18n-de')
        .then(({ DE }) => {
            setDictionary(DE);
            draw();
        })
        .catch(() => root.classList.remove('js'));
}
