import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Fonts are bundled with the site rather than loaded from Google, so no
// visitor data goes to a third party (German courts have fined sites for that).
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './overview.css';
import Overview from './Overview';

// Opt in to reveal-on-scroll before the first paint, so content never flashes
// in and out. Skipped for visitors who prefer reduced motion.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('js-reveal');
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Overview />
    </StrictMode>,
);
