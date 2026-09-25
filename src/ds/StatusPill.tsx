import type { ReactNode } from 'react';

export type StatusTone = 'accent' | 'teal' | 'crimson' | 'neutral';

/**
 * One or two words of programme status. Tone carries meaning, never
 * decoration: accent = awarded or in use, teal = contracted or with partners,
 * crimson = early signal or in development, neutral (dashed) = next or target.
 */
export default function StatusPill({ children, tone = 'accent' }: { children: ReactNode; tone?: StatusTone }) {
    return <span className={`pm-pill pm-pill--${tone}`}>{children}</span>;
}
