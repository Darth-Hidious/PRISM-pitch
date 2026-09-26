import { RightsState } from '../ds';

/**
 * The rule that makes partners willing to share: anything made from data keeps the strictest rights of its
 * inputs. Two inputs, one published and one a partner's, merge into a result that stays private. Moves only
 * on the slide on screen (deck.css, `.d-proof.is-live`).
 */
export function RightsMerge() {
    return (
        <div className="d-merge" role="img" aria-label="Published data and a partner’s private data make a result, and the result stays private.">
            <div className="d-merge__in d-merge__in--a" aria-hidden="true">
                <span className="d-merge__name">Published data</span>
                <RightsState state="public" />
            </div>
            <div className="d-merge__in d-merge__in--b" aria-hidden="true">
                <span className="d-merge__name">Partner data</span>
                <RightsState state="private" />
            </div>
            <svg className="d-merge__wires" viewBox="0 0 120 80" preserveAspectRatio="none" aria-hidden="true">
                <path pathLength={1} d="M0,18 C58,18 58,40 108,40" />
                <path pathLength={1} d="M0,62 C58,62 58,40 108,40" />
                <path className="d-merge__tip" d="M106,35 L116,40 L106,45 Z" />
            </svg>
            <div className="d-merge__out" aria-hidden="true">
                <span className="d-merge__name">Result</span>
                <RightsState state="private" />
            </div>
        </div>
    );
}
