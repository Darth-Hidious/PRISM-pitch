import VideoBackground from '../components/VideoBackground';

const allocations = [
    { label: 'AI Team Scale-Up', pct: 40, color: 'var(--c-gold)', desc: 'ML engineers + materials scientists' },
    { label: 'Autonomous A-Lab', pct: 30, color: 'var(--c-blue)', desc: 'Robotic synthesis & characterization hardware' },
    { label: 'Compute Infrastructure', pct: 15, color: 'var(--c-green)', desc: 'Dedicated GPU cluster for training' },
    { label: 'IP & Market Dev', pct: 15, color: '#9CA3AF', desc: 'Patents, BD, conference presence' },
];

const phases = [
    { id: 'I', months: '6 mo', title: 'Computational Validation', desc: 'Full AI discovery loop running first SPARK campaigns.' },
    { id: 'II', months: '12 mo', title: 'Hybrid Loop', desc: 'Integration with Fraunhofer IAPT additive manufacturing data.' },
    { id: 'III', months: '24 mo', title: 'Full A-Lab Integration', desc: 'Direct instrument control adapters for completely closed-loop.' },
];

export default function AskSlide() {
    return (
        <div className="relative w-full h-full video-dim">
            <VideoBackground src="https://stream.mux.com/00qQnfNo7sSpn3pB1hYKkyeSDvxs01NxiQ3sr29uL3e028.m3u8" />

            <div className="relative z-10 w-full h-full flex flex-col slide-pad">
                {/* Header */}
                <header className="flex items-center justify-between anim-in anim-d1" style={{ marginBottom: 'clamp(24px, 3vw, 48px)' }}>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(10px, 0.85vw, 13px)',
                        letterSpacing: '0.15em',
                        color: 'var(--c-gold)',
                    }}>
                        08 &mdash; THE ASK
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
                    {/* Big number */}
                    <div className="anim-in anim-d2" style={{ marginBottom: 'clamp(32px, 4vw, 64px)' }}>
                        <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(64px, 8vw, 160px)',
                            fontWeight: 800,
                            lineHeight: 0.85,
                            letterSpacing: '-0.04em',
                        }}>
                            {'\u20AC'}5M
                        </div>
                        <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(18px, 2vw, 36px)',
                            fontWeight: 600,
                            color: 'var(--c-gold)',
                            marginTop: 'clamp(8px, 1vw, 16px)',
                        }}>
                            Seed Round
                        </div>
                    </div>

                    {/* Two columns: allocation + roadmap */}
                    <div className="flex anim-in anim-d3 mobile-stack" style={{ gap: 'clamp(20px, 4vw, 64px)' }}>
                        {/* Allocation */}
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'clamp(9px, 0.7vw, 11px)',
                                letterSpacing: '0.2em',
                                color: 'var(--c-dim)',
                                marginBottom: 'clamp(12px, 1.5vw, 24px)',
                            }}>
                                ALLOCATION
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1vw, 16px)' }}>
                                {allocations.map((a) => (
                                    <div key={a.label}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontSize: 'clamp(12px, 1vw, 16px)', fontWeight: 500 }}>
                                                {a.label}
                                            </span>
                                            <span style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: 'clamp(12px, 1vw, 16px)',
                                                fontWeight: 700,
                                                color: a.color,
                                            }}>
                                                {a.pct}%
                                            </span>
                                        </div>
                                        {/* Bar */}
                                        <div style={{
                                            width: '100%',
                                            height: '4px',
                                            background: 'var(--c-surface)',
                                            borderRadius: '2px',
                                            overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                width: `${a.pct}%`,
                                                height: '100%',
                                                background: a.color,
                                                borderRadius: '2px',
                                            }} />
                                        </div>
                                        <div style={{
                                            fontSize: 'clamp(10px, 0.75vw, 12px)',
                                            color: 'var(--c-muted)',
                                            marginTop: '2px',
                                        }}>
                                            {a.desc}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Roadmap */}
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'clamp(9px, 0.7vw, 11px)',
                                letterSpacing: '0.2em',
                                color: 'var(--c-dim)',
                                marginBottom: 'clamp(12px, 1.5vw, 24px)',
                            }}>
                                ROADMAP TO AUTONOMY
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 1.5vw, 24px)' }}>
                                {phases.map((p) => (
                                    <div key={p.id} style={{ display: 'flex', gap: 'clamp(12px, 1.2vw, 20px)', alignItems: 'flex-start' }}>
                                        <div style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: 'clamp(18px, 1.8vw, 32px)',
                                            fontWeight: 700,
                                            color: 'var(--c-gold)',
                                            lineHeight: 1,
                                            minWidth: 'clamp(24px, 2.5vw, 40px)',
                                        }}>
                                            {p.id}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                                <span style={{
                                                    fontFamily: 'var(--font-display)',
                                                    fontSize: 'clamp(14px, 1.2vw, 22px)',
                                                    fontWeight: 600,
                                                }}>
                                                    {p.title}
                                                </span>
                                                <span style={{
                                                    fontFamily: 'var(--font-mono)',
                                                    fontSize: 'clamp(9px, 0.7vw, 11px)',
                                                    color: 'var(--c-dim)',
                                                }}>
                                                    {p.months}
                                                </span>
                                            </div>
                                            <div style={{
                                                fontSize: 'clamp(11px, 0.85vw, 14px)',
                                                color: 'var(--c-muted)',
                                                lineHeight: 1.5,
                                                marginTop: '2px',
                                            }}>
                                                {p.desc}
                                            </div>
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
