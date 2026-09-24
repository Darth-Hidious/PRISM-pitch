import { useEffect, useRef } from 'react';

/**
 * Slow-moving nebula with a faint crystal lattice, drawn with a single WebGL
 * fragment shader (no three.js, so the page stays light). Pauses when off
 * screen or in a background tab, and draws one still frame when the visitor
 * prefers reduced motion. If WebGL is unavailable the canvas stays empty and
 * the parent's CSS gradient shows through.
 */

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
    return v;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    float t = uTime * 0.03;

    vec2 q = vec2(fbm(uv * 1.4 + t), fbm(uv * 1.4 - t + 3.1));
    float n = fbm(uv * 2.0 + 2.2 * q + vec2(t * 0.5, -t * 0.3));

    vec3 col = vec3(0.012, 0.016, 0.028);
    col += vec3(0.09, 0.16, 0.30) * smoothstep(0.35, 0.95, n);
    col += vec3(0.42, 0.30, 0.12) * pow(smoothstep(0.55, 1.0, n), 3.0) * 0.55;

    vec2 g = uv * 16.0;
    vec2 cell = floor(g);
    float d = length(fract(g) - 0.5);
    float pick = hash(cell);
    float twinkle = 0.25 + 0.25 * sin(uTime * 0.6 + pick * 40.0);
    col += vec3(0.62, 0.78, 1.0) * smoothstep(0.07, 0.0, d) * step(0.92, pick) * twinkle * smoothstep(0.3, 0.8, n);

    col *= smoothstep(1.5, 0.15, length(uv * vec2(0.9, 1.2)));
    gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

export default function NebulaCanvas({ className = '' }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
        if (!gl) return;

        const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
        const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
        const program = gl.createProgram();
        if (!vs || !fs || !program) return;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
        gl.useProgram(program);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const aPos = gl.getAttribLocation(program, 'aPos');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
        const uRes = gl.getUniformLocation(program, 'uRes');
        const uTime = gl.getUniformLocation(program, 'uTime');

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        // Render below device resolution: the image is soft by design and this keeps phones cool.
        const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.6;

        const resize = () => {
            const w = Math.max(1, Math.round(canvas.clientWidth * scale));
            const h = Math.max(1, Math.round(canvas.clientHeight * scale));
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                gl.viewport(0, 0, w, h);
            }
        };

        const start = performance.now();
        const draw = (now: number) => {
            resize();
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform1f(uTime, reduceMotion ? 40 : (now - start) / 1000 + 40);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        };

        let frame = 0;
        let visible = true;
        const loop = (now: number) => {
            draw(now);
            frame = requestAnimationFrame(loop);
        };
        const run = () => {
            cancelAnimationFrame(frame);
            if (reduceMotion) {
                frame = requestAnimationFrame(draw);
            } else if (visible && !document.hidden) {
                frame = requestAnimationFrame(loop);
            }
        };

        const observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            run();
        });
        observer.observe(canvas);
        const onVisibility = () => run();
        document.addEventListener('visibilitychange', onVisibility);
        const onResize = () => {
            if (reduceMotion) run();
        };
        window.addEventListener('resize', onResize);
        run();

        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('resize', onResize);
            gl.getExtension('WEBGL_lose_context')?.loseContext();
        };
    }, []);

    return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
