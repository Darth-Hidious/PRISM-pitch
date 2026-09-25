import type { ReactNode } from 'react';

function Arrow({ external }: { external?: boolean }) {
    return external ? (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M5 11 11 5M6 5h5v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
        </svg>
    ) : (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2.5 8h10M9 4.5 12.5 8 9 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
        </svg>
    );
}

/**
 * The one button. `primary` at most once per view, for the thing the page is
 * for; `secondary` beside it; `link` for inline follow-ups. With `href` it
 * renders a link, otherwise a `<button>`.
 */
export default function Button({
    children,
    variant = 'primary',
    href,
    external = false,
    arrow = true,
    onClick,
    className,
}: {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'link';
    href?: string;
    /** Opens in a new tab and swaps the arrow for an out-link glyph. */
    external?: boolean;
    arrow?: boolean;
    onClick?: () => void;
    className?: string;
}) {
    const cls = ['pm-btn', `pm-btn--${variant}`, className].filter(Boolean).join(' ');
    const content = (
        <>
            <span>{children}</span>
            {arrow && <Arrow external={external} />}
        </>
    );
    if (href) {
        return (
            <a
                className={cls}
                href={href}
                onClick={onClick}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
                {content}
            </a>
        );
    }
    return (
        <button type="button" className={cls} onClick={onClick}>
            {content}
        </button>
    );
}
