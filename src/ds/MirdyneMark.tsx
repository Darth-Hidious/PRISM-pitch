import type { CSSProperties } from 'react';

/**
 * The Mirdyne mark.
 *
 * Inline so the paths take `currentColor`: set `color` with the same token as
 * the text beside it (`--ink` on paper, `--on-chrome` in the footer band).
 * Geometry is copied verbatim from `public/mirdyne-mark.svg`
 * (viewBox 0 0 100 100, two paths); only the fill is parameterised.
 */
export default function MirdyneMark({
    className,
    style,
    title = 'Mirdyne',
}: {
    className?: string;
    style?: CSSProperties;
    /** Accessible name. Pass an empty string when a visible wordmark sits beside it. */
    title?: string;
}) {
    return (
        <svg
            className={className}
            style={style}
            viewBox="0 0 100 100"
            fill="none"
            role={title ? 'img' : undefined}
            aria-label={title || undefined}
            aria-hidden={title ? undefined : true}
        >
            <path d="M0 0h45.14v35.98l-10 5.66V100H0V0Z" fill="currentColor" />
            <path d="M58.57 0H100v100H65.43V58.64L46 44.48v-5.67l12.57-8.5V0Z" fill="currentColor" />
        </svg>
    );
}
