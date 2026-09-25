import type { ReactNode } from 'react';

export type ManifestValue = string | { allow: string } | { deny: string };

function renderValue(v: ManifestValue): ReactNode {
    if (typeof v === 'string') return v;
    if ('allow' in v) return <span className="pm-manifest__allow">{v.allow}</span>;
    return <span className="pm-manifest__deny">{v.deny}</span>;
}

/**
 * The machine-readable rights that travel with a piece of evidence: owner,
 * permitted parties and purposes, what may be derived, where it may go. Mark
 * example manifests as illustrative in the caption.
 */
export default function RightsManifest({
    rows,
    caption,
    note,
}: {
    rows: [string, ManifestValue][];
    caption?: string;
    note?: string;
}) {
    return (
        <figure className="pm-manifest">
            {(caption || note) && (
                <figcaption className="pm-manifest__caption">
                    <span>{caption}</span>
                    {note && <span>{note}</span>}
                </figcaption>
            )}
            <dl className="pm-manifest__rows">
                {rows.map(([k, v]) => (
                    <div key={k} style={{ display: 'contents' }}>
                        <dt>{k}</dt>
                        <dd>{renderValue(v)}</dd>
                    </div>
                ))}
            </dl>
        </figure>
    );
}
