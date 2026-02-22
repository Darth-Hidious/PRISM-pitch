import ShaderBackground from '../components/ShaderBackground';
import Logo from '../components/Logo';

/* Metallic server rack / edge node SVG */
function EdgeNodeSVG() {
    return (
        <svg viewBox="0 0 200 120" fill="none" style={{ width: '100%', maxWidth: '400px', opacity: 0.5 }}>
            <defs>
                <linearGradient id="serverGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#667788" />
                    <stop offset="100%" stopColor="#334455" />
                </linearGradient>
                <linearGradient id="glowGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00D4FF" />
                    <stop offset="100%" stopColor="#0066FF" />
                </linearGradient>
            </defs>
            {/* Server units */}
            {[0, 1, 2].map(i => (
                <g key={i} transform={`translate(${30 + i * 55}, 10)`}>
                    <rect x="0" y="0" width="45" height="100" rx="4" fill="url(#serverGrad)" stroke="#556677" strokeWidth="0.8" />
                    {/* LED indicators */}
                    <circle cx="8" cy="10" r="2" fill="#00D4FF" opacity="0.8">
                        <animate attributeName="opacity" values="0.4;1;0.4" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
                    </circle>
                    <circle cx="16" cy="10" r="2" fill="#00FF88" opacity="0.6">
                        <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${2 + i * 0.2}s`} repeatCount="indefinite" />
                    </circle>
                    {/* Vent lines */}
                    {[0, 1, 2, 3, 4].map(j => (
                        <line key={j} x1="6" y1={25 + j * 12} x2="39" y2={25 + j * 12} stroke="#445566" strokeWidth="0.8" opacity="0.4" />
                    ))}
                </g>
            ))}
            {/* Connection lines between servers */}
            <line x1="75" y1="60" x2="85" y2="60" stroke="url(#glowGrad)" strokeWidth="1" opacity="0.5">
                <animate attributeName="opacity" values="0.2;0.7;0.2" dur="2s" repeatCount="indefinite" />
            </line>
            <line x1="130" y1="60" x2="140" y2="60" stroke="url(#glowGrad)" strokeWidth="1" opacity="0.5">
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.5s" repeatCount="indefinite" />
            </line>
        </svg>
    );
}

const features = [
    { title: 'Decentralized Edge Deployment', desc: 'Runs on sovereign hardware within national borders — no data leaves the perimeter.' },
    { title: 'Data Sovereignty', desc: 'Full compliance with European data governance. ITAR-compatible by architecture.' },
    { title: 'Compute-Efficient', desc: 'Matches monolithic model capabilities at lower compute cost through federated orchestration.' },
];

export default function PrismAlphaSlide() {
    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <ShaderBackground shader="dataStream" />

            <div className="absolute inset-0" style={{
                background: 'radial-gradient(ellipse at center, rgba(10,14,23,0.4) 0%, rgba(10,14,23,0.92) 80%)',
            }} />

            <div className="relative z-10 flex flex-col h-full"
                style={{ padding: 'clamp(24px, 4%, 48px) clamp(32px, 5.2%, 80px) clamp(64px, 8.5%, 110px)' }}>

                {/* Header */}
                <div className="flex items-center justify-between" style={{ marginBottom: 'clamp(16px, 3%, 40px)' }}>
                    <Logo size="small" />
                    <span style={{ fontSize: 'clamp(12px, 1.05vw, 20px)', opacity: 0.8 }}>Pitch Deck</span>
                    <span style={{ fontSize: 'clamp(12px, 1.05vw, 20px)', opacity: 0.8 }}>Page 006</span>
                </div>

                <div className="flex flex-col items-center justify-center" style={{ flex: 1 }}>

                    <p className="anim-fade-in text-prism-cyan uppercase tracking-widest text-center"
                        style={{ fontSize: 'clamp(10px, 1vw, 14px)', letterSpacing: '0.2em', marginBottom: 'clamp(8px, 1vw, 16px)' }}>
                        Sovereign Deployment
                    </p>

                    <h2 className="anim-fade-in-delay-1 font-bold text-white text-center"
                        style={{ fontSize: 'clamp(28px, 4.5vw, 72px)', lineHeight: 1.1, marginBottom: 'clamp(4px, 0.5vw, 8px)' }}>
                        PRISM-α
                    </h2>

                    <p className="anim-fade-in-delay-2 text-prism-cyan text-center"
                        style={{ fontSize: 'clamp(14px, 1.6vw, 22px)', marginBottom: 'clamp(24px, 3vw, 48px)' }}>
                        Federated Sovereign Engine for European Space
                    </p>

                    <div className="anim-fade-in-delay-3 flex items-center justify-center" style={{ gap: 'clamp(24px, 3vw, 48px)', flexWrap: 'wrap', width: '100%' }}>
                        {/* Features */}
                        <div style={{ flex: '1 1 300px', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.5vw, 20px)' }}>
                            {features.map((f, i) => (
                                <div key={f.title} className={`liquid-glass rounded-xl anim-fade-in-delay-${i + 3}`}
                                    style={{ padding: 'clamp(14px, 1.5vw, 22px)' }}>
                                    <h3 className="text-white font-bold" style={{ fontSize: 'clamp(13px, 1.3vw, 18px)', marginBottom: '4px' }}>
                                        {f.title}
                                    </h3>
                                    <p className="text-prism-silver" style={{ fontSize: 'clamp(10px, 0.95vw, 14px)', lineHeight: 1.5 }}>
                                        {f.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Server illustration */}
                        <div style={{ flex: '0 0 auto' }}>
                            <EdgeNodeSVG />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
