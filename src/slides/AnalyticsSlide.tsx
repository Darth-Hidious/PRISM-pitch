import RobotArmSVG from '../components/RobotArmSVG';
import ShaderBackground from '../components/ShaderBackground';
import Logo from '../components/Logo';

export default function AnalyticsSlide() {
    return (
        <div className="relative w-full h-full overflow-hidden" style={{ background: '#000' }}>
            <ShaderBackground shader="heatDistortion" />

            <div className="relative z-10 flex flex-col h-full" style={{ padding: 'clamp(24px, 4%, 48px) clamp(32px, 5.2%, 80px) clamp(64px, 8.5%, 110px)' }}>
                {/* Header */}
                <div className="flex items-center justify-between" style={{ marginBottom: 'clamp(16px, 3%, 40px)' }}>
                    <Logo size="small" />
                    <span style={{ fontSize: 'clamp(12px, 1.05vw, 20px)', opacity: 0.8 }}>Pitch Deck</span>
                    <span style={{ fontSize: 'clamp(12px, 1.05vw, 20px)', opacity: 0.8 }}>Page 003</span>
                </div>

                <div className="flex flex-col flex-1 min-h-0">
                    <h2 style={{
                        fontSize: 'clamp(28px, 4vw, 64px)',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.05,
                        marginBottom: 'clamp(24px, 4vh, 64px)',
                    }}>
                        Architecture /<br />
                        Closed-Loop Framework
                    </h2>

                    {/* Dashboard Layout - CSS Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateRows: '1fr 1fr',
                        gap: 'clamp(16px, 2vw, 32px)',
                        flex: 1,
                        minHeight: 0
                    }}>
                        {/* Top Row */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 'clamp(16px, 2vw, 32px)',
                            minHeight: 0
                        }}>
                            {/* Synthesis */}
                            <div className="liquid-glass flex flex-col justify-between" style={{ padding: 'clamp(16px, 2vw, 32px)', minHeight: 0 }}>
                                <div>
                                    <h3 style={{ fontSize: 'clamp(16px, 1.25vw, 24px)', fontWeight: 600, color: 'var(--prism-cyan)', marginBottom: '8px' }}>
                                        Automated Synthesis
                                    </h3>
                                    <p style={{ fontSize: 'clamp(12px, 0.95vw, 18px)', opacity: 0.8, lineHeight: 1.4 }}>
                                        Microfluidic reactors and robotic dispensing for high-throughput material formulation.
                                    </p>
                                </div>
                                <div style={{ marginTop: '16px', fontSize: 'clamp(24px, 2.5vw, 40px)', fontWeight: 700, opacity: 0.3 }}>
                                    [ Syn ]
                                </div>
                            </div>

                            {/* Characterization */}
                            <div className="liquid-glass flex flex-col justify-between" style={{ padding: 'clamp(16px, 2vw, 32px)', minHeight: 0 }}>
                                <div>
                                    <h3 style={{ fontSize: 'clamp(16px, 1.25vw, 24px)', fontWeight: 600, color: 'var(--prism-gold)', marginBottom: '8px' }}>
                                        Autonomous Characterization
                                    </h3>
                                    <p style={{ fontSize: 'clamp(12px, 0.95vw, 18px)', opacity: 0.8, lineHeight: 1.4 }}>
                                        In-situ spectroscopy and computer vision for real-time property analysis.
                                    </p>
                                </div>
                                <div style={{ marginTop: '16px', fontSize: 'clamp(24px, 2.5vw, 40px)', fontWeight: 700, opacity: 0.3 }}>
                                    [ Char ]
                                </div>
                            </div>

                            {/* RL Agent */}
                            <div className="liquid-glass flex flex-col justify-between" style={{ padding: 'clamp(16px, 2vw, 32px)', minHeight: 0 }}>
                                <div>
                                    <h3 style={{ fontSize: 'clamp(16px, 1.25vw, 24px)', fontWeight: 600, color: '#ff6262', marginBottom: '8px' }}>
                                        Active Learning ML
                                    </h3>
                                    <p style={{ fontSize: 'clamp(12px, 0.95vw, 18px)', opacity: 0.8, lineHeight: 1.4 }}>
                                        Bayesian optimization loops directing the robotic arm toward optimal candidate parameters.
                                    </p>
                                </div>
                                <div style={{ marginTop: '16px', fontSize: 'clamp(24px, 2.5vw, 40px)', fontWeight: 700, opacity: 0.3 }}>
                                    [ AL ]
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 'clamp(16px, 2vw, 32px)',
                            minHeight: 0
                        }}>
                            {/* Throughput Graph placeholder */}
                            <div className="liquid-glass" style={{ padding: 'clamp(16px, 2vw, 32px)', minHeight: 0, position: 'relative' }}>
                                <h3 style={{ fontSize: 'clamp(14px, 1.1vw, 20px)', fontWeight: 600, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Throughput Multiplier
                                </h3>
                                {/* Graph lines mock */}
                                <div className="absolute inset-0 mx-8 my-16 opacity-30 flex items-end fill-current text-white overflow-hidden">
                                    <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full">
                                        <path d="M0,45 Q20,40 30,35 T50,25 T70,10 T100,5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M0,48 L100,48" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
                                    </svg>
                                </div>
                                <div style={{ position: 'absolute', bottom: 'clamp(16px, 2vw, 32px)', left: 'clamp(16px, 2vw, 32px)' }}>
                                    <span style={{ fontSize: 'clamp(32px, 3.5vw, 64px)', fontWeight: 700, color: 'var(--prism-cyan)' }}>100x</span>
                                    <span style={{ fontSize: 'clamp(12px, 1vw, 18px)', opacity: 0.8, marginLeft: '8px' }}>vs Manual Iteration</span>
                                </div>
                            </div>

                            {/* Cost Graph placeholder */}
                            <div className="liquid-glass" style={{ padding: 'clamp(16px, 2vw, 32px)', minHeight: 0, position: 'relative' }}>
                                <h3 style={{ fontSize: 'clamp(14px, 1.1vw, 20px)', fontWeight: 600, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Cost Reduction per Compound
                                </h3>
                                {/* Graph lines mock */}
                                <div className="absolute inset-0 mx-8 my-16 opacity-30 flex items-start fill-current text-white overflow-hidden">
                                    <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full">
                                        <path d="M0,10 L30,15 L50,30 L70,40 L100,45" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M0,48 L100,48" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
                                    </svg>
                                </div>
                                <div style={{ position: 'absolute', bottom: 'clamp(16px, 2vw, 32px)', left: 'clamp(16px, 2vw, 32px)' }}>
                                    <span style={{ fontSize: 'clamp(32px, 3.5vw, 64px)', fontWeight: 700, color: 'var(--prism-gold)' }}>90%</span>
                                    <span style={{ fontSize: 'clamp(12px, 1vw, 18px)', opacity: 0.8, marginLeft: '8px' }}>Efficiency Gain</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Robotic Arm Animation */}
                <div style={{
                    position: 'absolute',
                    bottom: '-2vw',
                    right: '-2vw',
                    width: 'clamp(300px, 45vw, 800px)',
                    pointerEvents: 'none',
                    opacity: 0.5,
                    zIndex: 20
                }}>
                    <RobotArmSVG />
                </div>
            </div>
        </div>
    );
}
