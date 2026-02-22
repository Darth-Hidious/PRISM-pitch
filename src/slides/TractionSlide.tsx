import VideoBackground from '../components/VideoBackground';

export default function TractionSlide() {
    return (
        <div className="relative w-full h-full video-dim">
            <VideoBackground src="https://stream.mux.com/fHfa8VIbBdqZelLGg5thjsypZ101M01dbyIMLNDWQwlLA.m3u8" />

            <div className="relative z-10 w-full h-full flex flex-col slide-pad">
                {/* Header */}
                <header className="flex items-center justify-between anim-in anim-d1" style={{ marginBottom: 'clamp(24px, 3vw, 48px)' }}>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(10px, 0.85vw, 13px)',
                        letterSpacing: '0.15em',
                        color: 'var(--c-gold)',
                    }}>
                        05 &mdash; TRACTION &amp; MOAT
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
                    <h1 className="anim-in anim-d2" style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(28px, 3.5vw, 64px)',
                        fontWeight: 700,
                        letterSpacing: '-0.03em',
                        lineHeight: 1.1,
                        marginBottom: 'clamp(24px, 3vw, 48px)',
                    }}>
                        Not a whitepaper.<br />
                        <span style={{ color: 'var(--c-gold)' }}>Contracted and delivering.</span>
                    </h1>

                    {/* Two columns */}
                    <div className="flex anim-in anim-d3 mobile-stack" style={{ gap: 'clamp(20px, 4vw, 64px)' }}>
                        {/* Traction items */}
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'clamp(9px, 0.7vw, 11px)',
                                letterSpacing: '0.2em',
                                color: 'var(--c-gold)',
                                marginBottom: 'clamp(12px, 1.5vw, 24px)',
                            }}>
                                VALIDATION
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 1.5vw, 24px)' }}>
                                {[
                                    { title: 'ESA SPARK Prime Contractor', sub: 'FIRST!/FLPP initiative. Full AI discovery loop for first campaigns.' },
                                    { title: 'ITER Supplier', sub: 'Titanium first-wall materials and rhodium targets for fusion.' },
                                    { title: 'ArianeGroup Interest', sub: 'Direct end-user buy-in to test for full-flow staged combustion engines.' },
                                ].map((item) => (
                                    <div key={item.title}>
                                        <div style={{
                                            fontFamily: 'var(--font-display)',
                                            fontSize: 'clamp(14px, 1.2vw, 22px)',
                                            fontWeight: 600,
                                            marginBottom: '4px',
                                        }}>
                                            {item.title}
                                        </div>
                                        <div style={{
                                            fontSize: 'clamp(11px, 0.85vw, 15px)',
                                            color: 'var(--c-muted)',
                                            lineHeight: 1.5,
                                        }}>
                                            {item.sub}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* IP + Partners */}
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'clamp(9px, 0.7vw, 11px)',
                                letterSpacing: '0.2em',
                                color: 'var(--c-blue)',
                                marginBottom: 'clamp(12px, 1.5vw, 24px)',
                            }}>
                                IP &amp; CONSORTIUM
                            </div>

                            <div style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(14px, 1.2vw, 22px)',
                                fontWeight: 600,
                                marginBottom: '4px',
                            }}>
                                Proprietary IP Portfolio
                            </div>
                            <div style={{
                                fontSize: 'clamp(11px, 0.85vw, 15px)',
                                color: 'var(--c-muted)',
                                lineHeight: 1.5,
                                marginBottom: 'clamp(20px, 2vw, 32px)',
                            }}>
                                GFlowNet sampling + CALPHAD thermodynamics as soft context. Enables discovery of metastable alloys. Patent filings in progress.
                            </div>

                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'clamp(9px, 0.7vw, 11px)',
                                letterSpacing: '0.2em',
                                color: 'var(--c-dim)',
                                marginBottom: 'clamp(10px, 1vw, 16px)',
                            }}>
                                PARTNERS
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(8px, 0.8vw, 14px)' }}>
                                {[
                                    { name: 'Bimo Tech', role: 'AI Lead' },
                                    { name: 'Fraunhofer IAPT', role: 'AM Calibration' },
                                    { name: 'ArianeGroup', role: 'Requirements + Testing' },
                                    { name: 'amsight', role: 'Data Structuring' },
                                ].map((p) => (
                                    <div key={p.name} className="glass-card" style={{
                                        padding: 'clamp(8px, 0.8vw, 14px) clamp(12px, 1.2vw, 20px)',
                                    }}>
                                        <div style={{
                                            fontSize: 'clamp(12px, 1vw, 16px)',
                                            fontWeight: 600,
                                        }}>
                                            {p.name}
                                        </div>
                                        <div style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: 'clamp(9px, 0.7vw, 11px)',
                                            color: 'var(--c-muted)',
                                            marginTop: '2px',
                                        }}>
                                            {p.role}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
