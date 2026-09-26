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
 *
 * `label` overrides the pill's own English word, for a caller that translates it (the site passes its own
 * `t('In use')`, etc.); the default output is unchanged for every other caller (the investor deck).
 */
export default function MaturityPill({ maturity, label }: { maturity: Maturity; label?: string }) {
    const m = MATURITY[maturity];
    return <StatusPill tone={m.tone}>{label ?? m.label}</StatusPill>;
}
