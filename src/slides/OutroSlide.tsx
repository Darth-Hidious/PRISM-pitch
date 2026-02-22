import VideoBackground from '../components/VideoBackground';
import AnimatedBimoLogo from '../components/AnimatedBimoLogo';

export default function OutroSlide() {
    return (
        <div className="relative w-full h-full video-dim">
            <VideoBackground src="https://stream.mux.com/00qQnfNo7sSpn3pB1hYKkyeSDvxs01NxiQ3sr29uL3e028.m3u8" />

            <div className="relative z-10 w-full h-full flex flex-col slide-pad">
                {/* Header — Bimo Tech logo (big) */}
                <header className="anim-in anim-d1">
                    <img
                        src="/bimo-logo.svg"
                        alt="Bimo Tech"
                        style={{
                            height: 'clamp(36px, 4vw, 72px)',
                            width: 'auto',
                        }}
                    />
                </header>

                {/* Main */}
                <main className="flex-1 flex flex-col justify-center">
                    <h1 className="anim-in anim-d2" style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(32px, 4.5vw, 80px)',
                        fontWeight: 700,
                        letterSpacing: '-0.03em',
                        lineHeight: 1.05,
                        maxWidth: '100%',
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
                            { icon: '\u2605', text: 'ESA SPARK Prime Contractor & ITER Supplier', href: null },
                            { icon: '\u25CB', text: 'bimotech.pl', href: 'https://bimotech.pl' },
                            { icon: '\u25A0', text: 'Wroc\u0142aw Technology Park, Poland', href: null },
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
                                {item.href ? (
                                    <a
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            fontSize: 'clamp(13px, 1.1vw, 20px)',
                                            color: 'var(--c-muted)',
                                            textDecoration: 'none',
                                            borderBottom: '1px solid transparent',
                                            transition: 'border-color 0.2s',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--c-gold)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                                    >
                                        {item.text}
                                    </a>
                                ) : (
                                    <span style={{
                                        fontSize: 'clamp(13px, 1.1vw, 20px)',
                                        color: 'var(--c-muted)',
                                    }}>
                                        {item.text}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </main>

                {/* Footer — marc27 animated logo, linked to research.marc27.com */}
                <footer className="anim-in anim-d5 flex items-center" style={{ gap: 'clamp(10px, 1vw, 16px)' }}>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(9px, 0.7vw, 11px)',
                        letterSpacing: '0.1em',
                        color: 'var(--c-dim)',
                    }}>
                        CONCEPT BY
                    </span>
                    <a href="https://research.marc27.com" target="_blank" rel="noopener noreferrer">
                        <AnimatedBimoLogo
                            style={{
                                height: 'clamp(48px, 5vw, 90px)',
                                width: 'auto',
                            }}
                        />
                    </a>
                </footer>
            </div>
        </div>
    );
}
