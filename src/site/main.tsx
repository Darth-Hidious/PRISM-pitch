import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/tokens.css';
import '../styles/prism.css';
import './site.css';
import SiteApp from './SiteApp';

// Scroll reveals hide content only when this script runs; without it everything shows.
document.documentElement.classList.add('js');

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SiteApp />
    </StrictMode>,
);
