import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/tokens.css';
import '../styles/prism.css';
import './deck.css';
import Deck, { type SlideDef } from './Deck';
import { Architecture, Ask, Close, Cover, Financials, Lab, Market, Markets, Problem, Proof, Solution, Stacks, Team, Traction } from './slides';

const SLIDES: SlideDef[] = [
    { id: 'cover', title: 'PRISM', theme: 'navy', bleed: true, render: () => <Cover /> },
    { id: 'problem', title: 'The problem', theme: 'navy', render: () => <Problem /> },
    { id: 'solution', title: 'The solution', theme: 'paper', render: () => <Solution /> },
    { id: 'stacks', title: 'The platform', theme: 'navy', render: () => <Stacks /> },
    { id: 'architecture', title: 'Architecture', theme: 'navy', render: () => <Architecture /> },
    { id: 'lab', title: 'Autonomous laboratory', theme: 'paper', render: () => <Lab /> },
    { id: 'proof', title: 'Proof, built in', theme: 'navy', render: () => <Proof /> },
    { id: 'traction', title: 'Traction', theme: 'paper', render: () => <Traction /> },
    { id: 'markets', title: 'Where PRISM goes first', theme: 'navy', render: () => <Markets /> },
    { id: 'market', title: 'Market and business', theme: 'paper', render: () => <Market /> },
    { id: 'financials', title: 'Financials', theme: 'paper', render: () => <Financials /> },
    { id: 'team', title: 'Team', theme: 'paper', render: () => <Team /> },
    { id: 'ask', title: 'The ask', theme: 'navy', render: () => <Ask /> },
    { id: 'close', title: 'Start', theme: 'navy', bleed: true, render: () => <Close /> },
];

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Deck slides={SLIDES} />
    </StrictMode>,
);
