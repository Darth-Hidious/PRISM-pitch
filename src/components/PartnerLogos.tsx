const logoStyle = {
    opacity: 0.7,
    transition: 'opacity 0.3s ease',
    cursor: 'default',
};

function ESALogo({ height }: { height: string }) {
    return (
        <svg viewBox="0 0 120 40" fill="white" style={{ height, ...logoStyle }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
        >
            <text x="0" y="30" fontFamily="'Google Sans', sans-serif" fontWeight="700" fontSize="28" letterSpacing="4">ESA</text>
            <text x="0" y="38" fontFamily="'Google Sans', sans-serif" fontSize="6" opacity="0.6">European Space Agency</text>
        </svg>
    );
}

function ArianeGroupLogo({ height }: { height: string }) {
    return (
        <svg viewBox="0 0 180 40" fill="white" style={{ height, ...logoStyle }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
        >
            <text x="0" y="26" fontFamily="'Google Sans', sans-serif" fontWeight="700" fontSize="20" letterSpacing="2">ARIANEGROUP</text>
            <line x1="0" y1="32" x2="180" y2="32" stroke="white" strokeWidth="0.5" opacity="0.4" />
        </svg>
    );
}

function FraunhoferLogo({ height }: { height: string }) {
    return (
        <svg viewBox="0 0 200 40" fill="white" style={{ height, ...logoStyle }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
        >
            {/* Fraunhofer icon bars */}
            <rect x="0" y="8" width="6" height="24" fill="#00D4FF" opacity="0.8" />
            <rect x="8" y="14" width="6" height="18" fill="#00D4FF" opacity="0.6" />
            <rect x="16" y="10" width="6" height="22" fill="#00D4FF" opacity="0.7" />
            <text x="28" y="22" fontFamily="'Google Sans', sans-serif" fontWeight="500" fontSize="11">FRAUNHOFER</text>
            <text x="28" y="34" fontFamily="'Google Sans', sans-serif" fontSize="9" opacity="0.6">IAPT</text>
        </svg>
    );
}

function IPPTLogo({ height }: { height: string }) {
    return (
        <svg viewBox="0 0 140 40" fill="white" style={{ height, ...logoStyle }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
        >
            <text x="0" y="24" fontFamily="'Google Sans', sans-serif" fontWeight="700" fontSize="18" letterSpacing="2">IPPT PAN</text>
            <text x="0" y="36" fontFamily="'Google Sans', sans-serif" fontSize="6" opacity="0.5">Institute of Fundamental Technological Research</text>
        </svg>
    );
}

function ITERLogo({ height }: { height: string }) {
    return (
        <svg viewBox="0 0 120 40" fill="white" style={{ height, ...logoStyle }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
        >
            {/* Tokamak ring hint */}
            <circle cx="16" cy="20" r="12" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4" />
            <circle cx="16" cy="20" r="6" fill="none" stroke="#FFB800" strokeWidth="1" opacity="0.6" />
            <text x="34" y="26" fontFamily="'Google Sans', sans-serif" fontWeight="700" fontSize="22" letterSpacing="3">ITER</text>
        </svg>
    );
}

interface PartnerLogosProps {
    height?: string;
    layout?: 'row' | 'grid';
}

export default function PartnerLogos({ height = 'clamp(28px, 3vw, 44px)', layout = 'row' }: PartnerLogosProps) {
    const logos = [
        <ESALogo key="esa" height={height} />,
        <ArianeGroupLogo key="ag" height={height} />,
        <FraunhoferLogo key="fh" height={height} />,
        <IPPTLogo key="ippt" height={height} />,
        <ITERLogo key="iter" height={height} />,
    ];

    if (layout === 'grid') {
        return (
            <div className="flex flex-wrap items-center justify-center" style={{ gap: 'clamp(24px, 4vw, 72px)' }}>
                {logos}
            </div>
        );
    }

    return (
        <div className="flex items-center" style={{ gap: 'clamp(16px, 3vw, 48px)' }}>
            {logos}
        </div>
    );
}

export { ESALogo, ArianeGroupLogo, FraunhoferLogo, IPPTLogo, ITERLogo };
