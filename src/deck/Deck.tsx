import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { FooterBand } from '../ds';
import { SlideContext } from './slideContext';

export interface SlideDef {
    id: string;
    title: string;
    theme: 'paper' | 'navy';
    bleed?: boolean;
    render: () => ReactElement;
}

// Stable context values, so slides re-render only when they come and go.
const ACTIVE = [
    { active: true, reader: false },
    { active: true, reader: true },
];
const IDLE = [
    { active: false, reader: false },
    { active: false, reader: true },
];

const STAGE_W = 1440;
const STAGE_H = 810;

function useMedia(query: string) {
    const [match, setMatch] = useState(() => window.matchMedia(query).matches);
    useEffect(() => {
        const mq = window.matchMedia(query);
        const on = () => setMatch(mq.matches);
        mq.addEventListener('change', on);
        return () => mq.removeEventListener('change', on);
    }, [query]);
    return match;
}

function indexFromHash(total: number) {
    const n = parseInt(window.location.hash.replace('#', ''), 10);
    return Number.isFinite(n) && n >= 1 && n <= total ? n - 1 : 0;
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
    return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
                d={dir === 'left' ? 'M10 3.5 5.5 8l4.5 4.5' : 'M6 3.5 10.5 8 6 12.5'}
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="square"
            />
        </svg>
    );
}

/**
 * The deck shell: a 1440 × 810 stage scaled to fit, the navy footer band with
 * position and controls, keyboard, swipe and hash navigation (/deck/#5 opens
 * slide 5). On phones in portrait it becomes a scrolling reader.
 */
export default function Deck({ slides }: { slides: SlideDef[] }) {
    const total = slides.length;
    const [current, setCurrent] = useState(() => indexFromHash(total));
    const [scale, setScale] = useState(1);
    const reader = useMedia('(max-width: 760px), (max-aspect-ratio: 4/5)');
    const deckRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);

    const go = useCallback(
        (i: number) => {
            const next = Math.max(0, Math.min(total - 1, i));
            setCurrent(next);
            window.history.replaceState(null, '', `#${next + 1}`);
        },
        [total],
    );

    // The deck box is the screen's safe area (deck.css), so the slide stays clear of a phone's notch and home bar.
    useLayoutEffect(() => {
        const el = deckRef.current;
        if (reader || !el) return;
        const fit = () => setScale(Math.min(el.clientWidth / STAGE_W, el.clientHeight / STAGE_H));
        fit();
        const ro = new ResizeObserver(fit);
        ro.observe(el);
        return () => ro.disconnect();
    }, [reader]);

    // Only the stage locks the page: the reader must always scroll, whatever happens to this script.
    useEffect(() => {
        document.body.classList.toggle('deck-body--stage', !reader);
        document.body.classList.toggle('deck-body--reader', reader);
    }, [reader]);

    useEffect(() => {
        const onHash = () => setCurrent(indexFromHash(total));
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
    }, [total]);

    useEffect(() => {
        if (reader) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                case 'PageDown':
                case ' ':
                    e.preventDefault();
                    go(current + 1);
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                case 'PageUp':
                    e.preventDefault();
                    go(current - 1);
                    break;
                case 'Home':
                    go(0);
                    break;
                case 'End':
                    go(total - 1);
                    break;
                case 'f':
                case 'F':
                    if (document.fullscreenElement) document.exitFullscreen();
                    else document.documentElement.requestFullscreen?.();
                    break;
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [current, go, reader, total]);

    // Horizontal swipe on touch screens that are wide enough for stage mode (tablets).
    useEffect(() => {
        const el = stageRef.current;
        if (!el || reader) return;
        let x0 = 0;
        let y0 = 0;
        const start = (e: TouchEvent) => {
            x0 = e.touches[0].clientX;
            y0 = e.touches[0].clientY;
        };
        const end = (e: TouchEvent) => {
            const dx = e.changedTouches[0].clientX - x0;
            const dy = e.changedTouches[0].clientY - y0;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(current + (dx < 0 ? 1 : -1));
        };
        el.addEventListener('touchstart', start, { passive: true });
        el.addEventListener('touchend', end, { passive: true });
        return () => {
            el.removeEventListener('touchstart', start);
            el.removeEventListener('touchend', end);
        };
    }, [current, go, reader]);

    const position = `${String(current + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

    return (
        <div ref={deckRef} className={`deck${reader ? ' deck--reader' : ''}`}>
            <div
                ref={stageRef}
                className="deck-stage"
                style={reader ? undefined : { transform: `translate(-50%, -50%) scale(${scale})` }}
                aria-roledescription="slide deck"
            >
                {slides.map((s, i) => (
                    <section
                        key={s.id}
                        data-theme={s.theme}
                        data-slide={i + 1}
                        className={`deck-slide${i === current ? ' deck-slide--current' : ''}${s.bleed ? ' deck-slide--bleed' : ''}`}
                        aria-roledescription="slide"
                        aria-label={`${i + 1} of ${total}: ${s.title}`}
                        aria-hidden={!reader && i !== current}
                    >
                        <SlideContext.Provider value={i === current ? ACTIVE[reader ? 1 : 0] : IDLE[reader ? 1 : 0]}>{s.render()}</SlideContext.Provider>
                    </section>
                ))}
                <div className="deck-chrome">
                    {!reader && <div className="deck-progress" style={{ width: `${((current + 1) / total) * 100}%` }} />}
                    <FooterBand
                        left={
                            <>
                                <img className="deck-logo" src="/brand/mirdyne-lockup-white.png" alt="Mirdyne" width={355} height={97} />
                                <a className="deck-law" href="/impressum/">
                                    Impressum
                                </a>
                                <a className="deck-law" href="/privacy/">
                                    Privacy
                                </a>
                            </>
                        }
                        right={
                            reader ? (
                                'Investor room'
                            ) : (
                                <span className="deck-controls">
                                    <span aria-live="polite">{position}</span>
                                    <button
                                        type="button"
                                        className="deck-btn"
                                        onClick={() => go(current - 1)}
                                        disabled={current === 0}
                                        aria-label="Previous slide"
                                    >
                                        <Chevron dir="left" />
                                    </button>
                                    <button
                                        type="button"
                                        className="deck-btn"
                                        onClick={() => go(current + 1)}
                                        disabled={current === total - 1}
                                        aria-label="Next slide"
                                    >
                                        <Chevron dir="right" />
                                    </button>
                                </span>
                            )
                        }
                    />
                </div>
            </div>
        </div>
    );
}
