import { useId } from 'react';
import type { CSSProperties } from 'react';

/**
 * The PRISM mark: a wireframe pyramid with a spectrum inside.
 *
 * Traced from the logo artwork (500 px canvas) and kept in its coordinates.
 * The edges take `currentColor`, so the mark follows the text beside it:
 * navy on paper, white on navy. The spectrum reads its stops from
 * `--prism-s0` … `--prism-s5`, which the themes set (muted on paper,
 * saturated on navy), matching the light- and dark-mode logo files in
 * `public/brand/`.
 */
export default function PrismMark({
    className,
    style,
    title = 'PRISM',
    weight = 13,
}: {
    className?: string;
    style?: CSSProperties;
    /** Accessible name. Pass an empty string when a visible wordmark sits beside it. */
    title?: string;
    /** Edge width in logo units (the artwork uses 13; thicker reads better below 32 px). */
    weight?: number;
}) {
    const id = useId().replace(/:/g, '');
    const stops = [0, 0.2, 0.38, 0.56, 0.76, 1];
    return (
        <svg
            className={className}
            style={style}
            viewBox="66 60 380 380"
            fill="none"
            role={title ? 'img' : undefined}
            aria-label={title || undefined}
            aria-hidden={title ? undefined : true}
        >
            <defs>
                <linearGradient id={`${id}-s`} gradientUnits="userSpaceOnUse" x1="112" y1="0" x2="262" y2="0">
                    {stops.map((o, i) => (
                        <stop key={o} offset={o} style={{ stopColor: `var(--prism-s${i})` }} />
                    ))}
                </linearGradient>
            </defs>
            <path
                d="M298 88 87 267 238 392 426 353Z M298 88 290 297 M87 267 290 297 426 353"
                stroke="currentColor"
                strokeWidth={weight}
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            <path d="M112 266 262 195 226 349 189 280Z" fill={`url(#${id}-s)`} />
        </svg>
    );
}
