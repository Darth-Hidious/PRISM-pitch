import { spectralRadius, type Matrix } from './hawkes';

/**
 * The made-up supply network of the supply-chain demo (SupplyShock.tsx): who supplies whom, from mines
 * to programmes, with the feedback that makes supply chains fragile. Illustrative only: the names are
 * generic and every number is invented.
 */

export const COLUMNS = ['Suppliers', 'Materials', 'Processes', 'Components', 'Programmes'] as const;

export interface SupplyNode {
    id: string;
    /** 0 = suppliers … 4 = programmes. */
    col: number;
    label: string;
}

export const NODES: SupplyNode[] = [
    { id: 'mine-w', col: 0, label: 'Tungsten mine' },
    { id: 'mine-nb', col: 0, label: 'Niobium mine' },
    { id: 'refinery', col: 0, label: 'Refinery' },
    { id: 'gas', col: 0, label: 'Argon supplier' },
    { id: 'w', col: 1, label: 'Tungsten' },
    { id: 'nb', col: 1, label: 'Niobium' },
    { id: 'mo', col: 1, label: 'Molybdenum' },
    { id: 'ar', col: 1, label: 'Argon' },
    { id: 'melt', col: 2, label: 'Arc melting' },
    { id: 'atomise', col: 2, label: 'Atomising' },
    { id: 'print', col: 2, label: 'Laser printing' },
    { id: 'nozzle', col: 3, label: 'Nozzle' },
    { id: 'injector', col: 3, label: 'Injector' },
    { id: 'blade', col: 3, label: 'Turbine blade' },
    { id: 'tile', col: 3, label: 'Wall tile' },
    { id: 'launcher', col: 4, label: 'Launcher' },
    { id: 'jet', col: 4, label: 'Jet engine' },
    { id: 'fusion', col: 4, label: 'Fusion reactor' },
];

export interface SupplyLink {
    from: string;
    to: string;
    /** Relative strength before scaling: how readily trouble at `from` becomes trouble at `to`. */
    weight: number;
    /** A link against the flow of goods: trouble downstream sets off rush orders upstream. */
    feedback?: boolean;
}

export const LINKS: SupplyLink[] = [
    // Suppliers → materials
    { from: 'mine-w', to: 'w', weight: 1 },
    { from: 'mine-nb', to: 'nb', weight: 1 },
    { from: 'refinery', to: 'w', weight: 0.5 },
    { from: 'refinery', to: 'nb', weight: 0.5 },
    { from: 'refinery', to: 'mo', weight: 0.9 },
    { from: 'gas', to: 'ar', weight: 1 },
    // Materials → processes
    { from: 'w', to: 'melt', weight: 0.6 },
    { from: 'w', to: 'atomise', weight: 0.6 },
    { from: 'nb', to: 'melt', weight: 0.5 },
    { from: 'nb', to: 'atomise', weight: 0.5 },
    { from: 'mo', to: 'melt', weight: 0.6 },
    { from: 'ar', to: 'melt', weight: 0.3 },
    { from: 'ar', to: 'atomise', weight: 0.5 },
    { from: 'ar', to: 'print', weight: 0.7 },
    // Processes → components
    { from: 'melt', to: 'nozzle', weight: 0.5 },
    { from: 'melt', to: 'blade', weight: 0.6 },
    { from: 'melt', to: 'tile', weight: 0.7 },
    { from: 'atomise', to: 'nozzle', weight: 0.4 },
    { from: 'atomise', to: 'injector', weight: 0.6 },
    { from: 'print', to: 'injector', weight: 0.6 },
    { from: 'print', to: 'blade', weight: 0.4 },
    { from: 'print', to: 'tile', weight: 0.3 },
    // Components → programmes
    { from: 'nozzle', to: 'launcher', weight: 0.8 },
    { from: 'injector', to: 'launcher', weight: 0.7 },
    { from: 'injector', to: 'jet', weight: 0.4 },
    { from: 'blade', to: 'jet', weight: 0.9 },
    { from: 'tile', to: 'fusion', weight: 0.9 },
    // Feedback: a programme in trouble buys ahead, and the rush lands on the mines.
    { from: 'launcher', to: 'mine-w', weight: 0.35, feedback: true },
    { from: 'jet', to: 'mine-nb', weight: 0.35, feedback: true },
    { from: 'fusion', to: 'mine-w', weight: 0.3, feedback: true },
];

/** Trouble at a place makes more trouble there likelier for a while (the diagonal of A). */
export const SELF_EXCITATION = 0.2;

/** Mean delay from one event to the events it sets off, in days: 1/β. */
export const MEAN_DELAY_DAYS = 8;

export const index = (id: string) => {
    const i = NODES.findIndex((n) => n.id === id);
    if (i < 0) throw new Error(`supply-model: no node ${id}`);
    return i;
};

/**
 * A = [α_ij] with ρ(A) = 1: α_ij is how many events at node i one event at node j sets off. The demo
 * multiplies it by the coupling the visitor chooses, so ρ(A) is exactly that number.
 */
export const BASE: Matrix = (() => {
    const n = NODES.length;
    const a: Matrix = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? SELF_EXCITATION : 0)));
    for (const l of LINKS) a[index(l.to)][index(l.from)] += l.weight;
    const rho = spectralRadius(a);
    return a.map((row) => row.map((v) => v / rho));
})();

export const SUPPLIERS = NODES.map((n, i) => ({ ...n, i })).filter((n) => n.col === 0);
export const PROGRAMMES = NODES.map((n, i) => ({ ...n, i })).filter((n) => n.col === 4);
