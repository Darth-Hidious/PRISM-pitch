import type { ReactNode } from 'react';
import StatusPill, { type StatusTone } from './StatusPill';

export interface StatusRow {
    entity: ReactNode;
    entityNote?: ReactNode;
    status: { label: string; tone: StatusTone };
    /** First paragraph is the claim in bold; later ones the evidence. */
    statement: ReactNode[];
}

/**
 * Who, how far along, what exists today: the deck's status table. One claim
 * per row, stated at the maturity it has reached, never ahead of it.
 */
export default function StatusTable({
    rows,
    columns = ['Programme', 'Status', 'What exists today'],
}: {
    rows: StatusRow[];
    columns?: [string, string, string];
}) {
    return (
        <table className="pm-status-table">
            <thead>
                <tr>
                    {columns.map((c) => (
                        <th key={c} scope="col" className="pm-column">
                            {c}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((r, i) => (
                    <tr key={i}>
                        <td className="pm-status-table__entity">
                            <strong>{r.entity}</strong>
                            {r.entityNote && <span>{r.entityNote}</span>}
                        </td>
                        <td className="pm-status-table__status">
                            <StatusPill tone={r.status.tone}>{r.status.label}</StatusPill>
                        </td>
                        <td className="pm-status-table__statement">
                            {r.statement.map((p, j) => (
                                <p key={j}>{p}</p>
                            ))}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
