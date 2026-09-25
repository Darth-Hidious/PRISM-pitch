import StatusPill from './StatusPill';

export type Maturity = 'in-use' | 'prototype' | 'development' | 'target';

const MATURITY: Record<Maturity, { label: string; tone: 'accent' | 'teal' | 'crimson' | 'neutral' }> = {
    'in-use': { label: 'In use', tone: 'accent' },
    prototype: { label: 'Prototype', tone: 'teal' },
    development: { label: 'In development', tone: 'crimson' },
    target: { label: 'Target', tone: 'neutral' },
};

/**
 * How far a capability has come, in TRL order. In use = runs in current
 * programmes; Prototype = PRISM software being matured from TRL 3 to 4;
 * In development = being built; Target = where the platform is going, not
 * claimed today. Every capability claim on the site carries one.
 */
export default function MaturityPill({ maturity }: { maturity: Maturity }) {
    const m = MATURITY[maturity];
    return <StatusPill tone={m.tone}>{m.label}</StatusPill>;
}
