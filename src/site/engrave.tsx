/**
 * Engraved line drawing in plain SVG, after the fiziko look of the Forager
 * diagrams: spheres shaded with offset rings, hatched solids and thin arrows,
 * in ink on paper, with sans labels and serif-italic symbols. Colours come
 * from CSS (`.eg-*` in site.css), so a drawing follows its section's ink.
 */
import type { ReactNode } from 'react';
import { arc } from './arc';

export type Tone = 'white' | 'light' | 'mid' | 'dark';

/** A shaded sphere: body, rings drawn toward the lower right, and a heavier shadow edge. */
export function Ball({ cx, cy, r, tone = 'white' }: { cx: number; cy: number; r: number; tone?: Tone }) {
    const rings = r < 5 ? 1 : r < 10 ? 2 : 3;
    return (
        <g className={`eg-ball eg-ball--${tone}`}>
            <circle className="eg-ball__body" cx={cx} cy={cy} r={r} />
            {Array.from({ length: rings }, (_, i) => {
                const k = i + 1;
                const rr = r * (1 - (k * 0.62) / (rings + 0.6));
                const off = r * 0.1 * k;
                return <path key={k} className="eg-ball__ring" d={arc(cx + off, cy + off, rr, -12 + k * 14, 172 - k * 14)} />;
            })}
            <path className="eg-ball__shade" d={arc(cx, cy, r, 8, 112)} />
        </g>
    );
}

/** Pattern and marker definitions; `id` keeps each drawing's defs apart. */
export function Defs({ id }: { id: string }) {
    return (
        <defs>
            <pattern id={`${id}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line className="eg-hatchline" x1="0" y1="0" x2="0" y2="6" />
            </pattern>
            <pattern id={`${id}-fine`} width="3.5" height="3.5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line className="eg-hatchline" x1="0" y1="0" x2="0" y2="3.5" />
            </pattern>
            <pattern id={`${id}-layers`} width="8" height="4" patternUnits="userSpaceOnUse">
                <line className="eg-hatchline" x1="0" y1="0.5" x2="8" y2="0.5" />
            </pattern>
            <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path className="eg-arrowhead" d="M0,1.5 L10,5 L0,8.5 z" />
            </marker>
        </defs>
    );
}

type Kind = 'strong' | 'plain' | 'small' | 'sym' | 'head';

/** A label. `strong` names a thing, `plain` and `small` describe it, `sym` is a symbol, `head` a column head. */
export function T({
    x,
    y,
    children,
    kind = 'plain',
    anchor = 'middle',
}: {
    x: number;
    y: number;
    children: ReactNode;
    kind?: Kind;
    anchor?: 'start' | 'middle' | 'end';
}) {
    return (
        <text className={`eg-t eg-t--${kind}`} x={x} y={y} textAnchor={anchor}>
            {children}
        </text>
    );
}

/** A thin arrow along a straight line or an SVG path. */
export function Arrow({ id, d, dashed = false, className }: { id: string; d: string; dashed?: boolean; className?: string }) {
    return (
        <path
            className={['eg-line', dashed && 'eg-line--dashed', className].filter(Boolean).join(' ')}
            d={d}
            markerEnd={`url(#${id}-arrow)`}
        />
    );
}
