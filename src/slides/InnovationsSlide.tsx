import ShaderBackground from '../components/ShaderBackground';
import Logo from '../components/Logo';

export default function InnovationsSlide() {
    return (
        <div className="relative w-full h-full overflow-hidden" style={{ background: '#000' }}>
            <ShaderBackground shader="orbitalRings" />

            <div className="relative z-10 flex flex-col h-full" style={{ padding: 'clamp(24px, 4%, 48px) clamp(32px, 5.2%, 80px) clamp(64px, 8.5%, 110px)' }}>
                {/* Header */}
                <div className="flex items-center justify-between" style={{ marginBottom: 'clamp(16px, 3%, 40px)' }}>
                    <Logo size="small" />
                    <span style={{ fontSize: 'clamp(12px, 1.05vw, 20px)', opacity: 0.8 }}>Pitch Deck</span>
                    <span style={{ fontSize: 'clamp(12px, 1.05vw, 20px)', opacity: 0.8 }}>Page 004</span>
                </div>

                <div className="flex flex-col flex-1 min-h-0">
                    <h2 style={{
                        fontSize: 'clamp(28px, 4vw, 64px)',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.05,
                        marginBottom: 'clamp(24px, 4vh, 64px)',
                    }}>
                        Key Innovations
                    </h2>

                    {/* 2x2 Grid Layout */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gridTemplateRows: '1fr 1fr',
                        gap: 'clamp(16px, 2.5vw, 40px)',
                        flex: 1,
                        minHeight: 0
                    }}>
                        {/* Innovation 1: Neural Fingerprinting */}
                        <div className="liquid-glass flex flex-col justify-center" style={{ padding: 'clamp(20px, 3vw, 48px)' }}>
                            <div className="flex items-center mb-4">
                                <div style={{
                                    width: 'clamp(40px, 4vw, 64px)',
                                    height: 'clamp(40px, 4vw, 64px)',
                                    borderRadius: '50%',
                                    background: 'rgba(0, 240, 255, 0.1)',
                                    border: '1px solid rgba(0, 240, 255, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '16px'
                                }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--prism-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '50%', height: '50%' }}>
                                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: 'clamp(18px, 1.5vw, 28px)', fontWeight: 600 }}>Neural Fingerprinting</h3>
                            </div>
                            <p style={{ fontSize: 'clamp(13px, 1.1vw, 20px)', opacity: 0.8, lineHeight: 1.5 }}>
                                Beyond standard GNNs, PRISM utilizes dynamic graph fingerprinting to predict not
                                just ground-state properties, but synthetic viability and defect formation energies.
                            </p>
                        </div>

                        {/* Innovation 2: Quantum-Classical Hybrid */}
                        <div className="liquid-glass flex flex-col justify-center" style={{ padding: 'clamp(20px, 3vw, 48px)' }}>
                            <div className="flex items-center mb-4">
                                <div style={{
                                    width: 'clamp(40px, 4vw, 64px)',
                                    height: 'clamp(40px, 4vw, 64px)',
                                    borderRadius: '50%',
                                    background: 'rgba(180, 140, 255, 0.1)',
                                    border: '1px solid rgba(180, 140, 255, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '16px'
                                }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#b48cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '50%', height: '50%' }}>
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                        <path d="M2 12h20" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: 'clamp(18px, 1.5vw, 28px)', fontWeight: 600 }}>Quantum-Classical Surrogate</h3>
                            </div>
                            <p style={{ fontSize: 'clamp(13px, 1.1vw, 20px)', opacity: 0.8, lineHeight: 1.5 }}>
                                Integrating tensor-network surrogates to bypass full DFT calculations, enabling
                                millions of property evaluations per second on classical hardware.
                            </p>
                        </div>

                        {/* Innovation 3: Active Synthesis Agent */}
                        <div className="liquid-glass flex flex-col justify-center" style={{ padding: 'clamp(20px, 3vw, 48px)' }}>
                            <div className="flex items-center mb-4">
                                <div style={{
                                    width: 'clamp(40px, 4vw, 64px)',
                                    height: 'clamp(40px, 4vw, 64px)',
                                    borderRadius: '50%',
                                    background: 'rgba(255, 180, 0, 0.1)',
                                    border: '1px solid rgba(255, 180, 0, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '16px'
                                }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--prism-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '50%', height: '50%' }}>
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <path d="M14 2v6h6" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                        <polyline points="10 9 9 9 8 9" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: 'clamp(18px, 1.5vw, 28px)', fontWeight: 600 }}>Active Synthesis Agent</h3>
                            </div>
                            <p style={{ fontSize: 'clamp(13px, 1.1vw, 20px)', opacity: 0.8, lineHeight: 1.5 }}>
                                The RL agent doesn't just predict materials; it predicts the optimal sequential
                                precursor additions to synthesize them, learning from every failed extraction.
                            </p>
                        </div>

                        {/* Innovation 4: Unified Semantic Space */}
                        <div className="liquid-glass flex flex-col justify-center" style={{ padding: 'clamp(20px, 3vw, 48px)' }}>
                            <div className="flex items-center mb-4">
                                <div style={{
                                    width: 'clamp(40px, 4vw, 64px)',
                                    height: 'clamp(40px, 4vw, 64px)',
                                    borderRadius: '50%',
                                    background: 'rgba(255, 98, 98, 0.1)',
                                    border: '1px solid rgba(255, 98, 98, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '16px'
                                }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#ff6262" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '50%', height: '50%' }}>
                                        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                                        <line x1="12" y1="22" x2="12" y2="15.5" />
                                        <polyline points="22 8.5 12 15.5 2 8.5" />
                                        <polyline points="2 15.5 12 8.5 22 15.5" />
                                        <line x1="12" y1="2" x2="12" y2="8.5" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: 'clamp(18px, 1.5vw, 28px)', fontWeight: 600 }}>Unified Semantic Space</h3>
                            </div>
                            <p style={{ fontSize: 'clamp(13px, 1.1vw, 20px)', opacity: 0.8, lineHeight: 1.5 }}>
                                Mapping structural, electronic, and synthetic parameter data into a single manifold,
                                allowing PRISM to interpolate entirely novel classes of metamaterials.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
