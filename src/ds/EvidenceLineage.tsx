import { Fragment } from 'react';
import RightsState, { type Visibility } from './RightsState';

export interface LineageNode {
    type: string;
    title: string;
    state?: Visibility;
}

/**
 * The chain an engineering claim can be walked back along: requirement to
 * decision, each link named. The last node is filled; it is what the chain
 * justifies. `links[i]` joins `nodes[i]` to `nodes[i + 1]`.
 */
export default function EvidenceLineage({
    nodes,
    links,
    label = 'Evidence lineage',
}: {
    nodes: LineageNode[];
    links: string[];
    label?: string;
}) {
    return (
        <ol className="pm-lineage" aria-label={label}>
            {nodes.map((n, i) => (
                <Fragment key={n.type + i}>
                    <li className={`pm-lineage__node${i === nodes.length - 1 ? ' pm-lineage__node--emphasis' : ''}`}>
                        <span className="pm-lineage__name">
                            <span className="pm-object__type">{n.type}</span>
                            <span className="pm-lineage__title">{n.title}</span>
                        </span>
                        {n.state && <RightsState state={n.state} />}
                    </li>
                    {i < nodes.length - 1 && (
                        <li className="pm-lineage__link">
                            {links[i]}
                        </li>
                    )}
                </Fragment>
            ))}
        </ol>
    );
}
