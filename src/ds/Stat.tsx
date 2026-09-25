import type { ReactNode } from 'react';

/**
 * A figure with its label. `lg` uses the light numeral face for hero figures;
 * `md` for rows of three or four. Put the source in a SourceLine nearby.
 */
export default function Stat({
    value,
    label,
    note,
    size = 'md',
}: {
    value: ReactNode;
    label: ReactNode;
    note?: ReactNode;
    size?: 'md' | 'lg';
}) {
    return (
        <div className={`pm-stat pm-stat--${size}`}>
            <div className={`pm-stat__value${size === 'lg' ? ' pm-numeral' : ''}`}>{value}</div>
            <div className="pm-stat__label">{label}</div>
            {note && <div className="pm-stat__note">{note}</div>}
        </div>
    );
}
