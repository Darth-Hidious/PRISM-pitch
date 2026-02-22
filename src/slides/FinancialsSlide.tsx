export default function FinancialsSlide() {
    // Revenue data in €K from bottom-up financial model
    const years = ['Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'Y8', 'Y9', 'Y10'];
    const streams = [
        { name: 'R&D Contracts', color: '#C9A84C', data: [700, 900, 1200, 1350, 1900, 2300, 2300, 1800, 1600, 1500] },
        { name: 'AI / MaaS', color: '#34D399', data: [0, 50, 120, 345, 620, 945, 1320, 1785, 2200, 2675] },
        { name: 'Components', color: '#4A8FD4', data: [0, 40, 120, 188, 275, 435, 670, 935, 1275, 1600] },
        { name: 'Licensing', color: '#EDEDEF', data: [0, 0, 0, 0, 190, 420, 750, 840, 1300, 1450] },
    ];
    const maxVal = 7500;
    // Chart bounds inside viewBox
    const cL = 48, cR = 395, cT = 10, cB = 190;
    const cH = cB - cT;
    const barW = 24;
    const slot = (cR - cL) / 10;

    const gridLines = [0, 1500, 3000, 4500, 6000, 7500];

    return (
        <div className="relative w-full h-full" style={{ background: 'var(--c-bg)' }}>
            <div className="relative z-10 w-full h-full flex flex-col slide-pad">
                {/* Header */}
                <header className="flex items-center justify-between anim-in anim-d1" style={{ marginBottom: 'clamp(16px, 2vw, 32px)' }}>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(10px, 0.85vw, 13px)',
                        letterSpacing: '0.15em',
                        color: 'var(--c-gold)',
                    }}>
                        07 &mdash; FINANCIALS
                    </span>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(10px, 0.85vw, 13px)',
                        letterSpacing: '0.1em',
                        color: 'var(--c-dim)',
                    }}>
                        PRISM
                    </span>
                </header>

                {/* Title */}
                <h1 className="anim-in anim-d2" style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(24px, 3vw, 56px)',
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                    marginBottom: 'clamp(4px, 0.5vw, 8px)',
                }}>
                    Bottom-Up Revenue Model
                </h1>
                <p className="anim-in anim-d3" style={{
                    fontSize: 'clamp(12px, 0.95vw, 16px)',
                    color: 'var(--c-muted)',
                    marginBottom: 'clamp(16px, 2vw, 32px)',
                }}>
                    EBITDA-positive from Year 1. Improving unit economics as platform scales.
                </p>

                {/* Chart + Metrics */}
                <div className="flex-1 flex items-center anim-in anim-d4 mobile-stack" style={{ gap: 'clamp(16px, 3vw, 48px)', minHeight: 0 }}>
                    {/* Stacked Bar Chart */}
                    <div style={{ flex: '0 0 58%', maxHeight: '100%' }}>
                        <svg viewBox="0 0 420 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            {/* Y-axis gridlines + labels */}
                            {gridLines.map(v => {
                                const y = cB - (v / maxVal) * cH;
                                return (
                                    <g key={v}>
                                        <line x1={cL} y1={y} x2={cR} y2={y} stroke="#EDEDEF" strokeWidth="0.5" opacity={v === 0 ? 0.25 : 0.08} />
                                        <text x={cL - 6} y={y + 3} textAnchor="end" fill="#EDEDEF" opacity="0.35" fontSize="7" fontFamily="monospace">
                                            {v === 0 ? '0' : `${v / 1000}M`}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Stacked bars */}
                            {years.map((yr, i) => {
                                const x = cL + i * slot + (slot - barW) / 2;
                                let cumY = cB;
                                return (
                                    <g key={yr}>
                                        {streams.map(stream => {
                                            const val = stream.data[i];
                                            if (val <= 0) return null;
                                            const h = (val / maxVal) * cH;
                                            cumY -= h;
                                            return (
                                                <rect
                                                    key={stream.name}
                                                    x={x}
                                                    y={cumY}
                                                    width={barW}
                                                    height={h}
                                                    fill={stream.color}
                                                    opacity="0.85"
                                                    rx="1.5"
                                                />
                                            );
                                        })}
                                        {/* Total label on top */}
                                        {(() => {
                                            const total = streams.reduce((s, st) => s + st.data[i], 0);
                                            const topY = cB - (total / maxVal) * cH;
                                            return (
                                                <text x={x + barW / 2} y={topY - 4} textAnchor="middle" fill="#EDEDEF" opacity="0.5" fontSize="6.5" fontFamily="monospace">
                                                    {total >= 1000 ? `${(total / 1000).toFixed(1)}M` : `${total}K`}
                                                </text>
                                            );
                                        })()}
                                        {/* Year label */}
                                        <text x={x + barW / 2} y={cB + 13} textAnchor="middle" fill="#EDEDEF" opacity="0.4" fontSize="8" fontFamily="monospace">
                                            {yr}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Legend */}
                            {streams.map((s, i) => (
                                <g key={s.name} transform={`translate(${cL + i * 95}, 210)`}>
                                    <rect x="0" y="-5" width="8" height="8" fill={s.color} opacity="0.85" rx="1" />
                                    <text x="12" y="2" fill="#EDEDEF" opacity="0.45" fontSize="7" fontFamily="monospace">{s.name}</text>
                                </g>
                            ))}
                        </svg>
                    </div>

                    {/* Key Metrics */}
                    <div className="flex flex-col" style={{ flex: 1, gap: 'clamp(8px, 1vw, 14px)' }}>
                        {[
                            { value: '\u20AC1.8M', label: 'EBITDA by Y10', sub: '25% margin at scale, positive from Year 1', accent: 'var(--c-gold)' },
                            { value: '\u20AC1.5M', label: 'Net Income Y10', sub: 'After 23% effective tax rate', accent: 'var(--c-green)' },
                            { value: '35%', label: 'Recurring by Y10', sub: 'MaaS subscriptions + maintenance fees', accent: 'var(--c-blue)' },
                            { value: '38 mo', label: 'Runway', sub: '\u20AC15.4M cumulative cash by Year 10', accent: '#EDEDEF' },
                        ].map((m) => (
                            <div key={m.label} className="glass-card" style={{ padding: 'clamp(12px, 1.2vw, 20px)', display: 'flex', gap: 'clamp(10px, 1vw, 16px)', alignItems: 'flex-start' }}>
                                <div style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: 'clamp(20px, 2vw, 36px)',
                                    fontWeight: 800,
                                    color: m.accent,
                                    lineHeight: 1,
                                    minWidth: 'clamp(60px, 5vw, 90px)',
                                }}>
                                    {m.value}
                                </div>
                                <div>
                                    <div style={{
                                        fontFamily: 'var(--font-display)',
                                        fontSize: 'clamp(13px, 1.1vw, 20px)',
                                        fontWeight: 600,
                                        marginBottom: '2px',
                                    }}>
                                        {m.label}
                                    </div>
                                    <div style={{
                                        fontSize: 'clamp(11px, 0.85vw, 14px)',
                                        color: 'var(--c-muted)',
                                        lineHeight: 1.4,
                                    }}>
                                        {m.sub}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
