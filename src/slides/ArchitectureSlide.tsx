export default function ArchitectureSlide() {
    return (
        <div className="relative w-full h-full" style={{ background: 'var(--c-bg)' }}>
            <div className="relative z-10 w-full h-full flex flex-col slide-pad">
                {/* Header */}
                <header className="flex items-center justify-between anim-in anim-d1" style={{ marginBottom: 'clamp(16px, 2vw, 32px)' }}>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(10px, 0.85vw, 13px)',
                        letterSpacing: '0.15em',
                        color: 'var(--c-gold)',
                    }}>
                        03 &mdash; ARCHITECTURE
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

                {/* Title */}
                <h1
                    className="anim-in anim-d2"
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(24px, 3vw, 56px)',
                        fontWeight: 700,
                        letterSpacing: '-0.03em',
                        lineHeight: 1.1,
                        marginBottom: 'clamp(8px, 1vw, 16px)',
                    }}
                >
                    Four Integrated Modules
                </h1>
                <p className="anim-in anim-d3" style={{
                    fontSize: 'clamp(12px, 0.95vw, 16px)',
                    color: 'var(--c-muted)',
                    marginBottom: 'clamp(16px, 2vw, 32px)',
                }}>
                    Dual-loop workflow: computational inner loop for rapid optimization, physical outer loop for validation.
                </p>

                {/* Content: SVG + descriptions */}
                <div className="flex-1 flex items-center anim-in anim-d4 mobile-stack" style={{ gap: 'clamp(16px, 3vw, 48px)', minHeight: 0 }}>
                    {/* SVG Loop */}
                    <div className="mobile-svg" style={{ flex: '0 0 45%', maxHeight: '100%' }}>
                        <svg viewBox="0 0 400 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <g fontFamily="monospace" textAnchor="middle" fill="#EDEDEF">
                                <text x="200" y="115" fontSize="12" opacity="0.5" letterSpacing="2">AI_PIPELINE</text>
                                <text x="200" y="130" fontSize="9" opacity="0.3" letterSpacing="1">V_1.0.4 // ACTIVE</text>
                            </g>
                            <circle cx="80" cy="60" r="30" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3">
                                <animate attributeName="r" values="28; 34; 28" dur="4s" begin="0s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.4; 0.1; 0.4" dur="4s" begin="0s" repeatCount="indefinite" />
                            </circle>
                            <circle cx="320" cy="60" r="30" fill="none" stroke="#9CA3AF" strokeWidth="0.5" opacity="0.3">
                                <animate attributeName="r" values="28; 34; 28" dur="4s" begin="1s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.4; 0.1; 0.4" dur="4s" begin="1s" repeatCount="indefinite" />
                            </circle>
                            <circle cx="320" cy="180" r="30" fill="none" stroke="#4A8FD4" strokeWidth="0.5" opacity="0.3">
                                <animate attributeName="r" values="28; 34; 28" dur="4s" begin="2s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.4; 0.1; 0.4" dur="4s" begin="2s" repeatCount="indefinite" />
                            </circle>
                            <circle cx="80" cy="180" r="30" fill="none" stroke="#34D399" strokeWidth="0.5" opacity="0.3">
                                <animate attributeName="r" values="28; 34; 28" dur="4s" begin="3s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.4; 0.1; 0.4" dur="4s" begin="3s" repeatCount="indefinite" />
                            </circle>
                            <g stroke="#EDEDEF" strokeWidth="1.5" opacity="0.25" fill="none" strokeDasharray="6 6">
                                <line x1="110" y1="60" x2="290" y2="60"><animate attributeName="stroke-dashoffset" from="0" to="12" dur="1s" repeatCount="indefinite" /></line>
                                <line x1="320" y1="90" x2="320" y2="150"><animate attributeName="stroke-dashoffset" from="0" to="12" dur="1s" repeatCount="indefinite" /></line>
                                <line x1="290" y1="180" x2="110" y2="180"><animate attributeName="stroke-dashoffset" from="0" to="12" dur="1s" repeatCount="indefinite" /></line>
                                <line x1="80" y1="150" x2="80" y2="90"><animate attributeName="stroke-dashoffset" from="0" to="12" dur="1s" repeatCount="indefinite" /></line>
                            </g>
                            {/* Animated particles flowing clockwise around all edges */}
                            <g>
                                {/* Top: Evolver → KG */}
                                <circle r="1.5" fill="#C9A84C"><animate attributeName="cx" values="110; 290" dur="2.2s" begin="0s" repeatCount="indefinite"/><animate attributeName="cy" values="60; 57; 60" dur="2.2s" begin="0s" repeatCount="indefinite"/><animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.1; 0.9; 1" dur="2.2s" begin="0s" repeatCount="indefinite"/></circle>
                                <circle r="1.5" fill="#9CA3AF"><animate attributeName="cx" values="110; 290" dur="1.9s" begin="0.7s" repeatCount="indefinite"/><animate attributeName="cy" values="60; 63; 60" dur="1.9s" begin="0.7s" repeatCount="indefinite"/><animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.1; 0.9; 1" dur="1.9s" begin="0.7s" repeatCount="indefinite"/></circle>
                                <circle r="1.5" fill="#EDEDEF"><animate attributeName="cx" values="110; 290" dur="2.5s" begin="1.4s" repeatCount="indefinite"/><animate attributeName="cy" values="60; 58; 60" dur="2.5s" begin="1.4s" repeatCount="indefinite"/><animate attributeName="opacity" values="0; 0.8; 0.8; 0" keyTimes="0; 0.1; 0.9; 1" dur="2.5s" begin="1.4s" repeatCount="indefinite"/></circle>
                                {/* Right: KG → Evaluator */}
                                <circle r="1.5" fill="#9CA3AF"><animate attributeName="cy" values="90; 150" dur="2.0s" begin="0.2s" repeatCount="indefinite"/><animate attributeName="cx" values="320; 323; 320" dur="2.0s" begin="0.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.1; 0.9; 1" dur="2.0s" begin="0.2s" repeatCount="indefinite"/></circle>
                                <circle r="1.5" fill="#4A8FD4"><animate attributeName="cy" values="90; 150" dur="2.3s" begin="0.9s" repeatCount="indefinite"/><animate attributeName="cx" values="320; 317; 320" dur="2.3s" begin="0.9s" repeatCount="indefinite"/><animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.1; 0.9; 1" dur="2.3s" begin="0.9s" repeatCount="indefinite"/></circle>
                                <circle r="1.5" fill="#EDEDEF"><animate attributeName="cy" values="90; 150" dur="1.8s" begin="1.5s" repeatCount="indefinite"/><animate attributeName="cx" values="320; 322; 320" dur="1.8s" begin="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0; 0.8; 0.8; 0" keyTimes="0; 0.1; 0.9; 1" dur="1.8s" begin="1.5s" repeatCount="indefinite"/></circle>
                                {/* Bottom: Evaluator → Mutator (reversed) */}
                                <circle r="1.5" fill="#4A8FD4"><animate attributeName="cx" values="290; 110" dur="2.0s" begin="0s" repeatCount="indefinite"/><animate attributeName="cy" values="180; 177; 180" dur="2.0s" begin="0s" repeatCount="indefinite"/><animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.1; 0.9; 1" dur="2.0s" begin="0s" repeatCount="indefinite"/></circle>
                                <circle r="1.5" fill="#34D399"><animate attributeName="cx" values="290; 110" dur="2.2s" begin="0.5s" repeatCount="indefinite"/><animate attributeName="cy" values="180; 183; 180" dur="2.2s" begin="0.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.1; 0.9; 1" dur="2.2s" begin="0.5s" repeatCount="indefinite"/></circle>
                                <circle r="1.5" fill="#C9A84C"><animate attributeName="cx" values="290; 110" dur="1.8s" begin="1.1s" repeatCount="indefinite"/><animate attributeName="cy" values="180; 178; 180" dur="1.8s" begin="1.1s" repeatCount="indefinite"/><animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.1; 0.9; 1" dur="1.8s" begin="1.1s" repeatCount="indefinite"/></circle>
                                {/* Left: Mutator → Evolver */}
                                <circle r="1.5" fill="#34D399"><animate attributeName="cy" values="150; 90" dur="2.1s" begin="0.3s" repeatCount="indefinite"/><animate attributeName="cx" values="80; 77; 80" dur="2.1s" begin="0.3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.1; 0.9; 1" dur="2.1s" begin="0.3s" repeatCount="indefinite"/></circle>
                                <circle r="1.5" fill="#C9A84C"><animate attributeName="cy" values="150; 90" dur="1.9s" begin="1.0s" repeatCount="indefinite"/><animate attributeName="cx" values="80; 83; 80" dur="1.9s" begin="1.0s" repeatCount="indefinite"/><animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.1; 0.9; 1" dur="1.9s" begin="1.0s" repeatCount="indefinite"/></circle>
                                <circle r="1.5" fill="#EDEDEF"><animate attributeName="cy" values="150; 90" dur="2.4s" begin="1.6s" repeatCount="indefinite"/><animate attributeName="cx" values="80; 78; 80" dur="2.4s" begin="1.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="0; 0.8; 0.8; 0" keyTimes="0; 0.1; 0.9; 1" dur="2.4s" begin="1.6s" repeatCount="indefinite"/></circle>
                            </g>
                            <circle cx="80" cy="60" r="26" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeDasharray="2 2" />
                            <g transform="translate(80, 60)">
                                <path d="M -1,-10 C -9,-12 -15,-6 -13,0 C -17,2 -17,8 -13,10 C -13,14 -7,16 -3,12 C -1,14 3,14 5,12 C 9,16 15,14 15,10 C 19,8 19,2 15,0 C 17,-6 11,-12 3,-10 C 1,-11 0,-11 -1,-10 Z" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinejoin="round"/>
                                <path d="M 1,-8 L 1,12 M -5,-4 C -5,-4 -3,0 -5,4 M 7,-4 C 7,-4 5,0 7,4" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
                            </g>
                            <circle cx="320" cy="60" r="26" fill="none" stroke="#9CA3AF" strokeWidth="1.5" />
                            <path d="M 310 50 L 324 46 L 332 56 L 322 68 L 308 64 Z" fill="none" stroke="#9CA3AF" strokeWidth="1" opacity="0.8"/>
                            <path d="M 318 58 L 310 50 M 318 58 L 332 56 M 318 58 L 322 68" fill="none" stroke="#9CA3AF" strokeWidth="1" opacity="0.8"/>
                            <circle cx="310" cy="50" r="2" fill="#9CA3AF" /><circle cx="324" cy="46" r="2" fill="#9CA3AF" /><circle cx="332" cy="56" r="2" fill="#9CA3AF" /><circle cx="322" cy="68" r="2" fill="#9CA3AF" /><circle cx="308" cy="64" r="2" fill="#9CA3AF" /><circle cx="318" cy="58" r="2" fill="#9CA3AF" />
                            <circle cx="80" cy="180" r="26" fill="none" stroke="#34D399" strokeWidth="1.5" />
                            <g transform="translate(80, 180)">
                                <circle cx="0" cy="-6" r="3" fill="#34D399" /><path d="M -6 -10 L 0 -16 L 6 -10" fill="none" stroke="#34D399" strokeWidth="1" />
                                <circle cx="-10" cy="8" r="3" fill="#34D399" /><path d="M -16 6 L -18 12 L -12 14" fill="none" stroke="#34D399" strokeWidth="1" />
                                <circle cx="10" cy="8" r="3" fill="#34D399" /><path d="M 16 6 L 18 12 L 12 14" fill="none" stroke="#34D399" strokeWidth="1" />
                                <path d="M 0 -6 L -10 8 L 10 8 Z" fill="none" stroke="#34D399" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6"/>
                            </g>
                            <circle cx="320" cy="180" r="26" fill="none" stroke="#4A8FD4" strokeWidth="1.5" />
                            <path d="M 304 168 L 322 176 L 334 176 L 334 184 L 322 184 L 304 192" fill="none" stroke="#4A8FD4" strokeWidth="1.5" strokeLinejoin="round"/>
                            <circle cx="308" cy="174" r="1.5" fill="#4A8FD4" /><circle cx="308" cy="180" r="1.5" fill="#4A8FD4" /><circle cx="308" cy="186" r="1.5" fill="#4A8FD4" /><circle cx="316" cy="177" r="1.5" fill="#4A8FD4" /><circle cx="316" cy="183" r="1.5" fill="#4A8FD4" /><circle cx="328" cy="180" r="1.5" fill="#4A8FD4" />
                            <g fontFamily="monospace" fontSize="10" fill="#EDEDEF" opacity="0.4" textAnchor="middle" letterSpacing="1">
                                <text x="80" y="24">EVOLVER</text>
                                <text x="320" y="24">KNOWLEDGE_GRAPH</text>
                                <text x="80" y="222">MUTATOR_FLEET</text>
                                <text x="320" y="222">EVALUATOR</text>
                            </g>
                        </svg>
                    </div>

                    {/* Module descriptions */}
                    <div className="flex flex-col mobile-text" style={{ flex: 1, gap: 'clamp(10px, 1.2vw, 18px)', position: 'relative', zIndex: 1 }}>
                        {[
                            {
                                color: '#C9A84C',
                                name: 'The Evolver (ACE Brain)',
                                desc: 'Strategic reasoning engine implementing Agentic Context Engineering. Generator proposes, Reflector analyzes, Curator maintains the discovery playbook.',
                            },
                            {
                                color: '#34D399',
                                name: 'Mutator Fleet',
                                desc: 'Specialized sub-agents using GFlowNet and flow matching to generate diverse candidates across the entire Pareto front.',
                            },
                            {
                                color: '#4A8FD4',
                                name: 'Evaluator & A-Lab',
                                desc: 'Multi-tiered fitness scoring: GNN surrogates (MACE-MH-1), DFT/CALPHAD checks, then robotic synthesis for ground-truth validation.',
                            },
                            {
                                color: '#9CA3AF',
                                name: 'Materials Knowledge Graph',
                                desc: 'Dynamic external brain ingesting literature, patents, and instrument data. Triggers information-seeking loops when search stagnates.',
                            },
                        ].map((mod) => (
                            <div key={mod.name} className="glass-card" style={{ padding: 'clamp(12px, 1.2vw, 20px)', display: 'flex', gap: 'clamp(10px, 1vw, 16px)', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: mod.color,
                                    marginTop: '6px',
                                    flexShrink: 0,
                                }} />
                                <div>
                                    <div style={{
                                        fontFamily: 'var(--font-display)',
                                        fontSize: 'clamp(13px, 1.1vw, 20px)',
                                        fontWeight: 600,
                                        marginBottom: '4px',
                                    }}>
                                        {mod.name}
                                    </div>
                                    <div style={{
                                        fontSize: 'clamp(11px, 0.85vw, 14px)',
                                        color: 'var(--c-muted)',
                                        lineHeight: 1.5,
                                    }}>
                                        {mod.desc}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
