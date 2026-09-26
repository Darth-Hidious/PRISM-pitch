/**
 * What people can register interest in, as the form at /interest/ words it. The ids must match
 * api/interest.ts; a link to /interest/?topic=<id> opens the form with that topic chosen.
 */
export const AREAS = [
    { id: 'material', label: 'A new material for a part' },
    { id: 'deployment', label: 'PRISM on our programme' },
    { id: 'supply', label: 'Supply of a qualified material' },
    { id: 'research', label: 'Research collaboration' },
    { id: 'partnership', label: 'Partnership' },
    { id: 'investment', label: 'Investment' },
    { id: 'other', label: 'Something else' },
] as const;

export type AreaId = (typeof AREAS)[number]['id'];
