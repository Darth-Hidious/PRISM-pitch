export default function ALabSlide() {
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
                        04 &mdash; THE A-LAB
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
                <h1 className="anim-in anim-d2" style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(24px, 3vw, 56px)',
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                    marginBottom: 'clamp(4px, 0.5vw, 8px)',
                }}>
                    Autonomous Laboratory
                </h1>
                <p className="anim-in anim-d3" style={{
                    fontSize: 'clamp(12px, 0.95vw, 16px)',
                    color: 'var(--c-muted)',
                    marginBottom: 'clamp(20px, 2.5vw, 40px)',
                }}>
                    Closing the loop: the real-world reward signal that trains the AI.
                </p>

                {/* Content: SVG + Pipeline */}
                <div className="flex-1 flex items-center anim-in anim-d4 mobile-stack" style={{ gap: 'clamp(16px, 4vw, 64px)', minHeight: 0 }}>
                    {/* Robot arm SVG */}
                    <div className="mobile-hide" style={{ flex: '0 0 42%', maxHeight: '100%' }}>
                        <svg viewBox="0 0 400 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <g stroke="#EDEDEF" strokeWidth="0.5" opacity="0.15">
                                <path d="M 20 20 L 20 30 M 15 25 L 25 25" />
                                <path d="M 20 210 L 20 220 M 15 215 L 25 215" />
                                <path d="M 380 20 L 380 30 M 375 25 L 385 25" />
                                <path d="M 380 210 L 380 220 M 375 215 L 385 215" />
                            </g>
                            <text x="380" y="25" fontFamily="monospace" fontSize="8" fill="#EDEDEF" opacity="0.4" textAnchor="end" letterSpacing="1">SYS.LAB_AUTO // SEQ_09</text>
                            <ellipse cx="180" cy="210" rx="45" ry="12" fill="none" stroke="#34D399" strokeWidth="0.5" opacity="0.2">
                                <animate attributeName="rx" values="42; 48; 42" dur="3s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.1; 0.3; 0.1" dur="3s" repeatCount="indefinite" />
                            </ellipse>
                            <path d="M 140 180 L 150 215 L 210 215 L 220 180" fill="none" stroke="#EDEDEF" strokeWidth="1.2" opacity="0.4" strokeLinejoin="round"/>
                            <path d="M 148 208 Q 180 215 212 208" fill="none" stroke="#4A8FD4" strokeWidth="4" opacity="0.3" strokeLinecap="round">
                                <animate attributeName="d" values="M 148 208 Q 180 215 212 208; M 148 208 Q 180 200 212 208; M 148 208 Q 180 215 212 208" dur="0.8s" repeatCount="indefinite"/>
                            </path>
                            <g fill="#34D399" opacity="0.8">
                                <circle cx="160" cy="205" r="1"><animate attributeName="cy" values="205; 196; 205" dur="1.1s" repeatCount="indefinite"/></circle>
                                <circle cx="170" cy="202" r="1.5"><animate attributeName="cy" values="202; 190; 202" dur="0.9s" repeatCount="indefinite"/></circle>
                                <circle cx="180" cy="207" r="1"><animate attributeName="cy" values="207; 194; 207" dur="1.3s" repeatCount="indefinite"/></circle>
                                <circle cx="190" cy="204" r="2"><animate attributeName="cy" values="204; 195; 204" dur="0.8s" repeatCount="indefinite"/></circle>
                                <circle cx="200" cy="206" r="1.5"><animate attributeName="cy" values="206; 194; 206" dur="1.0s" repeatCount="indefinite"/></circle>
                            </g>
                            <g fill="#4A8FD4" opacity="0.8">
                                <circle cx="165" cy="203" r="1.5"><animate attributeName="cy" values="203; 192; 203" dur="1.2s" repeatCount="indefinite"/></circle>
                                <circle cx="175" cy="206" r="1"><animate attributeName="cy" values="206; 188; 206" dur="0.7s" repeatCount="indefinite"/></circle>
                                <circle cx="185" cy="201" r="2"><animate attributeName="cy" values="201; 191; 201" dur="1.4s" repeatCount="indefinite"/></circle>
                                <circle cx="195" cy="205" r="1"><animate attributeName="cy" values="205; 197; 205" dur="0.9s" repeatCount="indefinite"/></circle>
                                <circle cx="205" cy="202" r="1.5"><animate attributeName="cy" values="202; 193; 202" dur="1.1s" repeatCount="indefinite"/></circle>
                            </g>
                            <g opacity="0.6">
                                <circle cx="170" cy="175" r="0.8" fill="#EDEDEF"><animate attributeName="cy" values="175; 165; 175" dur="2s" repeatCount="indefinite"/></circle>
                                <circle cx="190" cy="170" r="1" fill="#C9A84C"><animate attributeName="cy" values="170; 155; 170" dur="2.5s" repeatCount="indefinite"/></circle>
                                <circle cx="150" cy="185" r="0.5" fill="#34D399"><animate attributeName="cy" values="185; 175; 185" dur="1.8s" repeatCount="indefinite"/></circle>
                                <circle cx="210" cy="180" r="1" fill="#4A8FD4"><animate attributeName="cy" values="180; 165; 180" dur="2.2s" repeatCount="indefinite"/></circle>
                            </g>
                            <path d="M 260 215 L 300 215 L 290 160 L 270 160 Z" fill="none" stroke="#EDEDEF" strokeWidth="1.5" opacity="0.3"/>
                            <path d="M 265 210 L 295 210 M 272 170 L 288 170" stroke="#EDEDEF" strokeWidth="0.5" opacity="0.2"/>
                            <g transform="translate(280, 160)">
                                <animateTransform attributeName="transform" type="rotate" values="0; -6; 0" dur="4s" repeatCount="indefinite" additive="sum"/>
                                <line x1="0" y1="0" x2="-50" y2="-50" stroke="#3F3F46" strokeWidth="12" strokeLinecap="round"/>
                                <line x1="-5" y1="-5" x2="-45" y2="-45" stroke="#27272A" strokeWidth="2" strokeLinecap="round"/>
                                <circle cx="0" cy="0" r="9" fill="#27272A" stroke="#C9A84C" strokeWidth="1.5"/>
                                <circle cx="0" cy="0" r="3" fill="#C9A84C"><animate attributeName="opacity" values="1; 0.5; 1" dur="2s" repeatCount="indefinite"/></circle>
                                <g transform="translate(-50, -50)">
                                    <animateTransform attributeName="transform" type="rotate" values="0; 12; 0" dur="4s" repeatCount="indefinite" additive="sum"/>
                                    <line x1="0" y1="0" x2="-50" y2="60" stroke="#3F3F46" strokeWidth="8" strokeLinecap="round"/>
                                    <line x1="-4" y1="5" x2="-46" y2="55" stroke="#27272A" strokeWidth="1" strokeLinecap="round"/>
                                    <circle cx="0" cy="0" r="7" fill="#27272A" stroke="#C9A84C" strokeWidth="1.5"/>
                                    <circle cx="0" cy="0" r="2.5" fill="#C9A84C"/>
                                    <g transform="translate(-50, 60)">
                                        <animateTransform attributeName="transform" type="rotate" values="0; -25; 25; 0" dur="0.5s" repeatCount="indefinite" additive="sum"/>
                                        <line x1="0" y1="0" x2="0" y2="30" stroke="#4A8FD4" strokeWidth="2" strokeLinecap="round"/>
                                        <line x1="-4" y1="20" x2="4" y2="20" stroke="#4A8FD4" strokeWidth="1.5" strokeLinecap="round"/>
                                        <line x1="-2" y1="26" x2="2" y2="26" stroke="#4A8FD4" strokeWidth="1.5" strokeLinecap="round"/>
                                        <circle cx="0" cy="0" r="5" fill="#27272A" stroke="#C9A84C" strokeWidth="1"/>
                                        <circle cx="0" cy="0" r="1.5" fill="#C9A84C"/>
                                    </g>
                                </g>
                            </g>
                            <path d="M 150 140 L 190 140 L 275 185" fill="none" stroke="#EDEDEF" strokeWidth="1" strokeDasharray="2 4" opacity="0.3"/>
                            <circle r="1.5" fill="#4A8FD4">
                                <animateMotion dur="1.5s" repeatCount="indefinite" path="M 150 140 L 190 140 L 275 185" />
                            </circle>
                            <circle cx="275" cy="185" r="2.5" fill="none" stroke="#4A8FD4" strokeWidth="1" opacity="0.8">
                                <animate attributeName="r" values="2.5; 5; 2.5" dur="1.5s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.8; 0; 0.8" dur="1.5s" repeatCount="indefinite" />
                            </circle>
                            <rect x="40" y="30" width="110" height="130" fill="none" stroke="#4A8FD4" strokeWidth="1" rx="2" opacity="0.6"/>
                            <rect x="40" y="30" width="110" height="16" fill="#4A8FD4" opacity="0.15" rx="2"/>
                            <text x="45" y="41" fill="#4A8FD4" fontSize="8" fontFamily="monospace" letterSpacing="1">LAB_CTRL_TTY</text>
                            <g fontFamily="monospace" fontSize="8" fill="#EDEDEF" opacity="0.4">
                                <text x="45" y="60">&gt; SYS_READY</text>
                                <text x="45" y="75">&gt; TARG_ALLOY: 4X</text>
                                <text x="45" y="90"><animate attributeName="opacity" values="0; 0.4; 0.4" keyTimes="0; 0.3; 1" dur="4s" repeatCount="indefinite"/>&gt; ADD_CATALYST</text>
                                <text x="45" y="105"><animate attributeName="opacity" values="0; 0; 0.4" keyTimes="0; 0.6; 1" dur="4s" repeatCount="indefinite"/>&gt; RUN_MIX_PROT</text>
                                <text x="45" y="120"><animate attributeName="opacity" values="0; 0; 0.4" keyTimes="0; 0.8; 1" dur="4s" repeatCount="indefinite"/>&gt; STATUS: OK</text>
                            </g>
                            <text x="45" y="135" fontFamily="monospace" fontSize="8" fill="#34D399" fontWeight="bold">
                                &gt; _
                                <animate attributeName="opacity" values="0; 1; 0" dur="0.8s" repeatCount="indefinite"/>
                            </text>
                        </svg>
                    </div>

                    {/* Pipeline steps */}
                    <div className="flex flex-col" style={{ flex: 1, gap: 'clamp(8px, 1vw, 14px)' }}>
                        {[
                            { step: '01', label: 'Recipe Translation', desc: 'AI outputs target recipes: precursors, temperatures, thermal profiles.' },
                            { step: '02', label: 'Robotic Synthesis', desc: 'Automated arms handle powder dosing and move samples through heating profiles.' },
                            { step: '03', label: 'Automated Characterization', desc: 'System extracts raw diffraction patterns from synthesized material.' },
                            { step: '04', label: 'Phase Identification', desc: 'Neural networks compare patterns against structure databases to confirm phases.' },
                            { step: '05', label: 'Feedback Loop', desc: 'Empirical data structured via amsight and fed back into the Evolver\'s Reflector.' },
                        ].map((item) => (
                            <div key={item.step} className="flex items-start" style={{ gap: 'clamp(12px, 1.2vw, 20px)' }}>
                                <div style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'clamp(10px, 0.8vw, 13px)',
                                    color: 'var(--c-gold)',
                                    minWidth: 'clamp(24px, 2vw, 32px)',
                                    paddingTop: '2px',
                                }}>
                                    {item.step}
                                </div>
                                <div>
                                    <div style={{
                                        fontFamily: 'var(--font-display)',
                                        fontSize: 'clamp(14px, 1.15vw, 20px)',
                                        fontWeight: 600,
                                        marginBottom: '2px',
                                    }}>
                                        {item.label}
                                    </div>
                                    <div style={{
                                        fontSize: 'clamp(11px, 0.85vw, 14px)',
                                        color: 'var(--c-muted)',
                                        lineHeight: 1.5,
                                    }}>
                                        {item.desc}
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
