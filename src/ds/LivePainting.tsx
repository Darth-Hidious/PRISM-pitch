import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { LivePainter, loadImage, type LiveScene } from './livepaint';
import Painting from './Painting';
import type { PaintOptions } from './paint';

let SUPPORTED: boolean | null = null;
/** Live on a real GPU; `?paint=live` forces it on a software renderer, for testing. */
const supported = () =>
    (SUPPORTED ??=
        typeof window !== 'undefined' &&
        (() => {
            const s = LivePainter.support();
            return s === 'gpu' || (s === 'software' && new URLSearchParams(window.location.search).get('paint') === 'live');
        })());

/** Frames per second for moving scenes; the painted look does not need more. */
const FPS = 30;
const MAX_PIXELS = 1.6e6;

/**
 * A scene painted live on the GPU (see livepaint.ts).
 *
 * `reveal` decides how the painting resolves from noise: `scroll` ties it to
 * the element's position (resolved once its top has travelled three quarters
 * of the viewport, and back to noise if you scroll away), `load` resolves it
 * once, over about two seconds. Changing `scene` dissolves the painting to
 * noise and resolves the new one.
 *
 * Photographs load when the painting comes within a screen and a half of the
 * viewport; it draws at 30 fps only while on screen, and gives its GPU
 * context back when it is far away. On a device that cannot keep up it drops
 * resolution, then stops animating and repaints only on scroll. Under reduced
 * motion it paints one still frame. Without WebGL2 on a real GPU, or if the
 * context is lost, it falls back to the stroke painter.
 */
