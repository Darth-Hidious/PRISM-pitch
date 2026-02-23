import VideoBackground from '../components/VideoBackground';
import AnimatedBimoLogo from '../components/AnimatedBimoLogo';

const FORMS_URL = 'https://forms.office.com/r/6jHPzeKYYT';

export default function OutroSlide() {
    return (
        <div className="relative w-full h-full video-dim">
            <VideoBackground src="https://stream.mux.com/00qQnfNo7sSpn3pB1hYKkyeSDvxs01NxiQ3sr29uL3e028.m3u8" />

            <div className="relative z-10 w-full h-full flex flex-col slide-pad">
                {/* Header — Bimo Tech logo + spin-off tag */}
                <header className="anim-in anim-d1 flex items-center" style={{ gap: 'clamp(12px, 1.5vw, 24px)' }}>
                    <img
                        src="/bimo-logo.svg"
                        alt="Bimo Tech"
                        style={{
                            height: 'clamp(36px, 4vw, 72px)',
                            width: 'auto',
                        }}
                    />
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(9px, 0.75vw, 12px)',
                        letterSpacing: '0.12em',
                        color: 'var(--c-dim)',
                        borderLeft: '1px solid rgba(255,255,255,0.15)',
                        paddingLeft: 'clamp(12px, 1.5vw, 24px)',
                        lineHeight: 1.4,
                    }}>
                        PRISM IS A SPIN-OFF<br />OF BIMO TECH
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
                        {/* ESA credential */}
                        <div className="flex items-center" style={{ gap: 'clamp(10px, 1vw, 16px)' }}>
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'clamp(10px, 0.85vw, 14px)',
                                color: 'var(--c-gold)',
                                width: 'clamp(14px, 1.2vw, 20px)',
                                textAlign: 'center',
                            }}>{'\u2605'}</span>
                            <span style={{ fontSize: 'clamp(13px, 1.1vw, 20px)', color: 'var(--c-muted)' }}>
                                ESA SPARK Prime Contractor & ITER Supplier
                            </span>
                        </div>

                        {/* Websites — side by side */}
                        <div className="flex items-center" style={{ gap: 'clamp(10px, 1vw, 16px)' }}>
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'clamp(10px, 0.85vw, 14px)',
                                color: 'var(--c-gold)',
                                width: 'clamp(14px, 1.2vw, 20px)',
                                textAlign: 'center',
                            }}>{'\u25CB'}</span>
                            <div className="flex items-center" style={{ gap: 'clamp(12px, 1.5vw, 24px)' }}>
                                <a
                                    href="https://bimotech.pl"
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
                                    bimotech.pl
                                </a>
                                <span style={{
                                    width: '1px',
                                    height: 'clamp(12px, 1vw, 18px)',
                                    background: 'rgba(255,255,255,0.15)',
                                }} />
                                <span className="flex items-center" style={{ gap: 'clamp(6px, 0.6vw, 10px)' }}>
                                    <a
                                        href="https://bimotech.marc27.com"
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
                                        bimotech.marc27.com
                                    </a>
                                    <span style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 'clamp(7px, 0.55vw, 9px)',
                                        letterSpacing: '0.1em',
                                        color: 'var(--c-gold)',
                                        border: '1px solid rgba(201,168,76,0.3)',
                                        borderRadius: '2px',
                                        padding: '1px 5px',
                                        lineHeight: 1.6,
                                    }}>
                                        NEW
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center" style={{ gap: 'clamp(10px, 1vw, 16px)' }}>
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'clamp(10px, 0.85vw, 14px)',
                                color: 'var(--c-gold)',
                                width: 'clamp(14px, 1.2vw, 20px)',
                                textAlign: 'center',
                            }}>{'\u25A0'}</span>
                            <span style={{ fontSize: 'clamp(13px, 1.1vw, 20px)', color: 'var(--c-muted)' }}>
                                Wroc{'\u0142'}aw Technology Park, Poland
                            </span>
                        </div>
                    </div>

                    {/* Register Interest CTA */}
                    <a
                        href={FORMS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="anim-in anim-d5"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'clamp(8px, 0.8vw, 14px)',
                            marginTop: 'clamp(20px, 2.5vw, 40px)',
                            padding: 'clamp(10px, 1vw, 16px) clamp(20px, 2vw, 32px)',
                            border: '1px solid var(--c-gold)',
                            borderRadius: '2px',
                            color: 'var(--c-gold)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'clamp(10px, 0.85vw, 14px)',
                            letterSpacing: '0.15em',
                            textDecoration: 'none',
                            background: 'rgba(201,168,76,0.06)',
                            transition: 'all 300ms',
                            width: 'fit-content',
                        }}
                    >
                        REGISTER INTEREST &nbsp;&rarr;
                    </a>
                </main>

                {/* Footer — marc27 animated logo, linked to research.marc27.com */}
                <footer className="anim-in anim-d5 flex items-center" style={{ gap: 'clamp(10px, 1vw, 16px)' }}>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(9px, 0.7vw, 11px)',
                        letterSpacing: '0.1em',
                        color: 'var(--c-dim)',
                    }}>
                        TECHNOLOGY CONCEPT BY
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
