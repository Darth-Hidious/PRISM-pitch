import VideoBackground from '../components/VideoBackground';
import AnimatedBimoLogo from '../components/AnimatedBimoLogo';

export default function OutroSlide() {
    return (
        <div className="relative w-full h-full video-dim">
            <VideoBackground src="https://stream.mux.com/00qQnfNo7sSpn3pB1hYKkyeSDvxs01NxiQ3sr29uL3e028.m3u8" />

            <div className="relative z-10 w-full h-full flex flex-col slide-pad">
                {/* Header */}
                <header className="flex items-center justify-between anim-in anim-d1">
                    <div className="flex items-center" style={{ gap: 'clamp(8px, 0.8vw, 14px)' }}>
                        <AnimatedBimoLogo style={{ height: 'clamp(18px, 1.8vw, 28px)', width: 'clamp(18px, 1.8vw, 28px)' }} />
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
                        PRISM
                    </span>
                </header>

                {/* Main */}
                <main className="flex-1 flex flex-col justify-center">
                    <h1 className="anim-in anim-d2" style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(32px, 4.5vw, 80px)',
                        fontWeight: 700,
                        letterSpacing: '-0.03em',
                        lineHeight: 1.05,
                        maxWidth: '70%',
                    }}>
                        The Operating System for Accelerated Innovation.
                    </h1>

                    <div className="anim-in anim-d3" style={{
                        width: 'clamp(40px, 4vw, 80px)',
                        height: '1px',
                        background: 'var(--c-gold)',
                        margin: 'clamp(24px, 3vw, 48px) 0',
                        opacity: 0.6,
                    }} />

                    {/* Contact grid */}
                    <div className="anim-in anim-d4 flex flex-col" style={{ gap: 'clamp(10px, 1vw, 16px)' }}>
                        {[
                            { icon: '\u2605', text: 'ESA SPARK Prime Contractor & ITER Supplier' },
                            { icon: '\u25CB', text: 'bimotech.pl' },
                            { icon: '\u25A0', text: 'Wroc\u0142aw Technology Park, Poland' },
                        ].map((item) => (
                            <div key={item.text} className="flex items-center" style={{ gap: 'clamp(10px, 1vw, 16px)' }}>
                                <span style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'clamp(10px, 0.85vw, 14px)',
                                    color: 'var(--c-gold)',
                                    width: 'clamp(14px, 1.2vw, 20px)',
                                    textAlign: 'center',
                                }}>
                                    {item.icon}
                                </span>
                                <span style={{
                                    fontSize: 'clamp(13px, 1.1vw, 20px)',
                                    color: 'var(--c-muted)',
                                }}>
                                    {item.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </main>

                {/* Footer — animated logo */}
                <footer className="anim-in anim-d5">
                    <AnimatedBimoLogo style={{ height: 'clamp(24px, 2.5vw, 40px)', width: 'auto' }} />
                </footer>
            </div>
        </div>
    );
}
