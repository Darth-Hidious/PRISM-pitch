import type { ReactNode } from 'react';

/** Small line drawings, one per kind of thing, drawn in the text colour. */
export type GlyphName = 'target' | 'lattice' | 'layers' | 'coupon' | 'gauge' | 'net' | 'curve' | 'seal' | 'lock' | 'funnel' | 'flame' | 'cycle';

const DRAWINGS: Record<GlyphName, ReactNode> = {
    target: (
        <>
            <circle cx="12" cy="12" r="8.5" />
            <circle cx="12" cy="12" r="4.5" />
            <circle cx="12" cy="12" r="1" className="fill" />
            <path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4" />
        </>
    ),
    lattice: (
        <>
            <path d="M5 5h14v14H5z" />
            <path d="M5 5l7 7 7-7M5 19l7-7 7 7" />
            <circle cx="5" cy="5" r="1.6" className="fill" />
            <circle cx="19" cy="5" r="1.6" className="fill" />
            <circle cx="5" cy="19" r="1.6" className="fill" />
            <circle cx="19" cy="19" r="1.6" className="fill" />
            <circle cx="12" cy="12" r="2.2" className="fill" />
        </>
    ),
    layers: (
        <>
            <path d="M12 3l9 4.5-9 4.5-9-4.5z" />
            <path d="M3 12l9 4.5 9-4.5" />
            <path d="M3 16.5l9 4.5 9-4.5" />
        </>
    ),
    coupon: <path d="M2.5 8h5.5l2 2.5h4l2-2.5h5.5v8H16l-2-2.5h-4l-2 2.5H2.5z" />,
    // A half-circle sits low in its square: raised so that what is drawn, stroke included, is centred.
    gauge: (
        <g transform="translate(0 -1.1)">
            <path d="M3.5 17a8.5 8.5 0 0 1 17 0" />
            <path d="M12 17l4.5-6" />
            <circle cx="12" cy="17" r="1.4" className="fill" />
            <path d="M6 12.5l1.2 1M12 8.5v1.6M18 12.5l-1.2 1" />
        </g>
    ),
    net: (
        <>
            <path d="M5 6l7 6-7 6M5 6l7 6M5 18l7-6M12 12l7-4M12 12l7 4M5 12h7" />
            <circle cx="5" cy="6" r="1.8" className="fill" />
            <circle cx="5" cy="12" r="1.8" className="fill" />
            <circle cx="5" cy="18" r="1.8" className="fill" />
            <circle cx="12" cy="12" r="2" className="fill" />
            <circle cx="19" cy="8" r="1.8" className="fill" />
            <circle cx="19" cy="16" r="1.8" className="fill" />
        </>
    ),
    curve: (
        <>
            <path d="M3 20h18M3 20V4" />
            <path d="M4 18c3 0 4-11 8-11s5 11 8 11" />
            <path d="M12 4.5v5M10.5 4.5h3M10.5 9.5h3" />
        </>
    ),
    seal: (
        <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M7.8 12.3l2.8 2.8 5.6-6" />
        </>
    ),
    lock: (
        <>
            <rect x="5" y="10.5" width="14" height="10" rx="2" />
            <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
            <circle cx="12" cy="15.5" r="1.3" className="fill" />
        </>
    ),
    // The dots above the funnel start at the top edge: lowered so that the whole is centred.
    funnel: (
        <g transform="translate(0 0.9)">
            <path d="M3.5 5h17l-6.5 7.5v6l-4 2v-8z" />
            <circle cx="7" cy="2.5" r="1" className="fill" />
            <circle cx="12" cy="2" r="1" className="fill" />
            <circle cx="17" cy="2.5" r="1" className="fill" />
        </g>
    ),
    cycle: (
        <>
            <path d="M19.5 12a7.5 7.5 0 0 1-13 5.1" />
            <path d="M4.5 12a7.5 7.5 0 0 1 13-5.1" />
            <path d="M17.5 3.3v3.8h-3.8" />
            <path d="M6.5 20.7v-3.8h3.8" />
        </>
    ),
    flame: (
        <>
            <path d="M12 21.5c-4 0-6.5-2.6-6.5-6.2 0-3.4 2.6-5.4 3.6-8.3.6 1.6 1.6 2.6 2.6 3.1.2-2.6 1.4-5.2 3.8-7.6.3 3.5 3 5.9 3 10.3 0 5.4-3.1 8.7-6.5 8.7z" />
            <path d="M12 21.5c-1.8 0-3-1.3-3-3 0-1.9 1.5-2.8 2.2-4.6.9 1.7 3.8 2.6 3.8 4.8 0 1.6-1.2 2.8-3 2.8z" />
        </>
    ),
};

/** `size` sets the drawing's own width and height, for when it sits inside another drawing. */
export function Glyph({ name, className = 'rglyph', size }: { name: GlyphName; className?: string; size?: number }) {
    return (
        <svg className={className} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            {DRAWINGS[name]}
        </svg>
    );
}
