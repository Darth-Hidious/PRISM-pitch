import { StrictMode, createElement, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/tokens.css';
import '../styles/prism.css';
import '@fontsource-variable/newsreader/wght-italic.css';
import '../styles/engrave.css';
import './site.css';

/**
 * Renders a page. Scroll reveals hide content only when this script runs; without it everything shows.
 *
 * The built HTML also carries the page as plain markup, for readers without JavaScript (see
 * scripts/prerender.mjs). The browser never shows that copy while this script runs: it is hidden from the
 * first paint and removed here, and React draws the page as before.
 */
export function mount(page: ReactNode) {
    // The build imports the pages to render them to HTML; there is nothing to mount then.
    if (import.meta.env.SSR) return;
    document.documentElement.classList.add('js');
    document.querySelector('[data-prerender]')?.remove();
    createRoot(document.getElementById('root')!).render(createElement(StrictMode, null, page));
}
