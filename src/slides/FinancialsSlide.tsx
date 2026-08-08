import VideoBackground from '../components/VideoBackground';

/**
 * Financials — Base and Upside on one chart, no tabs.
 *
 * Source: `ESA BIC Proposal/2_WORKING/PRISM_Financial_Model_Researched_Europe_2026.xlsx`
 * (version "Research refresh", 27 Jul 2026, Checks = PASS).
 *
 * The workbook caches outputs only for the Selected scenario, Base. Upside comes
 * from re-evaluating the workbook's own Revenue Build, P&L and Cash Flow formulas
 * against its Upside assumption columns; that replica reproduces Base to the euro
 * on revenue, EBITDA, gross margin, cumulative required equity and ending cash
 * across all ten years, which is what makes the Upside column trustworthy.
 *
 * Bear is deliberately not shown. Run to 2035 the workbook's Bear column never
 * breaks even, ends at -17% gross margin and demands €20.0M of equity — it is a
 * wind-down, not a downside operating case (it prices programmes at €400k against
 * a €423k break-even and grows to 21 FTE while revenue plateaus at €2.0M).
 * Neither raising price nor freezing headcount repairs it. The downside answer
 * for diligence is a dated stop rule, not a curve: if fewer than three capability
 * programmes are recognised by end-2029, the plan stops, which caps capital at
 * risk at €4.06M. Base reaches 5.8 recognised programmes by 2029; Bear reaches
 * 1.8. Keep that answer ready — do not put it on the slide.
 */

const YEARS = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035];

const BASE = {
    revenue: [310000, 1237512, 2051171, 3152596, 4733979, 6695281, 8864410, 11672867, 14657526, 18024503],
    ebitda: [-416700, -111546, 27046, 342451, 699068, 1152316, 1700629, 2601343, 3574614, 4707052],
    grossMargin: 0.608,
    equity: 2907256,
    breakeven: 2028,
};

const UPSIDE = {
    revenue: [330000, 2862740, 6161133, 9560026, 14515409, 20767730, 28557824, 38326004, 50236280, 63827289],
    ebitda: [-462400, 952727, 2868134, 4868837, 7774695, 11651585, 16630009, 23161778, 31310526, 40844893],
    grossMargin: 0.808,
    equity: 579952,
    breakeven: 2027,
};

const eurM = (n: number) => `${n < 0 ? '−' : ''}€${Math.abs(n / 1_000_000).toFixed(2)}M`;

const ROWS = [
    { k: 'Operating revenue 2035', base: eurM(BASE.revenue[9]), up: eurM(UPSIDE.revenue[9]) },
    { k: 'EBITDA 2035, before grants', base: eurM(BASE.ebitda[9]), up: eurM(UPSIDE.ebitda[9]) },
    { k: 'Gross margin 2035', base: `${(BASE.grossMargin * 100).toFixed(0)}%`, up: `${(UPSIDE.grossMargin * 100).toFixed(0)}%` },
    { k: 'EBITDA-positive from', base: `${BASE.breakeven}`, up: `${UPSIDE.breakeven}` },
    { k: 'Cumulative equity required', base: eurM(BASE.equity), up: eurM(UPSIDE.equity) },
];

