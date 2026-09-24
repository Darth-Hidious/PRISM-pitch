import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './overview.css';
import Overview from './Overview';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Overview />
    </StrictMode>,
);
