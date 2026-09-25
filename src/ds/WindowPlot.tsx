/**
 * The manufacturing window: nested regions over two process variables, the
 * inner one being what can be made repeatably, one crimson point the current
 * optimum. Conceptual by definition; never plot measured data with it.
 */
export default function WindowPlot({
    xLabel = 'Machine energy',
    yLabel = 'Feedstock variation',
    label = 'Stable manufacturing window',
    caption = 'Conceptual: the useful answer is a tolerant region, not a single recipe.',
}: {
    xLabel?: string;
    yLabel?: string;
    label?: string;
    caption?: string;
}) {
    return (
        <svg className="pm-window" viewBox="0 0 560 360" role="img" aria-label={`${label}. ${caption}`}>
            <rect className="pm-window__frame" x="0.5" y="0.5" width="559" height="359" rx="5" />
            <path className="pm-window__axis" d="M72 292 H512 M72 292 V48" />
            <path className="pm-window__axis" d="M506 288 512 292 506 296 M68 54 72 48 76 54" />
            <text className="pm-window__text" x="512" y="320" textAnchor="end">{xLabel}</text>
            <text className="pm-window__text" x="-48" y="52" transform="rotate(-90)" textAnchor="end">{yLabel}</text>
            <ellipse className="pm-window__outer" cx="300" cy="172" rx="172" ry="86" />
            <ellipse className="pm-window__mid" cx="300" cy="172" rx="106" ry="52" />
            <ellipse className="pm-window__inner" cx="300" cy="172" rx="48" ry="29" />
            <circle className="pm-window__point" cx="300" cy="172" r="6" />
            <text className="pm-window__label" x="300" y="68" textAnchor="middle">{label}</text>
        </svg>
    );
}
