import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/tokens.css';
import '../styles/prism.css';
import './deck.css';
import Deck, { type SlideDef } from './Deck';
import { Architecture, Ask, Close, Cover, EvidenceSlide, Financials, Lab, Market, Problem, Solution, Stacks, Traction } from './slides';

const SLIDES: SlideDef[] = [
    { id: 'cover', title: 'PRISM', theme: 'paper', bleed: true, render: () => <Cover /> },
    { id: 'problem', title: 'The problem', theme: 'paper', render: () => <Problem /> },
    { id: 'solution', title: 'The solution', theme: 'paper', render: () => <Solution /> },
    { id: 'stacks', title: 'The platform', theme: 'paper', render: () => <Stacks /> },
    { id: 'architecture', title: 'Architecture', theme: 'navy', render: () => <Architecture /> },
    { id: 'lab', title: 'Autonomous laboratory', theme: 'paper', render: () => <Lab /> },
    { id: 'evidence', title: 'Evidence and IP', theme: 'navy', render: () => <EvidenceSlide /> },
    { id: 'traction', title: 'Traction', theme: 'paper', render: () => <Traction /> },
    { id: 'market', title: 'Market and business', theme: 'paper', render: () => <Market /> },
    { id: 'financials', title: 'Financials', theme: 'paper', render: () => <Financials /> },
    { id: 'ask', title: 'The ask', theme: 'navy', render: () => <Ask /> },
    { id: 'close', title: 'Start', theme: 'navy', bleed: true, render: () => <Close /> },
];

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Deck slides={SLIDES} />
    </StrictMode>,
);
