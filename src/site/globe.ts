/**
 * A globe for the live painter: NASA's Blue Marble wrapped on a sphere in
 * WebGL, lit from the upper left, with an atmosphere, turning from the
 * Americas to Europe as the page scrolls. The EU and ESA member states light
 * up at the end. The frame is drawn into the painter's scene canvas, so the
 * painter turns it into paint like any photograph.
 */
import type { LiveScene } from '../ds/livepaint';
import { EUROPE } from './europe-outline';

/** Giessen, where PRISM is built. */
const GIESSEN = { lat: 50.584, lon: 8.678 };

/** The section sets `progress` (0 to 1 through its scroll); the scene eases towards it. */
export const globeState: { progress: () => number; eased: number; at: number } = { progress: () => 0, eased: 0, at: 0 };

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform sampler2D uEarth;
uniform sampler2D uMask;
uniform vec2 uRes;
uniform vec2 uCenter;
uniform float uRadius;
uniform mat3 uRot;
uniform float uHi;
uniform float uLod;
uniform vec3 uSun;
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}
vec2 texUv(vec3 w) {
    float lon = atan(w.x, w.z);
    float lat = asin(clamp(w.y, -1.0, 1.0));
    return vec2(lon / 6.28318531 + 0.5, 0.5 - lat / 3.14159265);
}
void main() {
    vec2 px = vUv * uRes;
    vec2 d = (px - uCenter) / uRadius;
    float r = length(d);
    vec3 space = mix(vec3(0.008, 0.026, 0.062), vec3(0.028, 0.066, 0.13), vUv.y);
    vec2 cell = floor(px / 2.5);
    space += vec3(0.75, 0.82, 1.0) * step(0.9982, hash(cell)) * (0.35 + 0.65 * hash(cell + 7.0));
    // The atmosphere, a thin blue haze around the limb.
    float halo = exp(-max(r - 1.0, 0.0) * 16.0) * smoothstep(0.985, 1.0, r);
    vec3 outside = space + vec3(0.3, 0.52, 1.0) * halo * 0.7;
    if (r >= 1.0) {
        o = vec4(outside, 1.0);
        return;
    }
    vec3 n = vec3(d, sqrt(max(0.0, 1.0 - r * r)));
    vec2 uv = texUv(uRot * n);
    vec3 earth = textureLod(uEarth, uv, uLod).rgb;
    float m = texture(uMask, uv).r;
    float e = 0.0005;
    float mx = texture(uMask, uv + vec2(e, 0.0)).r - texture(uMask, uv - vec2(e, 0.0)).r;
    float my = texture(uMask, uv + vec2(0.0, e * 2.0)).r - texture(uMask, uv - vec2(0.0, e * 2.0)).r;
    float edge = smoothstep(0.12, 0.5, length(vec2(mx, my)));
    float sun = dot(n, normalize(uSun));
    float day = smoothstep(-0.12, 0.4, sun);
    vec3 col = earth * (0.16 + 1.0 * day);
    // Europe: lifted and warmed, the rest of the world dimmed, the borders traced.
    col = mix(col, col * 1.16 + vec3(0.045, 0.032, 0.0), m * uHi);
    col *= mix(1.0, 0.7, (1.0 - m) * uHi);
    col = mix(col, vec3(1.0, 0.9, 0.74), edge * uHi * 0.55);
    float fres = pow(1.0 - n.z, 2.6);
    col += vec3(0.26, 0.46, 1.0) * fres * (0.25 + 0.45 * day);
    float aa = smoothstep(1.0, 1.0 - 1.6 / uRadius, r);
    o = vec4(mix(outside, col, aa), 1.0);
}`;

/** Europe's outlines rasterised to an equirectangular mask, softened a little. */
function europeMask() {
    const W = 2048;
    const H = 1024;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    ctx.filter = 'blur(0.6px)';
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    for (const ring of EUROPE) {
        for (let i = 0; i < ring.length; i += 2) {
            const x = ((ring[i] + 180) / 360) * W;
            const y = ((90 - ring[i + 1]) / 180) * H;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
    }
    ctx.fill('evenodd');
    return c;
}

type Rot = { m: Float32Array; toView: (lat: number, lon: number) => [number, number, number] };

/** Rotation taking view space (x right, y up, z to the viewer) to the globe, centred on lon0, lat0. */
function rotation(lon0: number, lat0: number): Rot {
    const a = (lon0 * Math.PI) / 180;
    const b = (-lat0 * Math.PI) / 180;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const cb = Math.cos(b);
    const sb = Math.sin(b);
    // R = Ry(a) · Rx(b), row-major.
    const R = [
        [ca, sa * sb, sa * cb],
        [0, cb, -sb],
        [-sa, ca * sb, ca * cb],
    ];
    const m = new Float32Array([R[0][0], R[1][0], R[2][0], R[0][1], R[1][1], R[2][1], R[0][2], R[1][2], R[2][2]]);
    const toView = (lat: number, lon: number): [number, number, number] => {
        const la = (lat * Math.PI) / 180;
        const lo = (lon * Math.PI) / 180;
        const w = [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
        // Inverse of a rotation is its transpose.
        return [
            R[0][0] * w[0] + R[1][0] * w[1] + R[2][0] * w[2],
            R[0][1] * w[0] + R[1][1] * w[1] + R[2][1] * w[2],
            R[0][2] * w[0] + R[1][2] * w[1] + R[2][2] * w[2],
        ];
    };
    return { m, toView };
}

class GlobeRenderer {
    readonly canvas = document.createElement('canvas');
    private gl: WebGL2RenderingContext;
    private prog: WebGLProgram;
    private u: Record<string, WebGLUniformLocation | null> = {};
    private earth: WebGLTexture | null = null;
    private mask: WebGLTexture;

    constructor() {
        const gl = this.canvas.getContext('webgl2', { alpha: false, antialias: false, preserveDrawingBuffer: true });
        if (!gl) throw new Error('webgl2');
        this.gl = gl;
        const sh = (type: number, src: string) => {
            const s = gl.createShader(type)!;
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
            return s;
        };
        const p = gl.createProgram()!;
        gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT));
        gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FRAG));
        gl.bindAttribLocation(p, 0, 'aPos');
        gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link');
        this.prog = p;
        for (const n of ['uEarth', 'uMask', 'uRes', 'uCenter', 'uRadius', 'uRot', 'uHi', 'uLod', 'uSun']) this.u[n] = gl.getUniformLocation(p, n);
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        this.mask = this.texture(europeMask(), false);
    }

    private texture(src: TexImageSource, mip: boolean) {
        const gl = this.gl;
        const t = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, src);
        if (mip) gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return t;
    }

    render(img: HTMLImageElement, w: number, h: number, cx: number, cy: number, radius: number, rot: Rot, hi: number) {
        const gl = this.gl;
        if (!this.earth) this.earth = this.texture(img, true);
        if (this.canvas.width !== w || this.canvas.height !== h) {
            this.canvas.width = w;
            this.canvas.height = h;
        }
        gl.viewport(0, 0, w, h);
        gl.useProgram(this.prog);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.earth);
        gl.uniform1i(this.u.uEarth, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.mask);
        gl.uniform1i(this.u.uMask, 1);
        gl.uniform2f(this.u.uRes, w, h);
        gl.uniform2f(this.u.uCenter, cx, h - cy);
        gl.uniform1f(this.u.uRadius, radius);
        gl.uniformMatrix3fv(this.u.uRot, false, rot.m);
        gl.uniform1f(this.u.uHi, hi);
        // Texels per pixel at the centre of the disc; above 1 the texture is minified.
        gl.uniform1f(this.u.uLod, Math.max(0, Math.log2(img.naturalWidth / 2 / (Math.PI * radius))));
        gl.uniform3f(this.u.uSun, -0.55, 0.5, 0.67);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        return this.canvas;
    }
}

let renderer: GlobeRenderer | null = null;

const smooth = (x: number) => {
    const c = Math.min(1, Math.max(0, x));
    return c * c * (3 - 2 * c);
};

/** The globe's pose at scroll progress `p`: where it faces, how large it is, how lit Europe is. */
export function globePose(p: number) {
    const turn = smooth(p / 0.62);
    return {
        lon: -95 + (12 - -95) * turn,
        lat: 8 + (49 - 8) * turn,
        zoom: 1 + 1.3 * smooth((p - 0.2) / 0.45),
        hi: smooth((p - 0.52) / 0.24),
    };
}

export const globeScene: LiveScene = {
    images: ['/img/earth-blue-marble.webp'],
    animated: true,
    direction: -10,
    brush: 0.85,
    detail: 0.7,
    draw(ctx, w, h, t, [img]) {
        if (!img) return;
        // Ease towards the scroll position by wall-clock time, so a fast scroll still turns the globe
        // smoothly, and a painter that only repaints on scroll lands exactly where the page is.
        const target = globeState.progress();
        const now = performance.now();
        const dt = globeState.at ? now - globeState.at : 1e4;
        globeState.at = now;
        const k = dt > 500 ? 1 : 1 - Math.exp(-dt / 160);
        globeState.eased += (target - globeState.eased) * k;
        if (Math.abs(target - globeState.eased) < 0.0005) globeState.eased = target;
        const pose = globePose(globeState.eased);
        const wide = w >= h;
        const base = wide ? Math.min(w, h) * 0.4 : w * 0.44;
        const radius = base * pose.zoom;
        const cx = wide ? w * 0.64 : w * 0.5;
        const cy = wide ? h * 0.52 : h * 0.66;
        const rot = rotation(pose.lon, pose.lat);
        try {
            renderer ??= new GlobeRenderer();
            ctx.drawImage(renderer.render(img, w, h, cx, cy, radius, rot, pose.hi), 0, 0, w, h);
        } catch {
            ctx.fillStyle = '#061832';
            ctx.fillRect(0, 0, w, h);
            return;
        }
        // Giessen, once Europe is lit.
        if (pose.hi > 0.02) {
            const [x, y, z] = rot.toView(GIESSEN.lat, GIESSEN.lon);
            if (z > 0) {
                const px = cx + x * radius;
                const py = cy - y * radius;
                const pulse = (t % 2.4) / 2.4;
                const s = Math.max(1, radius / 220);
                ctx.globalCompositeOperation = 'lighter';
                const g = ctx.createRadialGradient(px, py, 0, px, py, 8 * s);
                g.addColorStop(0, `rgba(255,236,200,${0.55 * pose.hi})`);
                g.addColorStop(1, 'rgba(255,190,120,0)');
                ctx.fillStyle = g;
                ctx.fillRect(px - 8 * s, py - 8 * s, 16 * s, 16 * s);
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = `rgba(255,226,190,${0.8 * pose.hi * (1 - pulse)})`;
                ctx.lineWidth = 1.2 * s;
                ctx.beginPath();
                ctx.arc(px, py, (3 + 14 * pulse) * s, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = `rgba(255,255,255,${pose.hi})`;
                ctx.beginPath();
                ctx.arc(px, py, 1.8 * s, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },
};
