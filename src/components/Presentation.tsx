import { useState, useEffect, useCallback, useRef } from 'react';
import type { ReactElement } from 'react';
import { ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';

interface PresentationProps {
    slides: ReactElement[];
}

export default function Presentation({ slides }: PresentationProps) {
    const [current, setCurrent] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [phase, setPhase] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const total = slides.length;

    // Slides with two-phase mobile reveal (SVG first, then text): Architecture (3), ALab (4)
    const twoPhaseSlides = new Set([3, 4]);

    const next = useCallback(() => setCurrent((c) => Math.min(c + 1, total - 1)), [total]);
    const prev = useCallback(() => setCurrent((c) => Math.max(c - 1, 0)), []);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ':
                    e.preventDefault();
                    next();
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    prev();
                    break;
                case 'f':
                case 'F':
                    toggleFullscreen();
                    break;
                case 'Escape':
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    }
                    break;
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [next, prev, toggleFullscreen]);

    // Fullscreen state sync
    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    // Re-trigger CSS animations and reset phase when slide changes
    useEffect(() => {
        setPhase(0);
        if (!containerRef.current) return;
        const slideEl = containerRef.current.children[current] as HTMLElement;
        if (!slideEl) return;
        const animEls = slideEl.querySelectorAll('.anim-in');
        animEls.forEach((el) => {
            const htmlEl = el as HTMLElement;
            htmlEl.style.animation = 'none';
            void htmlEl.offsetHeight;
            htmlEl.style.animation = '';
        });
    }, [current]);

    // Touch tap zones: right 75% = forward, left 25% = back
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;

        const onTouchStart = (e: TouchEvent) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
        };

        const onTouchEnd = (e: TouchEvent) => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            const dt = Date.now() - touchStartTime;

            // Ignore long presses and large vertical swipes (scrolling)
            if (dt > 400 || Math.abs(dy) > 60) return;

            const isMobile = window.innerWidth <= 768;

            const goFwd = () => {
                if (isMobile && twoPhaseSlides.has(current) && phase === 0) {
                    setPhase(1);
                } else {
                    next();
                }
            };

            const goBack = () => {
                if (isMobile && twoPhaseSlides.has(current) && phase === 1) {
                    setPhase(0);
                } else {
                    prev();
                }
            };

            // Swipe gesture: horizontal swipe > 50px
            if (Math.abs(dx) > 50) {
                if (dx < 0) goFwd();
                else goBack();
                return;
            }

            // Tap gesture: minimal movement
            if (Math.abs(dx) < 15 && Math.abs(dy) < 15) {
                // Ignore taps on interactive elements
                const target = e.target as HTMLElement;
                if (target.closest('button, a, input, [role="button"]')) return;

                const tapX = e.changedTouches[0].clientX;
                const width = el.getBoundingClientRect().width;
                // Left 25% = back, right 75% = forward
                if (tapX < width * 0.25) {
                    goBack();
                } else {
                    goFwd();
                }
            }
        };

        el.addEventListener('touchstart', onTouchStart, { passive: true });
        el.addEventListener('touchend', onTouchEnd, { passive: true });
        return () => {
            el.removeEventListener('touchstart', onTouchStart);
            el.removeEventListener('touchend', onTouchEnd);
        };
    }, [next, prev, current, phase]);

    // Auto-hide controls
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        const show = () => {
            setControlsVisible(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setControlsVisible(false), 3000);
        };
        window.addEventListener('mousemove', show);
        show();
        return () => {
            window.removeEventListener('mousemove', show);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-black">
            {/* Slides */}
            {slides.map((slide, i) => {
                const offset = i - current;
                return (
                    <div
                        key={i}
                        className={`absolute inset-0 w-full h-full${offset === 0 && twoPhaseSlides.has(i) ? ` slide-phase-${phase}` : ''}`}
                        style={{
                            opacity: offset === 0 ? 1 : 0,
                            transition: 'opacity 800ms ease-in-out',
                            pointerEvents: offset === 0 ? 'auto' : 'none',
                            zIndex: offset === 0 ? 1 : 0,
                        }}
                    >
                        {slide}
                    </div>
                );
            })}

            {/* Controls overlay */}
            <div
                className="absolute inset-0 z-50 pointer-events-none"
                style={{
                    opacity: controlsVisible ? 1 : 0,
                    transition: 'opacity 300ms ease',
                }}
            >
                {/* Top keyboard hint - hidden on mobile */}
                <div
                    className="absolute top-[1.5%] left-1/2 -translate-x-1/2 mobile-hide"
                    style={{ fontSize: 'clamp(9px, 0.85vw, 11px)', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}
                >
                    ← → Navigate · F Fullscreen
                </div>

                {/* Left edge arrow */}
                <button
                    onClick={prev}
                    className="absolute top-1/2 -translate-y-1/2 border-none outline-none cursor-pointer flex items-center justify-center rounded-full pointer-events-auto"
                    style={{
                        left: 'clamp(10px, 1.2%, 20px)',
                        width: 'clamp(36px, 3.5vw, 52px)',
                        height: 'clamp(36px, 3.5vw, 52px)',
                        color: current === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.7)',
                        background: 'rgba(255,255,255,0.06)',
                        backdropFilter: 'blur(4px)',
                        transition: 'all 300ms',
                    }}
                    onMouseEnter={(e) => {
                        if (current > 0) {
                            e.currentTarget.style.color = 'rgba(255,255,255,0.95)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = current === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.7)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    }}
                    aria-label="Previous slide"
                >
                    <ChevronLeft style={{ width: 'clamp(18px, 2vw, 28px)', height: 'clamp(18px, 2vw, 28px)' }} />
                </button>

                {/* Right edge arrow */}
                <button
                    onClick={next}
                    className="absolute top-1/2 -translate-y-1/2 border-none outline-none cursor-pointer flex items-center justify-center rounded-full pointer-events-auto"
                    style={{
                        right: 'clamp(10px, 1.2%, 20px)',
                        width: 'clamp(36px, 3.5vw, 52px)',
                        height: 'clamp(36px, 3.5vw, 52px)',
                        color: current === total - 1 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.7)',
                        background: 'rgba(255,255,255,0.06)',
                        backdropFilter: 'blur(4px)',
                        transition: 'all 300ms',
                    }}
                    onMouseEnter={(e) => {
                        if (current < total - 1) {
                            e.currentTarget.style.color = 'rgba(255,255,255,0.95)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = current === total - 1 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.7)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    }}
                    aria-label="Next slide"
                >
                    <ChevronRight style={{ width: 'clamp(18px, 2vw, 28px)', height: 'clamp(18px, 2vw, 28px)' }} />
                </button>

                {/* Bottom bar */}
                <div className="absolute bottom-0 left-0 right-0 pb-[3%] px-[5.2%] flex items-center justify-between pointer-events-auto">
                    {/* Slide counter */}
                    <span
                        style={{
                            fontSize: 'clamp(11px, 0.9vw, 13px)',
                            color: 'rgba(255,255,255,0.5)',
                            fontVariantNumeric: 'tabular-nums',
                            minWidth: '50px',
                        }}
                    >
                        {current + 1} / {total}
                    </span>

                    {/* Progress dots */}
                    <div className="flex items-center" style={{ gap: 'clamp(4px, 0.5vw, 8px)' }}>
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className="border-none outline-none cursor-pointer"
                                style={{
                                    width: i === current ? 'clamp(18px, 2vw, 24px)' : '6px',
                                    height: '6px',
                                    borderRadius: '3px',
                                    backgroundColor:
                                        i === current ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                                    transition: 'all 300ms ease',
                                    padding: 0,
                                }}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>

                    {/* Fullscreen */}
                    <div style={{ minWidth: '50px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={toggleFullscreen}
                            className="border-none outline-none cursor-pointer flex items-center justify-center rounded-md mobile-hide"
                            style={{
                                color: 'rgba(255,255,255,0.5)',
                                background: 'transparent',
                                padding: 'clamp(4px, 0.4vw, 8px)',
                                transition: 'all 200ms',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                                e.currentTarget.style.background = 'transparent';
                            }}
                            aria-label="Toggle fullscreen"
                        >
                            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
