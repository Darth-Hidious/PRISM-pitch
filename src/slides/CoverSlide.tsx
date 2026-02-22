import VideoBackground from '../components/VideoBackground';
import AnimatedBimoLogo from '../components/AnimatedBimoLogo';

export default function CoverSlide() {
    return (
        <div className="relative w-full h-full video-dim">
            <VideoBackground src="https://stream.mux.com/JNJEOYI6B3EffB9f5ZhpGbuxzc6gSyJcXaCBbCgZKRg.m3u8" />

            <div className="relative z-10 w-full h-full flex flex-col justify-between slide-pad">
                {/* Top bar */}
                <header className="flex items-center justify-between anim-in anim-d1">
                    <div className="flex items-center" style={{ gap: 'clamp(8px, 0.8vw, 14px)' }}>
                        <AnimatedBimoLogo style={{ height: 'clamp(22px, 2.2vw, 36px)', width: 'clamp(22px, 2.2vw, 36px)' }} />
                        <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'clamp(10px, 0.85vw, 13px)',
                            letterSpacing: '0.15em',
                            color: 'var(--c-muted)',
                        }}>
                            BIMO TECH
                        </span>
                    </div>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(10px, 0.85vw, 13px)',
                        letterSpacing: '0.1em',
                        color: 'var(--c-dim)',
                    }}>
                        SEED ROUND 2026
                    </span>
                </header>

                {/* Center */}
                <main className="flex flex-col items-center justify-center" style={{ flex: 1 }}>
                    <h1
                        className="anim-in anim-d2"
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(72px, 8vw, 180px)',
                            fontWeight: 800,
                            letterSpacing: '-0.04em',
                            lineHeight: 0.9,
                            background: 'linear-gradient(135deg, #EDEDEF 0%, #C9A84C 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        PRISM
                    </h1>

                    <div
                        className="anim-in anim-d3"
                        style={{
                            width: 'clamp(40px, 4vw, 80px)',
                            height: '1px',
                            background: 'var(--c-gold)',
                            margin: 'clamp(16px, 2vw, 32px) 0',
                            opacity: 0.6,
                        }}
                    />

                    <p
                        className="anim-in anim-d4 text-center"
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'clamp(14px, 1.4vw, 28px)',
                            color: 'var(--c-muted)',
                            maxWidth: '600px',
                            lineHeight: 1.4,
                            fontWeight: 400,
                        }}
                    >
                        Platform for Research in Intelligent Synthesis of Materials
                    </p>

                    <p
                        className="anim-in anim-d5"
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'clamp(10px, 0.85vw, 14px)',
                            color: 'var(--c-gold)',
                            marginTop: 'clamp(16px, 2vw, 32px)',
                            letterSpacing: '0.2em',
                        }}
                    >
                        AI-NATIVE AUTONOMOUS MATERIALS DISCOVERY
                    </p>
                </main>

                {/* Bottom hint */}
                <footer className="anim-in anim-d6 text-center" style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'clamp(9px, 0.7vw, 11px)',
                    color: 'var(--c-dim)',
                    letterSpacing: '0.1em',
                }}>
                    ESA SPARK PRIME CONTRACTOR &middot; ITER SUPPLIER
                </footer>
            </div>
        </div>
    );
}
