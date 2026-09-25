import type { ReactNode } from 'react';

/** Section index line: "02 — How it works", with a hairline running to the edge. */
export function Idx({ n, children, tail }: { n: string; children: ReactNode; tail?: ReactNode }) {
    return (
        <p className="idx">
            <b>{n}</b>
            <span>{children}</span>
            <i aria-hidden="true" />
            {tail && <span className="idx__tail">{tail}</span>}
        </p>
    );
}

/** Sources and fine print, folded away: one small word on the page, the detail one tap away. */
export function Note({ label = 'Sources', children }: { label?: string; children: ReactNode }) {
    return (
        <details className="note">
            <summary>{label}</summary>
            <p>{children}</p>
        </details>
    );
}

/** Faint vertical rails at the column quarters of the container, for dark sections. */
export function Rails() {
    return (
        <div className="rails" aria-hidden="true">
            <div className="wrap rails__grid">
                <i />
                <i />
                <i />
                <i />
            </div>
        </div>
    );
}

/** Film grain laid over a dark section so flat colour reads as a surface. */
export function Grain() {
    return <div className="grain" aria-hidden="true" />;
}

/** An arrow for links inside running text. */
export function Arrow({ external = false }: { external?: boolean }) {
    return external ? (
        <svg className="arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
        </svg>
    ) : (
        <svg className="arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2.5 8h10M9 4.5 12.5 8 9 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
        </svg>
    );
}
