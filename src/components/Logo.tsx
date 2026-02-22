export default function Logo({ size = 'default' }: { size?: 'default' | 'large' | 'small' }) {
    const h = size === 'large' ? 'clamp(28px, 3vw, 48px)' : size === 'small' ? 'clamp(14px, 1.2vw, 22px)' : 'clamp(18px, 1.6vw, 28px)';
    return (
        <div className="flex items-center" style={{ gap: 'clamp(6px, 0.6vw, 10px)' }}>
            {/* Prism icon */}
            <svg
                viewBox="0 0 32 32"
                fill="none"
                style={{ height: h, width: h }}
            >
                <defs>
                    <linearGradient id="prismGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#00D4FF" />
                        <stop offset="100%" stopColor="#0066FF" />
                    </linearGradient>
                </defs>
                <path
                    d="M16 2 L28 26 H4 Z"
                    fill="none"
                    stroke="url(#prismGrad)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
                <path
                    d="M16 8 L22 22 H10 Z"
                    fill="url(#prismGrad)"
                    opacity="0.3"
                />
                {/* Refraction lines */}
                <line x1="16" y1="2" x2="10" y2="22" stroke="url(#prismGrad)" strokeWidth="0.8" opacity="0.5" />
                <line x1="16" y1="2" x2="22" y2="22" stroke="url(#prismGrad)" strokeWidth="0.8" opacity="0.5" />
            </svg>
            <span
                style={{
                    fontSize: h,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    lineHeight: 1,
                }}
            >
                PRISM
            </span>
        </div>
    );
}
