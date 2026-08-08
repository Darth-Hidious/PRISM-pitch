import React from 'react';

/**
 * The Mirdyne mark.
 *
 * Inlined rather than referenced as `/mirdyne-mark.svg` because the source
 * asset is filled `#171714` — near-black, and this deck's background is
 * `--c-bg: #08080A`. As an <img> it renders as an invisible square. Inline, the
 * paths take `currentColor`, so each caller sets it with the same colour token
 * as the text beside it.
 *
 * Geometry is copied verbatim from `mirdyne/public/mirdyne-mark.svg`
 * (viewBox 0 0 100 100, two paths); only the fill is parameterised.
 */
export default function MirdyneMark({
    className = '',
    style = {},
}: {
    className?: string;
    style?: React.CSSProperties;
}) {
    return (
        <svg
            className={className}
            style={style}
            viewBox="0 0 100 100"
            fill="none"
            role="img"
            aria-label="Mirdyne"
        >
            <path d="M0 0h45.14v35.98l-10 5.66V100H0V0Z" fill="currentColor" />
            <path d="M58.57 0H100v100H65.43V58.64L46 44.48v-5.67l12.57-8.5V0Z" fill="currentColor" />
        </svg>
    );
}
