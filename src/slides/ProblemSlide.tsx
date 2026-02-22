import VideoBackground from '../components/VideoBackground';

export default function ProblemSlide() {
    return (
        <div className="relative w-full h-full video-dim">
            <VideoBackground src="https://stream.mux.com/Kec29dVyJgiPdtWaQtPuEiiGHkJIYQAVUJcNiIHUYeo.m3u8" />

            <div className="relative z-10 w-full h-full flex flex-col slide-pad">
                {/* Header */}
                <header className="flex items-center justify-between anim-in anim-d1" style={{ marginBottom: 'clamp(24px, 3vw, 48px)' }}>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(10px, 0.85vw, 13px)',
                        letterSpacing: '0.15em',
                        color: 'var(--c-gold)',
                    }}>
                        01 &mdash; THE PROBLEM
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

                {/* Main content */}
                <main className="flex-1 flex flex-col justify-center">
                    <h1
                        className="anim-in anim-d2"
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(32px, 4vw, 72px)',
                            fontWeight: 700,
                            letterSpacing: '-0.03em',
                            lineHeight: 1.05,
                            maxWidth: '75%',
                        }}
                    >
                        The materials innovation cycle is fundamentally broken.
                    </h1>

                    <p
                        className="anim-in anim-d3"
                        style={{
                            fontSize: 'clamp(13px, 1.1vw, 20px)',
                            color: 'var(--c-muted)',
                            lineHeight: 1.6,
                            maxWidth: '55%',
                            marginTop: 'clamp(16px, 2vw, 32px)',
                        }}
                    >
                        AI has identified over 2.2 million potential stable compositions, but only 736 have
                        been verified in physical labs. Experimental validation cannot keep pace with
                        computational prediction.
                    </p>

                    {/* Stats row */}
                    <div
                        className="flex items-start anim-in anim-d4"
                        style={{ gap: 'clamp(32px, 5vw, 80px)', marginTop: 'clamp(32px, 4vw, 64px)' }}
                    >
                        <div>
                            <div style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(40px, 5vw, 96px)',
                                fontWeight: 800,
                                lineHeight: 1,
                                letterSpacing: '-0.03em',
                                color: 'var(--c-gold)',
                            }}>
                                10-20
                            </div>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'clamp(10px, 0.8vw, 13px)',
                                color: 'var(--c-muted)',
                                marginTop: '8px',
                                letterSpacing: '0.05em',
                            }}>
                                YEARS TO MARKET
                            </div>
                        </div>

                        <div style={{ width: '1px', height: 'clamp(48px, 5vw, 80px)', background: 'var(--c-border)' }} />

                        <div>
                            <div style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(40px, 5vw, 96px)',
                                fontWeight: 800,
                                lineHeight: 1,
                                letterSpacing: '-0.03em',
                            }}>
                                2.2M
                            </div>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'clamp(10px, 0.8vw, 13px)',
                                color: 'var(--c-muted)',
                                marginTop: '8px',
                                letterSpacing: '0.05em',
                            }}>
                                PREDICTED &mdash; ONLY 736 VERIFIED
                            </div>
                        </div>

                        <div style={{ width: '1px', height: 'clamp(48px, 5vw, 80px)', background: 'var(--c-border)' }} />

                        <div>
                            <div style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(40px, 5vw, 96px)',
                                fontWeight: 800,
                                lineHeight: 1,
                                letterSpacing: '-0.03em',
                                color: 'var(--c-blue)',
                            }}>
                                $49B
                            </div>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'clamp(10px, 0.8vw, 13px)',
                                color: 'var(--c-muted)',
                                marginTop: '8px',
                                letterSpacing: '0.05em',
                            }}>
                                AEROSPACE MATERIALS TAM
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