export default function FinancialsSlide() {
    // Shared linear axis across both series, so the gap between them is the point.
    const cL = 40, cR = 410, cT = 14, cB = 168;
    const hi = Math.max(...UPSIDE.revenue);
    const x = (i: number) => cL + (i * (cR - cL)) / (YEARS.length - 1);
    const y = (v: number) => cB - (v / hi) * (cB - cT);

    const series = (vals: number[]) => 'M ' + vals.map((v, i) => `${x(i)} ${y(v)}`).join(' L ');
    const area = (vals: number[]) =>
        `M ${x(0)} ${cB} ` + vals.map((v, i) => `L ${x(i)} ${y(v)}`).join(' ') + ` L ${x(YEARS.length - 1)} ${cB} Z`;

    return (
        <div className="relative w-full h-full video-dim">
            <VideoBackground src="https://stream.mux.com/fHfa8VIbBdqZelLGg5thjsypZ101M01dbyIMLNDWQwlLA.m3u8" />

            <div className="relative z-10 w-full h-full flex flex-col slide-pad">
                <header className="anim-in anim-d1" style={{ marginBottom: 'clamp(10px, 1.4vw, 24px)' }}>
                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(9px, 0.75vw, 12px)',
                        letterSpacing: '0.15em',
                        color: 'var(--c-gold)',
                    }}>
                        07 &mdash; FINANCIALS
                    </div>
                    <h2 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(24px, 3vw, 52px)',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.05,
                    }}>
                        Ten-year operating plan
                    </h2>
                </header>

                <main className="flex-1 flex mobile-stack anim-in anim-d2" style={{ gap: 'clamp(16px, 3vw, 52px)', minHeight: 0 }}>
                    {/* Chart */}
                    <div style={{ flex: '0 0 56%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                        <svg viewBox="0 0 424 190" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ flex: 1, minHeight: 0 }}>
                            <line x1={cL} y1={cB} x2={cR} y2={cB} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />

                            {/* Upside */}
                            <path d={area(UPSIDE.revenue)} fill="rgba(52,211,153,0.08)" />
                            <path d={series(UPSIDE.revenue)} fill="none" stroke="var(--c-green)" strokeWidth="1.8" strokeLinejoin="round" />

                            {/* Base, emphasised */}
                            <path d={area(BASE.revenue)} fill="rgba(201,168,76,0.18)" />
                            <path d={series(BASE.revenue)} fill="none" stroke="var(--c-gold)" strokeWidth="2.2" strokeLinejoin="round" />

                            {/* Endpoint labels */}
                            <circle cx={x(9)} cy={y(UPSIDE.revenue[9])} r="2.6" fill="var(--c-green)" />
                            <text
                                x={x(9) - 10} y={y(UPSIDE.revenue[9]) + 11} textAnchor="end" fill="var(--c-green)"
                                style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.08em' }}
                            >
                                UPSIDE {eurM(UPSIDE.revenue[9])}
                            </text>

                            <circle cx={x(9)} cy={y(BASE.revenue[9])} r="2.6" fill="var(--c-gold)" />
                            <text
                                x={x(9) - 10} y={y(BASE.revenue[9]) - 8} textAnchor="end" fill="var(--c-gold)"
                                style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.08em' }}
                            >
                                BASE {eurM(BASE.revenue[9])}
                            </text>

                            {YEARS.map((yr, i) => (i % 3 === 0 || i === YEARS.length - 1) && (
                                <text
                                    key={yr} x={x(i)} y={185} textAnchor="middle" fill="var(--c-dim)"
                                    style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5 }}
                                >
                                    {yr}
                                </text>
                            ))}
                        </svg>

                        <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'clamp(8px, 0.62vw, 10px)',
                            letterSpacing: '0.12em',
                            color: 'var(--c-dim)',
                            marginTop: 'clamp(4px, 0.5vw, 8px)',
                        }}>
                            OPERATING REVENUE, EXCLUDES GRANTS
                        </div>
                    </div>

                    {/* Side-by-side comparison */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div className="flex" style={{
                            gap: 'clamp(8px, 1vw, 16px)',
                            paddingBottom: 'clamp(6px, 0.7vw, 10px)',
                            borderBottom: '1px solid var(--c-border)',
                            marginBottom: 'clamp(8px, 1vw, 14px)',
                        }}>
                            <div style={{ flex: 1 }} />
                            <div style={{
                                flex: '0 0 26%', textAlign: 'right',
                                fontFamily: 'var(--font-mono)', fontSize: 'clamp(8px, 0.65vw, 11px)',
                                letterSpacing: '0.14em', color: 'var(--c-gold)',
                            }}>
                                BASE
                            </div>
                            <div style={{
                                flex: '0 0 26%', textAlign: 'right',
                                fontFamily: 'var(--font-mono)', fontSize: 'clamp(8px, 0.65vw, 11px)',
                                letterSpacing: '0.14em', color: 'var(--c-green)',
                            }}>
                                UPSIDE
                            </div>
                        </div>

                        {ROWS.map((r) => (
                            <div
                                key={r.k}
                                className="flex items-baseline"
                                style={{ gap: 'clamp(8px, 1vw, 16px)', padding: 'clamp(5px, 0.7vw, 11px) 0' }}
                            >
                                <div style={{
                                    flex: 1, minWidth: 0,
                                    fontSize: 'clamp(10px, 0.8vw, 14px)',
                                    color: 'var(--c-muted)',
                                    lineHeight: 1.3,
                                }}>
                                    {r.k}
                                </div>
                                <div style={{
                                    flex: '0 0 26%', textAlign: 'right',
                                    fontFamily: 'var(--font-display)',
                                    fontSize: 'clamp(14px, 1.3vw, 24px)',
                                    fontWeight: 700, lineHeight: 1,
                                    letterSpacing: '-0.01em',
                                    fontVariantNumeric: 'tabular-nums',
                                    color: 'var(--c-text)',
                                }}>
                                    {r.base}
                                </div>
                                <div style={{
                                    flex: '0 0 26%', textAlign: 'right',
                                    fontFamily: 'var(--font-display)',
                                    fontSize: 'clamp(14px, 1.3vw, 24px)',
                                    fontWeight: 700, lineHeight: 1,
                                    letterSpacing: '-0.01em',
                                    fontVariantNumeric: 'tabular-nums',
                                    color: 'var(--c-green)',
                                }}>
                                    {r.up}
                                </div>
                            </div>
                        ))}

                        <div style={{
                            fontSize: 'clamp(10px, 0.76vw, 13px)',
                            color: 'var(--c-muted)',
                            lineHeight: 1.55,
                            marginTop: 'clamp(8px, 1vw, 16px)',
                            borderLeft: '2px solid var(--c-border)',
                            paddingLeft: 'clamp(8px, 0.9vw, 14px)',
                        }}>
                            Revenue is capacity-constrained in both cases. Programmes are recognised only up to the
                            delivery FTE remaining after pilots, deployments and support, so the hiring plan sets the
                            growth rate.
                        </div>
                    </div>
                </main>

                <footer style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'clamp(7px, 0.58vw, 10px)',
                    letterSpacing: '0.1em',
                    color: 'var(--c-dim)',
                    marginTop: 'clamp(6px, 0.8vw, 12px)',
                }}>
                    PRISM FINANCIAL MODEL, RESEARCH REFRESH 27 JUL 2026 &middot; CHECKS PASS &middot; € NOMINAL
                </footer>
            </div>
        </div>
    );
}
