import type { ReactNode } from 'react';
import MaturityPill, { type Maturity } from './MaturityPill';

export interface StackLayer {
    name: ReactNode;
    detail: ReactNode;
    maturity: Maturity;
}

/**
 * The whole platform as layers, top (what you ask for) to bottom (what you
 * receive), each stating how far along it is. The maturity column is the
 * point: ambition and evidence on the same line.
 */
export default function CapabilityStack({ layers, label }: { layers: StackLayer[]; label?: string }) {
    return (
        <ol className="pm-stack" aria-label={label}>
            {layers.map((l, i) => (
                <li key={i} className="pm-stack__layer">
                    <span className="pm-stack__index">{String(i + 1).padStart(2, '0')}</span>
                    <span className="pm-stack__name">{l.name}</span>
                    <span className="pm-stack__detail">{l.detail}</span>
                    <span className="pm-stack__maturity">
                        <MaturityPill maturity={l.maturity} />
                    </span>
                </li>
            ))}
        </ol>
    );
}
