import type { ReactNode } from 'react';

/**
 * The line that says where a figure or image comes from. Every slide and
 * every section with a number or a photograph carries one.
 */
export default function SourceLine({ children, label = 'Source' }: { children: ReactNode; label?: string }) {
    return (
        <p className="pm-source-line">
            {label && <b>{label}: </b>}
            {children}
        </p>
    );
}
