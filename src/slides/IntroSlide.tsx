import VideoBackground from '../components/VideoBackground';

export default function IntroSlide() {
    return (
        <div className="relative w-full h-full text-white font-['Plus_Jakarta_Sans',sans-serif]">
            <VideoBackground src="https://stream.mux.com/Kec29dVyJgiPdtWaQtPuEiiGHkJIYQAVUJcNiIHUYeo.m3u8" />

            <div className="relative z-10 w-full h-full flex flex-col justify-between pt-[4%] px-[5.2%] pb-[8.5%]">

                {/* Header */}
                <header className="flex items-center justify-between" style={{ fontSize: 'clamp(12px, 1.05vw, 20px)', opacity: 0.8 }}>
                    <svg width="129" height="40" viewBox="0 0 129 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" y="8" fill="white" />
                        <text x="32" y="26" fill="white" fontWeight="bold" fontSize="18" fontFamily="Plus Jakarta Sans">BIMO TECH</text>
                    </svg>
                    <div className="font-medium">The Problem</div>
                    <div>Page 001</div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex flex-col justify-center">
                    <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 64px)', letterSpacing: '-0.02em', lineHeight: 1.05, fontWeight: 700 }}>
                        Materials R&D<br />is broken.
                    </h1>

                    {/* Three-column layout */}
                    <div className="flex w-full items-start" style={{ marginTop: '3.5%', gap: '4%' }}>
                        {/* Column 1 */}
                        <div style={{ flex: '0 0 22%' }}>
                            <p style={{ fontSize: 'clamp(13px, 1.1vw, 20px)', opacity: 0.9, lineHeight: 1.5, marginBottom: '20px' }}>
                                The extreme-environment aerospace materials market ($49B TAM) relies on trial and error and human intuition. Discoveries routinely take a decade to reach production.
                            </p>
                            <div className="flex items-baseline gap-3">
                                <span style={{ fontSize: 'clamp(28px, 3.5vw, 64px)', fontWeight: 700, lineHeight: 1 }}>10-20</span>
                                <span style={{ fontSize: 'clamp(13px, 1.1vw, 20px)', color: 'rgba(255,255,255,0.8)' }}>Years to<br />Market</span>
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div style={{ flex: '0 0 38%' }}>
                            <p style={{ fontSize: 'clamp(13px, 1.1vw, 20px)', opacity: 0.9, lineHeight: 1.5 }}>
                                The fundamental bottleneck is no longer computational prediction—it is experimental validation. AI models have identified over 2.2 million potential stable compositions, but only 736 have been verified in real-world labs. Experimental validation cannot keep pace with software-driven prediction, creating an impossible bottleneck for next-generation alloys.
                            </p>
                        </div>

                        {/* Column 3 */}
                        <div style={{ flex: '0 0 20%' }}>
                            <div style={{ fontSize: 'clamp(28px, 3.5vw, 64px)', fontWeight: 700, lineHeight: 1 }}>1M+</div>
                            <div style={{ fontSize: 'clamp(13px, 1.1vw, 20px)', opacity: 0.8, marginTop: '8px' }}>Combinations screened in minutes</div>

                            {/* Mini SVG line graph */}
                            <div className="w-full mt-6 aspect-[2/1] relative">
                                <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.5" />
                                            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,45 Q50,45 80,20 T100,5" fill="none" stroke="white" strokeWidth="2" />
                                    <path d="M0,45 Q50,45 80,20 T100,5 L100,50 L0,50 Z" fill="url(#curveGradient)" />
                                    <circle cx="0" cy="45" r="3" fill="#00B4D8" stroke="white" strokeWidth="1" />
                                    <circle cx="100" cy="5" r="3" fill="#00B4D8" stroke="white" strokeWidth="1" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="text-right" style={{ fontSize: 'clamp(12px, 1.05vw, 20px)', opacity: 0.6 }}>
                    The Bottleneck
                </footer>
            </div>
        </div>
    );
}
