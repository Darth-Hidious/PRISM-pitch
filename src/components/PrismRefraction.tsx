import { useEffect, useRef } from 'react';

/*
  Physics-based prism refraction — Dark Side of the Moon style.
  Uses explicit equilateral triangle geometry (not the degenerate trapezoid).
  200 wavelength-mapped lasers refract through the prism → rainbow dispersion.
*/

// Convert wavelength (nm) → rgba color
function wavelengthToColor(wl: number): string {
    let R = 0, G = 0, B = 0, alpha = 1;
    if (wl >= 380 && wl < 440) { R = -(wl - 440) / (440 - 380); G = 0; B = 1; }
    else if (wl >= 440 && wl < 490) { R = 0; G = (wl - 440) / (490 - 440); B = 1; }
    else if (wl >= 490 && wl < 510) { R = 0; G = 1; B = -(wl - 510) / (510 - 490); }
    else if (wl >= 510 && wl < 580) { R = (wl - 510) / (580 - 510); G = 1; B = 0; }
    else if (wl >= 580 && wl < 645) { R = 1; G = -(wl - 645) / (645 - 580); B = 0; }
    else if (wl >= 645 && wl <= 780) { R = 1; G = 0; B = 0; }
    if (wl > 780 || wl < 380) alpha = 0;
    else if (wl > 700) alpha = (780 - wl) / (780 - 700);
    else if (wl < 420) alpha = (wl - 380) / (420 - 380);
    return `rgba(${Math.round(R * 255)},${Math.round(G * 255)},${Math.round(B * 255)},${alpha})`;
}

interface Vec2 { x: number; y: number }
interface Edge { a: Vec2; b: Vec2; normal: Vec2 }

/** Equilateral triangle prism with clean edge-based intersection */
class TrianglePrism {
    verts: [Vec2, Vec2, Vec2]; // apex, bottom-left, bottom-right
    edges: Edge[];

    constructor(cx: number, cy: number, size: number) {
        const h = size * Math.sqrt(3) / 2;
        // Apex at top, base at bottom — centered at (cx, cy)
        this.verts = [
            { x: cx, y: cy - h * 0.55 },                   // apex (top)
            { x: cx - size / 2, y: cy + h * 0.45 },        // bottom-left
            { x: cx + size / 2, y: cy + h * 0.45 },        // bottom-right
        ];

        // Build edges with outward normals
        this.edges = [];
        for (let i = 0; i < 3; i++) {
            const a = this.verts[i];
            const b = this.verts[(i + 1) % 3];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy);
            // Outward normal (right-hand rule for CW winding)
            this.edges.push({ a, b, normal: { x: dy / len, y: -dx / len } });
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.verts[0].x, this.verts[0].y);
        ctx.lineTo(this.verts[1].x, this.verts[1].y);
        ctx.lineTo(this.verts[2].x, this.verts[2].y);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.02)';
        ctx.fill();
    }

    /** Is point inside the triangle (using cross-product signs) */
    isInside(p: Vec2): boolean {
        const [a, b, c] = this.verts;
        const d1 = (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
        const d2 = (p.x - c.x) * (b.y - c.y) - (b.x - c.x) * (p.y - c.y);
        const d3 = (p.x - a.x) * (c.y - a.y) - (c.x - a.x) * (p.y - a.y);
        const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
        const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
        return !(hasNeg && hasPos);
    }

    /** Ray-edge intersection: returns closest hit in front of ray origin */
    intersect(ox: number, oy: number, dx: number, dy: number, minT: number = 0.5): { x: number; y: number; edge: Edge; t: number } | null {
        let best: { x: number; y: number; edge: Edge; t: number } | null = null;
        for (const edge of this.edges) {
            const ex = edge.b.x - edge.a.x;
            const ey = edge.b.y - edge.a.y;
            const denom = dx * ey - dy * ex;
            if (Math.abs(denom) < 1e-10) continue;
            const t = ((edge.a.x - ox) * ey - (edge.a.y - oy) * ex) / denom;
            const u = ((edge.a.x - ox) * dy - (edge.a.y - oy) * dx) / denom;
            if (t > minT && u >= 0 && u <= 1) {
                if (!best || t < best.t) {
                    best = { x: ox + dx * t, y: oy + dy * t, edge, t };
                }
            }
        }
        return best;
    }
}

/** Apply Snell's law at a surface */
function snellRefract(
    dx: number, dy: number,
    nx: number, ny: number,
    n1: number, n2: number
): { dx: number; dy: number } | null {
    // Ensure normal points against incoming ray
    let dot = dx * nx + dy * ny;
    let nnx = nx, nny = ny;
    let ratio = n1 / n2;
    if (dot > 0) { nnx = -nx; nny = -ny; dot = -dot; ratio = n2 / n1; }

    const sin2t = ratio * ratio * (1 - dot * dot);
    if (sin2t > 1) return null; // Total internal reflection

    const cost = Math.sqrt(1 - sin2t);
    return {
        dx: ratio * dx + (ratio * (-dot) - cost) * nnx,
        dy: ratio * dy + (ratio * (-dot) - cost) * nny,
    };
}

