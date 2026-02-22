export default function MarketSlide() {
    return (
        <div className="relative w-full h-full" style={{ background: 'var(--c-bg)' }}>
            <div className="relative z-10 w-full h-full flex flex-col slide-pad">
                {/* Header */}
                <header className="flex items-center justify-between anim-in anim-d1" style={{ marginBottom: 'clamp(24px, 3vw, 48px)' }}>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(10px, 0.85vw, 13px)',
                        letterSpacing: '0.15em',
                        color: 'var(--c-gold)',
                    }}>
                        06 &mdash; MARKET &amp; BUSINESS
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

                <main className="flex-1 flex flex-col justify-center">
                    {/* Big number + context */}
                    <div className="flex items-end anim-in anim-d2" style={{ gap: 'clamp(16px, 2vw, 32px)', marginBottom: 'clamp(32px, 4vw, 64px)' }}>
                        <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(64px, 8vw, 160px)',
                            fontWeight: 800,
                            lineHeight: 0.85,
                            letterSpacing: '-0.04em',
                            color: 'var(--c-gold)',
                        }}>
                            $49B
                        </div>
                        <div style={{ paddingBottom: 'clamp(8px, 1vw, 16px)' }}>
                            <div style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(18px, 2vw, 36px)',
                                fontWeight: 600,
                                lineHeight: 1.2,
                            }}>
                                Total Addressable Market
                            </div>
                            <div style={{
                                fontSize: 'clamp(12px, 0.95vw, 16px)',
                                color: 'var(--c-muted)',
                                marginTop: '4px',
                            }}>
                                Aerospace extreme-environment materials
                            </div>
                        </div>
                    </div>

                    {/* Revenue streams */}
                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(9px, 0.7vw, 11px)',
                        letterSpacing: '0.2em',
                        color: 'var(--c-dim)',
                        marginBottom: 'clamp(12px, 1.5vw, 24px)',
                    }}>
                        FOUR COMPOUNDING REVENUE STREAMS
                    </div>

                    <div className="flex anim-in anim-d3" style={{ gap: 'clamp(12px, 1.5vw, 24px)' }}>
                        {[
                            { stream: 'R&D Contracts', desc: 'ESA, GSTP, Horizon Europe funding for technology maturation.', yr: 'Y1', amount: '\u20AC700K', color: 'var(--c-gold)' },
                            { stream: 'RHEA Components', desc: 'Prototype coupons and qualified production parts for OEMs.', yr: 'Y2', amount: '\u20AC40K', color: 'var(--c-blue)' },
                            { stream: 'AI Consulting / MaaS', desc: 'Discovery-as-a-Service for aerospace and energy OEMs.', yr: 'Y2', amount: '\u20AC50K', color: 'var(--c-green)' },
                            { stream: 'Platform Licensing', desc: 'Framework licenses and annual maintenance fees.', yr: 'Y5', amount: '\u20AC190K', color: '#EDEDEF' },
                        ].map((s) => (
                            <div key={s.stream} className="glass-card" style={{ flex: 1, padding: 'clamp(16px, 1.5vw, 28px)' }}>
                                <div style={{
                                    width: '24px',
                                    height: '2px',
                                    background: s.color,
                                    marginBottom: 'clamp(10px, 1vw, 16px)',
                                }} />
                                <div style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: 'clamp(14px, 1.2vw, 22px)',
                                    fontWeight: 600,
                                    marginBottom: '6px',
                                }}>
                                    {s.stream}
                                </div>
                                <div style={{
                                    fontSize: 'clamp(11px, 0.85vw, 14px)',
                                    color: 'var(--c-muted)',
                                    lineHeight: 1.5,
                                    marginBottom: 'clamp(12px, 1.2vw, 20px)',
                                }}>
                                    {s.desc}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <span style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 'clamp(9px, 0.7vw, 11px)',
                                        color: 'var(--c-dim)',
                                    }}>
                                        {s.yr}
                                    </span>
                                    <span style={{
                                        fontFamily: 'var(--font-display)',
                                        fontSize: 'clamp(16px, 1.5vw, 28px)',
                                        fontWeight: 700,
                                        color: s.color,
                                    }}>
                                        {s.amount}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Projection */}
                    <div className="anim-in anim-d4" style={{
                        marginTop: 'clamp(24px, 3vw, 48px)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'clamp(16px, 2vw, 32px)',
                    }}>
                        <div style={{ height: '1px', flex: 1, background: 'var(--c-border)' }} />
                        <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'clamp(10px, 0.85vw, 14px)',
                            color: 'var(--c-muted)',
                            whiteSpace: 'nowrap',
                        }}>
                            PATH TO <span style={{ color: 'var(--c-gold)', fontWeight: 700 }}>{'\u20AC'}7.2M</span> REVENUE BY YEAR 10 &middot; {'>'}92% GROSS MARGINS
                        </span>
                        <div style={{ height: '1px', flex: 1, background: 'var(--c-border)' }} />
                    </div>
                </main>
            </div>
        </div>
    );
}
