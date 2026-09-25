export type Visibility = 'private' | 'computable' | 'released' | 'public';

const LABEL: Record<Visibility, string> = {
    private: 'Private',
    computable: 'Computable',
    released: 'Released',
    public: 'Public',
};

/**
 * Where a piece of evidence may go. Four states, each with its own glyph so
 * the state reads without colour: filled square = private, half square =
 * computable, ring = released, dashed ring = public.
 */
export default function RightsState({ state, label }: { state: Visibility; label?: string }) {
    return (
        <span className={`pm-rights pm-rights--${state}`}>
            <span className="pm-rights__glyph" aria-hidden="true" />
            {label ?? LABEL[state]}
        </span>
    );
}
