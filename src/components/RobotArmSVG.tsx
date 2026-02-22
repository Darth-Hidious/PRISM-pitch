/*
  RobotArmSVG — Isometric robot arm pouring animation.
  Adapted from user's reference HTML. Pure SVG + CSS animations.
  Customizable accent color via --chem-color CSS variable.
*/

interface RobotArmSVGProps {
    accentColor?: string;
    maxWidth?: string;
    opacity?: number;
}

export default function RobotArmSVG({
    accentColor = '#66fcf1',
    maxWidth = '400px',
    opacity = 0.7,
}: RobotArmSVGProps) {
    return (
        <div
            style={{
                ['--chem-color' as string]: accentColor,
                maxWidth,
                width: '100%',
                opacity,
            }}
        >
            <style>{`
                #lower-arm {
                    transform-origin: 0px 0px;
                    animation: lower-arm-motion 8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
                #upper-arm {
                    transform-origin: 0px 0px;
                    animation: upper-arm-motion 8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
                #wrist {
                    transform-origin: 0px 0px;
                    animation: wrist-motion 8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
                @keyframes lower-arm-motion {
                    0%, 15%, 85%, 100% { transform: rotate(-15deg); }
                    35%, 65% { transform: rotate(40deg); }
                }
                @keyframes upper-arm-motion {
                    0%, 15%, 85%, 100% { transform: rotate(150deg); }
                    35%, 65% { transform: rotate(70deg); }
                }
                @keyframes wrist-motion {
                    0%, 15%, 85%, 100% { transform: rotate(-135deg); }
                    35% { transform: rotate(-110deg); }
                    45%, 55% { transform: rotate(50deg); }
                    65% { transform: rotate(-110deg); }
                }
                .powder-stream {
                    stroke-dasharray: 8 16;
                    animation: stream-flow 0.4s linear infinite, stream-visibility 8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    opacity: 0;
                }
                @keyframes stream-flow {
                    from { stroke-dashoffset: 0; }
                    to { stroke-dashoffset: -24; }
                }
                @keyframes stream-visibility {
                    0%, 44% { opacity: 0; transform: scaleY(0.5); }
                    45%, 54% { opacity: 1; transform: scaleY(1); }
                    55%, 100% { opacity: 0; transform: scaleY(0.5) translateY(50px); }
                }
                .splash-group {
                    animation: splash-visibility 8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    opacity: 0;
                }
                @keyframes splash-visibility {
                    0%, 45% { opacity: 0; transform: scale(0.5); }
                    46%, 54% { opacity: 1; transform: scale(1); }
                    55%, 100% { opacity: 0; transform: scale(0.5); }
                }
                .splash-particle {
                    animation: particle-bounce 0.3s ease-out infinite alternate;
                }
                .splash-particle:nth-child(2) { animation-delay: 0.1s; animation-duration: 0.25s; }
                .splash-particle:nth-child(3) { animation-delay: 0.2s; animation-duration: 0.35s; }
                .splash-particle:nth-child(4) { animation-delay: 0.05s; animation-duration: 0.2s; }
                @keyframes particle-bounce {
                    from { transform: translateY(0) scale(1); opacity: 1; }
                    to { transform: translateY(-30px) translateX(15px) scale(0); opacity: 0; }
                }
                .crucible-liquid {
                    animation: liquid-rise 8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
                @keyframes liquid-rise {
                    0%, 45% { transform: translateY(15px) scale(0.95); opacity: 0.7; }
                    55%, 85% { transform: translateY(0px) scale(1); opacity: 1; }
                    100% { transform: translateY(15px) scale(0.95); opacity: 0.7; }
                }
            `}</style>

            <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: 'auto' }}>
                <defs>
                    <linearGradient id="robot-orange" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ff4500" />
                        <stop offset="50%" stopColor="#ff7b00" />
                        <stop offset="100%" stopColor="#cc3700" />
                    </linearGradient>
                    <linearGradient id="robot-dark" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1f2833" />
                        <stop offset="100%" stopColor="#0b0c10" />
                    </linearGradient>
                    <linearGradient id="metal-gray" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#c5c6c7" />
                        <stop offset="50%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#8a8b8c" />
                    </linearGradient>
                    <linearGradient id="crucible-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2c3531" />
                        <stop offset="20%" stopColor="#4a524e" />
                        <stop offset="100%" stopColor="#111614" />
                    </linearGradient>
                    <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
                        <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur2" />
                        <feMerge>
                            <feMergeNode in="blur2" />
                            <feMergeNode in="blur1" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="neon-orange" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
                        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
                        <feMerge>
                            <feMergeNode in="blur2" />
                            <feMergeNode in="blur1" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="drop-shadow" x="-20%" y="-20%" width="150%" height="150%">
                        <feDropShadow dx="0" dy="25" stdDeviation="15" floodColor="#000" floodOpacity="0.8" />
                    </filter>
                </defs>

                {/* Crucible */}
                <g id="crucible" transform="translate(850, 520)">
                    <ellipse cx="0" cy="110" rx="140" ry="70" fill="#000" opacity="0.6" style={{ filter: 'blur(10px)' }} />
                    <path d="M -150,0 L -120,100 A 120 60 0 0 0 120,100 L 150,0 Z" fill="url(#crucible-grad)" />
                    <ellipse cx="0" cy="100" rx="120" ry="60" fill="#1f2833" />
                    <ellipse cx="0" cy="0" rx="150" ry="75" fill="#0b0c10" stroke="#4a524e" strokeWidth="6" />
                    <ellipse cx="0" cy="5" rx="140" ry="70" fill="#1f2833" />

                    <g className="crucible-liquid">
                        <ellipse cx="0" cy="15" rx="130" ry="65" fill={accentColor} filter="url(#neon-glow)" opacity="0.8" />
                        <ellipse cx="0" cy="15" rx="100" ry="50" fill="#ffffff" filter="url(#neon-glow)" opacity="0.5" />
                    </g>

                    <path d="M -150,0 A 150 75 0 0 0 150,0 A 150 75 0 0 1 -150,0 Z" fill="#c5c6c7" />
                    <path d="M -150,0 A 150 75 0 0 0 150,0 A 155 77 0 0 1 -150,0 Z" fill="#ff7b00" opacity="0.6" filter="url(#neon-orange)" />
                </g>

                {/* Powder Stream */}
                <g transform="translate(865, 335)">
                    <path className="powder-stream" d="M 0,0 C -5,50 -10,120 -15,185" fill="none" stroke={accentColor} strokeWidth="14" strokeLinecap="round" filter="url(#neon-glow)" />
                    <path className="powder-stream" d="M 0,0 C -5,50 -10,120 -15,185" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
                </g>

                {/* Splash */}
                <g className="splash-group" transform="translate(850, 520)">
                    <ellipse cx="0" cy="0" rx="40" ry="20" fill={accentColor} filter="url(#neon-glow)" opacity="0.8" />
                    <g>
                        <circle className="splash-particle" cx="-15" cy="5" r="5" fill="#ffffff" filter="url(#neon-glow)" />
                        <circle className="splash-particle" cx="15" cy="-5" r="7" fill={accentColor} filter="url(#neon-glow)" />
                        <circle className="splash-particle" cx="0" cy="10" r="6" fill="#ffffff" filter="url(#neon-glow)" />
                        <circle className="splash-particle" cx="-5" cy="-10" r="4" fill={accentColor} filter="url(#neon-glow)" />
                    </g>
                </g>

                {/* Robot Arm */}
                <g id="robot-base" transform="translate(400, 580)">
                    <ellipse cx="0" cy="30" rx="100" ry="50" fill="#000" opacity="0.8" style={{ filter: 'blur(8px)' }} />
                    <ellipse cx="0" cy="20" rx="90" ry="45" fill="#0b0c10" />
                    <path d="M -80,-40 L -90,20 A 90 45 0 0 0 90,20 L 80,-40 Z" fill="url(#robot-dark)" />
                    <ellipse cx="0" cy="-40" rx="80" ry="40" fill="#1f2833" />
                    <ellipse cx="0" cy="-40" rx="50" ry="25" fill="#0b0c10" stroke={accentColor} strokeWidth="2" />
                    <path d="M -40,-60 L -50,-40 A 50 25 0 0 0 50,-40 L 40,-60 Z" fill="url(#robot-orange)" />
                    <ellipse cx="0" cy="-60" rx="40" ry="20" fill="#cc3700" />
                    <path d="M -30,-60 L -30,-100 L 30,-100 L 30,-60 Z" fill="url(#robot-dark)" />
                    <circle cx="0" cy="-100" r="40" fill="#1f2833" stroke="#c5c6c7" strokeWidth="3" />
                    <circle cx="0" cy="-100" r="20" fill="#0b0c10" />
                    <circle cx="0" cy="-100" r="8" fill={accentColor} filter="url(#neon-glow)" />

                    <g transform="translate(0, -100)">
                        <g id="lower-arm">
                            <path d="M -25,0 L -20,-240 A 20 20 0 0 1 20,-240 L 25,0 Z" fill="url(#robot-orange)" filter="url(#drop-shadow)" />
                            <path d="M -10,-20 L -6,-220 L 6,-220 L 10,-20 Z" fill="#0b0c10" opacity="0.5" />
                            <line x1="-15" y1="-30" x2="-10" y2="-210" stroke="#ffffff" strokeWidth="3" opacity="0.4" strokeLinecap="round" />
                            <rect x="-35" y="-180" width="10" height="80" rx="5" fill="url(#metal-gray)" />
                            <rect x="25" y="-150" width="10" height="60" rx="5" fill="url(#metal-gray)" />
                            <circle cx="0" cy="-240" r="35" fill="#1f2833" stroke="#ff7b00" strokeWidth="4" />
                            <circle cx="0" cy="-240" r="18" fill="#0b0c10" />
                            <circle cx="0" cy="-240" r="6" fill="#ff7b00" filter="url(#neon-orange)" />

                            <g transform="translate(0, -240)">
                                <g id="upper-arm">
                                    <path d="M -20,0 L -15,-260 A 15 15 0 0 1 15,-260 L 20,0 Z" fill="url(#robot-orange)" filter="url(#drop-shadow)" />
                                    <path d="M -6,-20 L -4,-240 L 4,-240 L 6,-20 Z" fill="#0b0c10" opacity="0.6" />
                                    <rect x="-8" y="-150" width="16" height="40" fill="url(#metal-gray)" rx="4" />
                                    <line x1="12" y1="-20" x2="8" y2="-240" stroke="#ffffff" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
                                    <circle cx="0" cy="-260" r="28" fill="#1f2833" stroke="#c5c6c7" strokeWidth="3" />
                                    <circle cx="0" cy="-260" r="12" fill="#0b0c10" />
                                    <circle cx="0" cy="-260" r="5" fill={accentColor} filter="url(#neon-glow)" />

                                    <g transform="translate(0, -260)">
                                        <g id="wrist">
                                            <path d="M -15,0 L -10,-25 L 10,-25 L 15,0 Z" fill="url(#metal-gray)" />
                                            <rect x="-25" y="-35" width="50" height="10" rx="3" fill="#0b0c10" stroke="#ff7b00" strokeWidth="1" />
                                            <path d="M -20,-35 L -30,-95 A 30 10 0 0 1 30,-95 L 20,-35 Z" fill="url(#robot-dark)" stroke="#c5c6c7" strokeWidth="2" />
                                            <path d="M -10,-45 L -15,-85 L 15,-85 L 10,-45 Z" fill="#1f2833" />
                                            <path d="M -8,-50 L -12,-80 L 12,-80 L 8,-50 Z" fill={accentColor} opacity="0.8" filter="url(#neon-glow)" />
                                            <ellipse cx="0" cy="-95" rx="30" ry="10" fill="#0b0c10" />
                                            <path d="M -15,-95 L -10,-115 L 10,-115 L 15,-95 Z" fill="url(#metal-gray)" />
                                            <ellipse cx="0" cy="-115" rx="10" ry="4" fill={accentColor} filter="url(#neon-glow)" />
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </g>
                </g>
            </svg>
        </div>
    );
}
