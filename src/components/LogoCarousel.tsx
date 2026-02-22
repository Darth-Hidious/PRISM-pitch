import { useEffect, useState, useRef } from 'react';

/*
  LogoCarousel — infinite scrolling carousel of partner logos.
  User can drop SVG files into public/logos/ folder.
  All logos are rendered at uniform size and white color via CSS filter.
  Falls back to inline SVG logos if no external files are found.
*/

/* Default inline logos (used if no external SVGs provided) */
const defaultLogos = [
    { name: 'ESA', svg: '<svg viewBox="0 0 120 40" height="100%" fill="white" xmlns="http://www.w3.org/2000/svg"><text x="0" y="30" font-family="sans-serif" font-weight="700" font-size="28" letter-spacing="4">ESA</text></svg>' },
    { name: 'ArianeGroup', svg: '<svg viewBox="0 0 180 40" height="100%" fill="white" xmlns="http://www.w3.org/2000/svg"><text x="0" y="26" font-family="sans-serif" font-weight="700" font-size="20" letter-spacing="2">ARIANEGROUP</text></svg>' },
    { name: 'Fraunhofer', svg: '<svg viewBox="0 0 200 40" height="100%" fill="white" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="8" width="6" height="24" fill="#00D4FF" opacity="0.8"/><rect x="8" y="14" width="6" height="18" fill="#00D4FF" opacity="0.6"/><rect x="16" y="10" width="6" height="22" fill="#00D4FF" opacity="0.7"/><text x="28" y="22" font-family="sans-serif" font-weight="500" font-size="11">FRAUNHOFER</text><text x="28" y="34" font-family="sans-serif" font-size="9" opacity="0.6">IAPT</text></svg>' },
    { name: 'IPPT PAN', svg: '<svg viewBox="0 0 140 40" height="100%" fill="white" xmlns="http://www.w3.org/2000/svg"><text x="0" y="24" font-family="sans-serif" font-weight="700" font-size="18" letter-spacing="2">IPPT PAN</text></svg>' },
    { name: 'ITER', svg: '<svg viewBox="0 0 120 40" height="100%" fill="white" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="20" r="12" fill="none" stroke="white" stroke-width="1.5" opacity="0.4"/><circle cx="16" cy="20" r="6" fill="none" stroke="#FFB800" stroke-width="1" opacity="0.6"/><text x="34" y="26" font-family="sans-serif" font-weight="700" font-size="22" letter-spacing="3">ITER</text></svg>' },
];

interface LogoCarouselProps {
    height?: string;
    /** Array of logo file paths relative to public/, e.g. ['logos/esa.svg', 'logos/iter.svg'] */
    logos?: string[];
}

export default function LogoCarousel({ height = 'clamp(24px, 2.5vw, 40px)', logos }: LogoCarouselProps) {
    const [externalLogos, setExternalLogos] = useState<string[]>([]);
    const trackRef = useRef<HTMLDivElement>(null);

    // Try loading external SVG logos from public/logos/
    useEffect(() => {
        if (logos && logos.length > 0) {
            setExternalLogos(logos);
            return;
        }

        // Auto-discover logos from manifest (user can create this file)
        fetch('/logos/manifest.json')
            .then(r => r.ok ? r.json() : Promise.reject('no manifest'))
            .then((files: string[]) => {
                setExternalLogos(files.map(f => `/logos/${f}`));
            })
            .catch(() => {
                // No external logos — use defaults
                setExternalLogos([]);
            });
    }, [logos]);

    const useExternal = externalLogos.length > 0;

    // Duplicate items for seamless infinite scroll
    const items = useExternal
        ? [...externalLogos, ...externalLogos]  // double for seamless loop
        : [...defaultLogos, ...defaultLogos];

    const itemCount = useExternal ? externalLogos.length : defaultLogos.length;

    return (
        <div className="relative overflow-hidden" style={{ width: '100%', maxWidth: '700px' }}>
            {/* Gradient masks for smooth fade edges */}
            <div className="absolute inset-y-0 left-0 z-10 pointer-events-none"
                style={{ width: '60px', background: 'linear-gradient(to right, black, transparent)' }} />
            <div className="absolute inset-y-0 right-0 z-10 pointer-events-none"
                style={{ width: '60px', background: 'linear-gradient(to left, black, transparent)' }} />

            <div
                ref={trackRef}
                className="flex items-center"
                style={{
                    gap: 'clamp(32px, 4vw, 64px)',
                    animation: `logoScroll ${itemCount * 4}s linear infinite`,
                    width: 'max-content',
                }}
            >
                {items.map((item, i) => (
                    useExternal ? (
                        <img
                            key={i}
                            src={item as string}
                            alt={`Partner logo ${i}`}
                            style={{
                                height,
                                width: 'auto',
                                opacity: 0.7,
                                filter: 'brightness(0) invert(1)', // Force white
                                flexShrink: 0,
                                transition: 'opacity 0.3s ease',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
                        />
                    ) : (
                        <div
                            key={i}
                            style={{
                                height,
                                opacity: 0.7,
                                flexShrink: 0,
                                transition: 'opacity 0.3s ease',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
                            dangerouslySetInnerHTML={{ __html: (item as { svg: string }).svg }}
                        />
                    )
                ))}
            </div>
        </div>
    );
}
