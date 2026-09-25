import type { ReactNode } from 'react';

export interface TimelineItem {
    date?: ReactNode;
    title: ReactNode;
    detail?: ReactNode;
    /** done = steel dot, current = crimson dot, next = hollow dot. */
    state?: 'done' | 'current' | 'next';
}

/** A vertical run of dated events on one rule. The current item is crimson. */
export default function Timeline({ items, label }: { items: TimelineItem[]; label?: string }) {
    return (
        <ol className="pm-timeline" aria-label={label}>
            {items.map((it, i) => (
                <li key={i} className={`pm-timeline__item pm-timeline__item--${it.state ?? 'done'}`}>
                    <span className="pm-timeline__dot" aria-hidden="true" />
                    <span className="pm-timeline__date">{it.date}</span>
                    <span className="pm-timeline__title">
                        {it.title}
                        {it.detail && <span className="pm-timeline__detail">{it.detail}</span>}
                    </span>
                </li>
            ))}
        </ol>
    );
}
