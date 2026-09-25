import type { ReactNode } from 'react';

export interface ChainStep {
    label: ReactNode;
    detail?: ReactNode;
}

/**
 * Numbered steps joined by steel connectors, read left to right. The last step
 * is filled by default: it is where the chain lands (Evidence). `loop` draws
 * the return path under the chain and names it.
 */
export default function ProcessChain({
    steps,
    emphasizeLast = true,
    loop,
    label,
}: {
    steps: ChainStep[];
    emphasizeLast?: boolean;
    loop?: ReactNode;
    label?: string;
}) {
    return (
        <div className="pm-chain-wrap">
            <ol className="pm-chain" aria-label={label}>
                {steps.map((s, i) => (
                    <li
                        key={i}
                        className={`pm-chain__step${emphasizeLast && i === steps.length - 1 ? ' pm-chain__step--emphasis' : ''}`}
                    >
                        <span className="pm-chain__label">{s.label}</span>
                        {s.detail && <span className="pm-chain__detail">{s.detail}</span>}
                    </li>
                ))}
            </ol>
            {loop && (
                <div className="pm-chain__loop">
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M13 8a5 5 0 1 1-1.46-3.54M13 2.5v3h-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
                    </svg>
                    <span>{loop}</span>
                </div>
            )}
        </div>
    );
}