export default function LivePainting({
    scene,
    reveal = 'scroll',
    alt,
    className,
    style,
    fallback,
    poster = 2.5,
}: {
    scene: LiveScene;
    reveal?: 'scroll' | 'load';
    alt: string;
    className?: string;
    style?: CSSProperties;
    /** The stroke painter's input when WebGL2 is missing: a photograph, or the scene at `poster` seconds. */
    fallback?: { src?: string } & PaintOptions;
    /** The moment of the scene shown as a still (reduced motion and fallback), in seconds. */
    poster?: number;
}) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const [live, setLive] = useState(supported);
    const api = useRef<{ setScene: (s: LiveScene) => void } | null>(null);
    const sceneRef = useRef(scene);

    useEffect(() => {
        if (!live) return;
        const wrap = wrapRef.current;
        if (!wrap) return;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        // Still: paint on demand only (reduced motion, or a device too slow to animate).
        let still = reduce;
        let painter: LivePainter | null = null;
        let canvas: HTMLCanvasElement | null = null;
        let raf = 0;
        let near = false;
        let visible = false;
        let disposed = false;
        let quality = 1;
        const intervals: number[] = [];
        let last = 0;
        let loadStart = -1;
        const t0 = performance.now();
        // Scene state: what is painted, what is waiting, and the dissolve between them.
        let shown: LiveScene | null = null;
        let shownImages: HTMLImageElement[] = [];
        let next: { scene: LiveScene; images: HTMLImageElement[] | null } | null = null;
        let pending: LiveScene | null = sceneRef.current;
        let phase: 'idle' | 'out' | 'in' = 'idle';
        let phaseStart = 0;

        const measure = () => {
            const r = wrap.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * quality;
            let W = r.width * dpr;
            let H = r.height * dpr;
            const k = Math.min(1, Math.sqrt(MAX_PIXELS / Math.max(1, W * H)));
            W = Math.max(2, Math.round(W * k));
            H = Math.max(2, Math.round(H * k));
            return [W, H] as const;
        };

        const scrollReveal = () => {
            const r = wrap.getBoundingClientRect();
            const vh = window.innerHeight || 1;
            const x = Math.min(1, Math.max(0, (vh - r.top) / (0.75 * vh)));
            return x * x * (3 - 2 * x);
        };

        const load = (s: LiveScene) => {
            const target = { scene: s, images: null as HTMLImageElement[] | null };
            next = target;
            Promise.all((s.images ?? []).map(loadImage)).then(
                (imgs) => {
                    target.images = imgs;
                    schedule();
                },
                () => setLive(false),
            );
        };

        const release = () => {
            painter?.dispose();
            painter = null;
            canvas?.remove();
            canvas = null;
            // The shown scene is kept, so it comes straight back when the painter is rebuilt.
        };

        const frame = (now: number) => {
            raf = 0;
            if (disposed || !visible) return;
            if (!painter) {
                canvas = document.createElement('canvas');
                canvas.setAttribute('aria-hidden', 'true');
                wrap.appendChild(canvas);
                try {
                    painter = new LivePainter(canvas);
                } catch {
                    setLive(false);
                    return;
                }
                if (shown) painter.useScene(shown, shownImages);
            }
            if (painter.lost) {
                setLive(false);
                return;
            }
            // Swap in a waiting scene: at once if nothing is shown, else after dissolving to noise.
            if (next?.images && (!shown || still || (phase === 'out' && now - phaseStart >= 450))) {
                painter.useScene(next.scene, next.images);
                const first = !shown;
                shown = next.scene;
                shownImages = next.images;
                next = null;
                phase = first || still ? 'idle' : 'in';
                phaseStart = now;
            } else if (next && shown && phase !== 'out') {
                phase = 'out';
                phaseStart = now;
            }
            if (!shown) return;

            const [W, H] = measure();
            painter.resize(W, H);
            let r = 1;
            if (!still) {
                if (reveal === 'scroll') r = scrollReveal();
                else {
                    if (loadStart < 0) loadStart = now;
                    const x = Math.min(1, (now - loadStart) / 2400);
                    r = 1 - Math.pow(1 - x, 3);
                }
                if (phase === 'out') r *= 1 - Math.min(1, (now - phaseStart) / 450);
                if (phase === 'in') {
                    const x = Math.min(1, (now - phaseStart) / 1300);
                    r *= 1 - Math.pow(1 - x, 3);
                    if (x >= 1) phase = 'idle';
                }
            }
            const t = still ? poster : poster + (now - t0) / 1000;
            painter.render(t, r, Math.floor(now / 90), !still && !shown.animated);
            const rs = r.toFixed(2);
            if (wrap.dataset.reveal !== rs) wrap.dataset.reveal = rs;

            // Adapt quickly if the device cannot keep up: first fewer pixels, then no animation.
            if (last && !still) {
                intervals.push(now - last);
                if (intervals.length === 8) {
                    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                    intervals.length = 0;
                    if (avg > (1000 / FPS) * 2.2) {
                        if (quality > 0.3) quality = Math.max(0.3, quality * 0.6);
                        else if (avg > 150) still = true;
                    }
                }
            }
            last = now;
            if (!still) schedule(true);
        };

        const schedule = (paced = false) => {
            if (raf || disposed) return;
            if (!paced) {
                raf = requestAnimationFrame(frame);
                return;
            }
            const due = last + 1000 / FPS - 4;
            const wait = (now: number) => {
                raf = 0;
                if (!visible || disposed) return;
                if (now < due) raf = requestAnimationFrame(wait);
                else frame(now);
            };
            raf = requestAnimationFrame(wait);
        };

        api.current = {
            setScene: (s) => {
                if (!near) {
                    pending = s;
                    return;
                }
                load(s);
                schedule();
            },
        };

        // Near: load the photographs and keep the GPU context. Far: give the context back.
        const nearIo = new IntersectionObserver(
            ([e]) => {
                near = e.isIntersecting;
                if (near && pending) {
                    load(pending);
                    pending = null;
                }
                if (!near) release();
            },
            { rootMargin: '150% 0px' },
        );
        const viewIo = new IntersectionObserver(
            ([e]) => {
                visible = e.isIntersecting;
                if (visible) {
                    last = 0;
                    schedule();
                }
            },
            { rootMargin: '120px 0px' },
        );
        nearIo.observe(wrap);
        viewIo.observe(wrap);
        const ro = new ResizeObserver(() => schedule());
        ro.observe(wrap);
        // When still, scrolling still moves scroll-driven scenes such as the globe.
        const onScroll = () => {
            if (still && visible) schedule();
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            disposed = true;
            api.current = null;
            nearIo.disconnect();
            viewIo.disconnect();
            ro.disconnect();
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(raf);
            release();
        };
    }, [live, reveal, poster]);

    useEffect(() => {
        if (sceneRef.current === scene) return;
        sceneRef.current = scene;
        api.current?.setScene(scene);
    }, [scene]);

    if (!live) {
        const { src, ...opts } = fallback ?? {};
        return (
            <Painting
                className={className}
                style={style}
                alt={alt}
                src={src}
                source={src ? undefined : (w, h) => stillOf(scene, w, h, poster)}
                {...opts}
            />
        );
    }
    return (
        <div
            ref={wrapRef}
            className={['pm-painting', 'pm-painting--live', className].filter(Boolean).join(' ')}
            style={style}
            role="img"
            aria-label={alt}
        />
    );
}

/** One frame of a drawn scene, for the stroke painter. */
function stillOf(scene: LiveScene, w: number, h: number, t: number) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    if (ctx) scene.draw(ctx, w, h, t, []);
    return c;
}
