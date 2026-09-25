import type { ReactNode } from 'react';

/** Wide-tracked caps label above a headline: the deck's section marker. */
export default function Kicker({
    children,
    tone = 'accent',
    as: Tag = 'p',
    className,
}: {
    children: ReactNode;
    tone?: 'accent' | 'muted';
    as?: 'p' | 'span' | 'h2' | 'h3';
    className?: string;
}) {
    const cls = ['pm-kicker', tone === 'muted' && 'pm-kicker--muted', className].filter(Boolean).join(' ');
    return <Tag className={cls}>{children}</Tag>;
}
