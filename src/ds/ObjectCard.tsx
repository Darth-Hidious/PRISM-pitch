import type { ReactNode } from 'react';
import RightsState, { type Visibility } from './RightsState';

/**
 * One object of the PRISM ontology (a Requirement, a Specimen, a Test) with
 * its identifier, a few properties and where it may go. Illustrative objects
 * say so in their properties; this card never carries invented measurements.
 */
export default function ObjectCard({
    type,
    title,
    id,
    properties = [],
    state,
    emphasis = false,
}: {
    type: string;
    title: ReactNode;
    id?: string;
    properties?: [string, ReactNode][];
    state?: Visibility;
    emphasis?: boolean;
}) {
    return (
        <article className={`pm-object${emphasis ? ' pm-object--emphasis' : ''}`}>
            <div className="pm-object__head">
                <span className="pm-object__type">{type}</span>
                {state && <RightsState state={state} />}
            </div>
            <div>
                <h3 className="pm-object__title">{title}</h3>
                {id && <div className="pm-object__id">{id}</div>}
            </div>
            {properties.length > 0 && (
                <dl className="pm-object__props">
                    {properties.map(([k, v]) => (
                        <div key={k} style={{ display: 'contents' }}>
                            <dt>{k}</dt>
                            <dd>{v}</dd>
                        </div>
                    ))}
                </dl>
            )}
        </article>
    );
}
