import VideoBackground from '../components/VideoBackground';

export default function SolutionSlide() {
    return (
        <div className="relative w-full h-full video-dim">
            <VideoBackground src="https://stream.mux.com/4IMYGcL01xjs7ek5ANO17JC4VQVUTsojZlnw4fXzwSxc.m3u8" />

            <div className="relative z-10 w-full h-full flex flex-col slide-pad">
                {/* Header */}
                <header className="flex items-center justify-between anim-in anim-d1" style={{ marginBottom: 'clamp(24px, 3vw, 48px)' }}>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(10px, 0.85vw, 13px)',
                        letterSpacing: '0.15em',
                        color: 'var(--c-gold)',
                    }}>
                        02 &mdash; THE SOLUTION
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

                {/* Main */}
                <main className="flex-1 flex flex-col justify-center">
                    <h1
                        className="anim-in anim-d2"
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(32px, 4vw, 72px)',
                            fontWeight: 700,
                            letterSpacing: '-0.03em',
                            lineHeight: 1.05,
                        }}
                    >
                        Replace trial-and-error<br />
                        with a deterministic,<br />
                        <span style={{ color: 'var(--c-gold)' }}>self-optimizing loop.</span>
                    </h1>

                    <p
                        className="anim-in anim-d3"
                        style={{
                            fontSize: 'clamp(13px, 1.1vw, 20px)',
                            color: 'var(--c-muted)',
                            lineHeight: 1.6,
                            maxWidth: '100%',
                            marginTop: 'clamp(20px, 2.5vw, 40px)',
                        }}
                    >
                        PRISM evaluates millions of compositions in minutes computationally, shifting
                        failure from the physical lab to the digital domain. De-risking the discovery
                        of Refractory High-Entropy Alloys for liquid rocket engine preburners.
                    </p>

                    {/* Key points */}
                    <div
                        className="flex anim-in anim-d4 mobile-stack"
                        style={{ gap: 'clamp(12px, 2vw, 32px)', marginTop: 'clamp(20px, 4vw, 64px)', flexWrap: 'wrap' }}
                    >
                        {[
                            { label: 'Target', value: 'RHEAs for\npreburners', color: 'var(--c-gold)' },
                            { label: 'Replaces', value: 'Monel K500\nlegacy alloys', color: 'var(--c-blue)' },
                            { label: 'Method', value: 'Dual-loop:\ncompute + physical', color: 'var(--c-green)' },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="glass-card"
                                style={{ padding: 'clamp(16px, 1.5vw, 28px)', flex: '1 1 0', maxWidth: '240px' }}
                            >
                                <div style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'clamp(9px, 0.7vw, 11px)',
                                    letterSpacing: '0.15em',
                                    color: item.color,
                                    marginBottom: '8px',
                                }}>
                                    {item.label.toUpperCase()}
                                </div>
                                <div style={{
                                    fontSize: 'clamp(13px, 1.05vw, 18px)',
                                    lineHeight: 1.4,
                                    whiteSpace: 'pre-line',
                                }}>
                                    {item.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