export default function PrismRefraction() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;
        let blurApplied = false;
        const startTime = Date.now();

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const w = container.clientWidth;
            const h = container.clientHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        resize();
        window.addEventListener('resize', resize);

        const LASER_COUNT = 200;

        const draw = () => {
            const W = container.clientWidth;
            const H = container.clientHeight;
            const elapsed = (Date.now() - startTime) / 1000;

            // Animation progress
            const beamProgress = Math.min(elapsed / 2.5, 1);
            const dispersionProgress = Math.max(0, Math.min((elapsed - 1.5) / 2, 1));

            // Equilateral prism — proper triangle
            const prismSize = Math.min(W, H) * 0.3;
            const prism = new TrianglePrism(W * 0.5, H * 0.5, prismSize);

            // Source point — left of screen
            const sourceX = W * 0.05;
            const sourceY = H * 0.5;

            // Target: center of the left edge (apex → bottom-left)
            const leftEdge = prism.edges[0]; // apex → bottom-left
            const targetX = (leftEdge.a.x + leftEdge.b.x) / 2;
            const targetY = (leftEdge.a.y + leftEdge.b.y) / 2;
            const baseAngle = Math.atan2(targetY - sourceY, targetX - sourceX);

            // Clear
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, W, H);

            // Draw lasers
            const visibleCount = Math.floor(LASER_COUNT * beamProgress);
            for (let i = 0; i < visibleCount; i++) {
                const wavelength = 380 + (400 * i) / LASER_COUNT;
                // Slight angle spread for the incoming beam (tight)
                const spreadAngle = baseAngle + (i - LASER_COUNT / 2) * 0.00005;

                let rx = sourceX;
                let ry = sourceY;
                let rdx = Math.cos(spreadAngle);
                let rdy = Math.sin(spreadAngle);

                // Wavelength-dependent refractive index (Cauchy dispersion)
                const n = 1.5 + 0.004 / ((wavelength / 1000) * (wavelength / 1000));

                let bounces = 0;
                const maxBounces = 4;

                while (bounces < maxBounces) {
                    const hit = prism.intersect(rx, ry, rdx, rdy);
                    if (!hit) break;

                    // Draw segment
                    const isOutside = !prism.isInside({ x: rx + rdx * 0.01, y: ry + rdy * 0.01 });
                    ctx.strokeStyle = isOutside
                        ? `rgba(255,255,255,${0.7 * beamProgress})`
                        : wavelengthToColor(wavelength);
                    ctx.lineWidth = isOutside ? 1.5 : 1;
                    ctx.globalAlpha = isOutside ? beamProgress : Math.max(beamProgress * 0.5, dispersionProgress);
                    ctx.beginPath();
                    ctx.moveTo(rx, ry);
                    ctx.lineTo(hit.x, hit.y);
                    ctx.stroke();

                    // Refract at surface
                    const entering = !prism.isInside({ x: rx + rdx * 0.5, y: ry + rdy * 0.5 });
                    const refracted = snellRefract(
                        rdx, rdy,
                        hit.edge.normal.x, hit.edge.normal.y,
                        entering ? 1 : n,
                        entering ? n : 1,
                    );

                    if (!refracted) {
                        // Total internal reflection
                        const dotN = rdx * hit.edge.normal.x + rdy * hit.edge.normal.y;
                        rdx = rdx - 2 * dotN * hit.edge.normal.x;
                        rdy = rdy - 2 * dotN * hit.edge.normal.y;
                    } else {
                        rdx = refracted.dx;
                        rdy = refracted.dy;
                    }

                    rx = hit.x;
                    ry = hit.y;
                    bounces++;
                }

                // Final ray to edge of screen (dispersed rainbow)
                if (bounces > 0) {
                    const extendLen = Math.max(W, H) * 2;
                    ctx.strokeStyle = wavelengthToColor(wavelength);
                    ctx.lineWidth = 1;
                    ctx.globalAlpha = dispersionProgress;
                    ctx.beginPath();
                    ctx.moveTo(rx, ry);
                    ctx.lineTo(rx + rdx * extendLen, ry + rdy * extendLen);
                    ctx.stroke();
                }

                ctx.globalAlpha = 1;
            }

            // Draw prism outline on top
            ctx.globalAlpha = Math.min(beamProgress * 2, 1);
            prism.render(ctx);
            ctx.globalAlpha = 1;

            // Apply backdrop blur after animation settles
            if (!blurApplied && elapsed > 5) {
                blurApplied = true;
                if (container) {
                    container.style.transition = 'filter 3s ease-out';
                    container.style.filter = 'blur(30px) brightness(0.5)';
                }
            }

            animId = requestAnimationFrame(draw);
        };

        animId = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 z-0">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
}
