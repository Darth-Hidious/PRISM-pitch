import VideoBackground from '../components/VideoBackground';

export default function QuoteSlide() {
    return (
        <div className="relative w-full h-full text-white font-['Plus_Jakarta_Sans',sans-serif]">
            <VideoBackground src="https://stream.mux.com/4IMYGcL01xjs7ek5ANO17JC4VQVUTsojZlnw4fXzwSxc.m3u8" />

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-[5.2%] pb-[8.5%] pt-[4%]">
                <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: 'clamp(14px, 1.2vw, 20px)', opacity: 0.9, fontWeight: 500 }}>
                        ESA Strategy 2040 & PRISM Whitepaper
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(28px, 4vw, 56px)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.15,
                        fontWeight: 500
                    }}>
                        “The innovation cycle is constrained by a fundamental bottleneck: the slow pace of experimental validation compared to computational prediction. PRISM replaces stochastic operators with an engine that learns how to discover.”
                    </h1>
                </div>
            </div>
        </div>
    );
}
