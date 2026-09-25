import { StrictMode, createElement, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/tokens.css';
import '../styles/prism.css';
import '@fontsource-variable/newsreader/wght-italic.css';
import './site.css';

/** Renders a page. Scroll reveals hide content only when this script runs; without it everything shows. */
export function mount(page: ReactNode) {
    document.documentElement.classList.add('js');
    createRoot(document.getElementById('root')!).render(createElement(StrictMode, null, page));
}
