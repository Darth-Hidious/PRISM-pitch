import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { drawGrain, drawStroke, planPainting, type PaintOptions } from './paint';

/**
 * A photograph repainted as brush strokes in the browser. The strokes are laid
 * on over about two seconds the first time it enters the viewport, or all at
 * once under reduced motion. The source photograph stays the accessible
 * image: give `alt` as you would for the photo itself.
 */
export default function Painting({
    src,
    source,
    alt,
    className,
    style,
    animate = true,
    ...opts
}: {
    /** A photograph to repaint (same origin, or served with CORS). */
    src?: string;
    /** Or a scene drawn in code: returns a canvas of the requested size. */
    source?: (width: number, height: number) => HTMLCanvasElement;
    alt: string;
    className?: string;
    style?: CSSProperties;
    animate?: boolean;
} & PaintOptions) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [size, setSize] = useState<{ w: number; h: number } | null>(null);
    const [visible, setVisible] = useState(false);
    const [done, setDone] = useState(false);
    const { seed, direction, motion, detail, focusX, focusY } = opts;

    // Track the box size (debounced) so the painting is planned at the size it is shown.
    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        let t: ReturnType<typeof setTimeout> | undefined;
        const measure = () => {
            const r = el.getBoundingClientRect();
            if (r.width < 2 || r.height < 2) return;
            setSize((prev) => {
                const w = Math.round(r.width);
                const h = Math.round(r.height);
                if (prev && Math.abs(prev.w - w) < 24 && Math.abs(prev.h - h) < 24) return prev;
                return { w, h };
            });
        };
        measure();
        const ro = new ResizeObserver(() => {
            clearTimeout(t);
            t = setTimeout(measure, 180);
        });
        ro.observe(el);
        return () => {
            clearTimeout(t);
            ro.disconnect();
        };
    }, []);

    // Start painting when it first comes near the viewport.
    useEffect(() => {
        const el = wrapRef.current;
        if (!el || visible) return;
        const io = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    setVisible(true);
                    io.disconnect();
                }
            },
            { rootMargin: '200px' },
        );
        io.observe(el);
        return () => io.disconnect();
    }, [visible]);

    useEffect(() => {
        if (!size || !visible) return;
        let cancelled = false;
        let raf = 0;
        const paint = (img: CanvasImageSource & { width: number; height: number }) => {
            if (cancelled) return;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const W = Math.round(size.w * dpr);
            const H = Math.round(size.h * dpr);
            canvas.width = W;
            canvas.height = H;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const plan = planPainting(img, W, H, { seed, direction, motion, detail, focusX, focusY });
            ctx.drawImage(plan.base, 0, 0);
            const queue = plan.layers.flat();
            const still = !animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const finish = () => {
                drawGrain(ctx, W, H, seed ?? 7);
                setDone(true);
            };
            if (still) {
                for (const s of queue) drawStroke(ctx, s);
                finish();
                return;
            }
            // Spread the strokes over ~1.8 s, whatever the device manages per frame.
            const start = performance.now();
            let drawn = 0;
            const tick = () => {
                if (cancelled) return;
                const t = Math.min(1, (performance.now() - start) / 1800);
                const eased = 1 - Math.pow(1 - t, 2.2);
                const target = Math.floor(queue.length * eased);
                while (drawn < target) drawStroke(ctx, queue[drawn++]);
                if (t < 1) raf = requestAnimationFrame(tick);
                else {
                    while (drawn < queue.length) drawStroke(ctx, queue[drawn++]);
                    finish();
                }
            };
            raf = requestAnimationFrame(tick);
        };
        if (source) {
            // Procedural scenes are drawn at the box's CSS size; the painter resamples anyway.
            paint(source(Math.max(2, Math.round(size.w)), Math.max(2, Math.round(size.h))));
        } else if (src) {
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => paint(img);
            img.src = src;
        }
        return () => {
            cancelled = true;
            cancelAnimationFrame(raf);
        };
    }, [size, visible, src, source, animate, seed, direction, motion, detail, focusX, focusY]);

    return (
        <div
            ref={wrapRef}
            className={['pm-painting', done && 'pm-painting--done', className].filter(Boolean).join(' ')}
            style={style}
            data-painting-done={done ? 'true' : undefined}
        >
            <canvas ref={canvasRef} role="img" aria-label={alt} />
        </div>
    );
}
