/**
 * Live painterly renderer on the GPU (WebGL2).
 *
 * Each frame a scene is drawn to a 2D canvas (a photograph, a drawing, or
 * both, and it may move), then painted by a chain of shaders:
 *
 *   1. the structure tensor of the colour gradients, smoothed, which gives
 *      every pixel the direction a brush would follow along the forms;
 *   2. an anisotropic Kuwahara filter (Kyprianidis et al. 2009, with the
 *      polynomial sector weights of 2010): each pixel takes the mean colour
 *      of the calmest sector of an ellipse laid along that direction, so
 *      areas turn into flat patches of paint and edges stay crisp;
 *   3. line-integral convolution along the direction, of the colour and of
 *      white noise at once: the paint is dragged into strokes and the noise
 *      becomes bristle streaks that follow them;
 *   4. a composite that lights the bristles as low relief, adds paper grain
 *      and a soft vignette.
 *
 * The composite also carries the reveal: at 0 the picture is coarse colour
 * under heavy coloured noise; as it rises the noise falls and detail
 * returns, coarse to fine, the way a diffusion model resolves an image.
 * Nothing here is a trained model; it is only the look.
 */

export interface LiveScene {
    /** Photographs the scene draws; loaded before the first frame. */
    images?: string[];
    /** Whether the scene changes over time (redrawn every frame). */
    animated: boolean;
    /** Stroke direction in flat areas, in degrees (0 = left to right, 90 = downward). */
    direction?: number;
    /** Brush size multiplier (1 = default). */
    brush?: number;
    /** How much of the photograph's fine detail shows through the paint, 0 to 1 (default 0.5). */
    detail?: number;
    /** Draws one frame at `t` seconds. */
    draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, images: HTMLImageElement[]): void;
}

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const HEAD = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
`;

/** Tensor access and the flow field derived from it, shared by several passes. */
const FLOW = `
uniform sampler2D uTensor;
uniform float uEnc;
uniform vec2 uGlobal;
uniform float uTime;
uniform float uShimmer;
vec3 tensorAt(vec2 uv) {
    vec3 T = texture(uTensor, uv).xyz;
    if (uEnc > 0.5) T = vec3(T.x * 48.0, T.y * 48.0, (T.z - 0.5) * 96.0);
    return T;
}
// Tangent (along the forms) and anisotropy, from the tensor's eigenvectors.
vec3 tangentAt(vec2 uv) {
    vec3 T = tensorAt(uv);
    float E = T.x, G = T.y, F = T.z;
    float d = sqrt(max((E - G) * (E - G) + 4.0 * F * F, 0.0));
    float l1 = 0.5 * (E + G + d);
    float l2 = 0.5 * (E + G - d);
    vec2 t = vec2(l1 - E, -F);
    float n = length(t);
    t = n > 1e-6 ? t / n : (E > G ? vec2(0.0, 1.0) : vec2(1.0, 0.0));
    float A = (l1 + l2) > 1e-5 ? (l1 - l2) / (l1 + l2) : 0.0;
    // Where the picture is flat, fall back to the scene's brush direction.
    float s = smoothstep(0.05, 0.35, A) * smoothstep(0.0003, 0.006, l1);
    vec2 g = uGlobal;
    if (dot(g, t) < 0.0) g = -g;
    return vec3(normalize(mix(g, t, s) + 1e-5), A * s);
}
vec2 flowAt(vec2 uv) {
    vec2 v = tangentAt(uv).xy;
    // Living strokes: the field turns a little, slowly, over time.
    float a = uShimmer * 0.28 * sin(uv.x * 5.3 + uTime * 0.41) * cos(uv.y * 4.1 - uTime * 0.33);
    float c = cos(a), si = sin(a);
    return vec2(c * v.x - si * v.y, si * v.x + c * v.y);
}
`;

const TENSOR = `${HEAD}
uniform sampler2D uSrc;
uniform vec2 uPx;
uniform float uEnc;
void main() {
    vec3 tl = texture(uSrc, vUv + uPx * vec2(-1.0, 1.0)).rgb;
    vec3 tc = texture(uSrc, vUv + uPx * vec2(0.0, 1.0)).rgb;
    vec3 tr = texture(uSrc, vUv + uPx * vec2(1.0, 1.0)).rgb;
    vec3 ml = texture(uSrc, vUv + uPx * vec2(-1.0, 0.0)).rgb;
    vec3 mr = texture(uSrc, vUv + uPx * vec2(1.0, 0.0)).rgb;
    vec3 bl = texture(uSrc, vUv + uPx * vec2(-1.0, -1.0)).rgb;
    vec3 bc = texture(uSrc, vUv + uPx * vec2(0.0, -1.0)).rgb;
    vec3 br = texture(uSrc, vUv + uPx * vec2(1.0, -1.0)).rgb;
    vec3 gx = ((tr + 2.0 * mr + br) - (tl + 2.0 * ml + bl)) * 0.25;
    vec3 gy = ((tl + 2.0 * tc + tr) - (bl + 2.0 * bc + br)) * 0.25;
    vec3 T = vec3(dot(gx, gx), dot(gy, gy), dot(gx, gy));
    if (uEnc > 0.5) T = vec3(T.x / 48.0, T.y / 48.0, T.z / 96.0 + 0.5);
    o = vec4(T, 1.0);
}`;

const BLUR = `${HEAD}
uniform sampler2D uSrc;
uniform vec2 uDir;
void main() {
    // Gaussian, sigma about 2.5 texels; weights sum to 1.
    vec4 s = texture(uSrc, vUv) * 0.1648;
    s += (texture(uSrc, vUv + uDir) + texture(uSrc, vUv - uDir)) * 0.1523;
    s += (texture(uSrc, vUv + uDir * 2.0) + texture(uSrc, vUv - uDir * 2.0)) * 0.1201;
    s += (texture(uSrc, vUv + uDir * 3.0) + texture(uSrc, vUv - uDir * 3.0)) * 0.0807;
    s += (texture(uSrc, vUv + uDir * 4.0) + texture(uSrc, vUv - uDir * 4.0)) * 0.0463;
    s += (texture(uSrc, vUv + uDir * 5.0) + texture(uSrc, vUv - uDir * 5.0)) * 0.0227;
    s += (texture(uSrc, vUv + uDir * 6.0) + texture(uSrc, vUv - uDir * 6.0)) * 0.0095;
    o = s;
}`;

/** Anisotropic Kuwahara filter with polynomial sector weights. */
const KUWAHARA = `${HEAD}
uniform sampler2D uSrc;
uniform vec2 uPx;
uniform float uRadius;
${FLOW}
void main() {
    vec3 tA = tangentAt(vUv);
    float A = tA.z;
    float alpha = 2.0;
    float a = uRadius * clamp((alpha + A) / alpha, 0.1, 2.0);
    float b = uRadius * clamp(alpha / (alpha + A), 0.1, 2.0);
    float cp = tA.x;
    float sp = tA.y;
    // Maps the ellipse along the tangent onto the disc of radius 0.5.
    mat2 SR = mat2(0.5 / a, 0.0, 0.0, 0.5 / b) * mat2(cp, -sp, sp, cp);
    int mx = int(ceil(sqrt(a * a * cp * cp + b * b * sp * sp)));
    int my = int(ceil(sqrt(a * a * sp * sp + b * b * cp * cp)));
    vec4 m[8];
    vec3 s[8];
    for (int k = 0; k < 8; k++) {
        m[k] = vec4(0.0);
        s[k] = vec3(0.0);
    }
    const float zeta = 0.12;
    const float eta = 2.4;
    for (int j = -my; j <= my; j++) {
        for (int i = -mx; i <= mx; i++) {
            vec2 v = SR * vec2(float(i), float(j));
            float r2 = dot(v, v);
            if (r2 > 0.25) continue;
            vec3 c = texture(uSrc, vUv + vec2(float(i), float(j)) * uPx).rgb;
            float w[8];
            float vxx = zeta - eta * v.x * v.x;
            float vyy = zeta - eta * v.y * v.y;
            float z;
            z = max(0.0, v.y + vxx); w[0] = z * z;
            z = max(0.0, -v.x + vyy); w[2] = z * z;
            z = max(0.0, -v.y + vxx); w[4] = z * z;
            z = max(0.0, v.x + vyy); w[6] = z * z;
            vec2 u = 0.70710678 * vec2(v.x - v.y, v.x + v.y);
            vxx = zeta - eta * u.x * u.x;
            vyy = zeta - eta * u.y * u.y;
            z = max(0.0, u.y + vxx); w[1] = z * z;
            z = max(0.0, -u.x + vyy); w[3] = z * z;
            z = max(0.0, -u.y + vxx); w[5] = z * z;
            z = max(0.0, u.x + vyy); w[7] = z * z;
            float sum = w[0] + w[1] + w[2] + w[3] + w[4] + w[5] + w[6] + w[7];
            float g = exp(-3.125 * r2) / max(sum, 1e-6);
            for (int k = 0; k < 8; k++) {
                float wk = w[k] * g;
                m[k] += vec4(c * wk, wk);
                s[k] += c * c * wk;
            }
        }
    }
    vec4 acc = vec4(0.0);
    for (int k = 0; k < 8; k++) {
        if (m[k].w <= 0.0) continue;
        vec3 mean = m[k].rgb / m[k].w;
        vec3 v3 = abs(s[k] / m[k].w - mean * mean);
        float sigma2 = v3.r + v3.g + v3.b;
        float wk = 1.0 / (1.0 + pow(255.0 * sigma2, 4.0));
        acc += vec4(mean * wk, wk);
    }
    o = vec4(acc.w > 0.0 ? acc.rgb / acc.w : texture(uSrc, vUv).rgb, 1.0);
}`;

/** Line-integral convolution along the flow: paint into strokes, noise into bristles. */
const LIC = `${HEAD}
uniform sampler2D uSrc;
uniform sampler2D uNoise;
uniform vec2 uPx;
uniform vec2 uRes;
uniform float uLen;
${FLOW}
void main() {
    vec2 f0 = flowAt(vUv);
    // One noise texel is about 1.4 output pixels: R is fine grain for bristles,
    // G is soft blotches a few pixels across that the sweep turns into dabs.
    vec2 nscale = uRes / (256.0 * 1.4);
    vec3 acc = texture(uSrc, vUv).rgb;
    vec2 nacc = texture(uNoise, vUv * nscale).rg;
    float wsum = 1.0;
    for (int side = 0; side < 2; side++) {
        vec2 p = vUv;
        vec2 prev = side == 0 ? f0 : -f0;
        for (int i = 1; i <= 9; i++) {
            vec2 t = flowAt(p);
            if (dot(t, prev) < 0.0) t = -t;
            p += t * uPx * uLen;
            prev = t;
            float fi = float(i);
            float w = exp(-fi * fi / 40.0);
            acc += texture(uSrc, p).rgb * w;
            nacc += texture(uNoise, p * nscale).rg * w;
            wsum += w;
        }
    }
    nacc /= wsum;
    // Height of the paint: mostly the dabs, with bristle streaks inside them.
    float height = 0.5 + 1.7 * (nacc.r - 0.5) + 1.2 * (nacc.g - 0.5);
    o = vec4(acc / wsum, clamp(height, 0.0, 1.0));
}`;

const COMPOSITE = `${HEAD}
uniform sampler2D uPaint;
uniform sampler2D uPaper;
uniform sampler2D uScene;
uniform vec2 uRes;
uniform float uReveal;
uniform float uSeed;
uniform float uDetail;
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}
void main() {
    float r = clamp(uReveal, 0.0, 1.0);
    float lod = (1.0 - r) * 5.5;
    vec4 P = textureLod(uPaint, vUv, lod);
    vec3 col = P.rgb;
    float fine = smoothstep(0.35, 1.0, r);
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    // Paint relief shows in the mid-tones; deep shadow and blown light stay flat.
    float mid = smoothstep(0.06, 0.28, lum) * (1.0 - smoothstep(0.82, 0.98, lum));
    vec2 px = 1.5 / uRes;
    float hx = textureLod(uPaint, vUv + vec2(px.x, 0.0), lod).a - textureLod(uPaint, vUv - vec2(px.x, 0.0), lod).a;
    float hy = textureLod(uPaint, vUv + vec2(0.0, px.y), lod).a - textureLod(uPaint, vUv - vec2(0.0, px.y), lod).a;
    // Bristle streaks, lit from the upper left as low relief.
    float relief = clamp((hy - hx) * 4.0, -1.0, 1.0);
    // The dab field: the same height seen a few pixels wide, where the bristles average out.
    float body = textureLod(uPaint, vUv, lod + 2.0).a - 0.5;
    float dab = smoothstep(-0.07, 0.07, body) - 0.5;
    // Tone in steps, the steps broken along the dabs, as paint mixed by hand.
    float steps = 11.0;
    float stepped = floor(lum * steps + 0.5 + body * 2.2) / steps;
    float k = lum > 0.004 ? clamp(stepped / lum, 0.7, 1.4) : 1.0;
    col = mix(col, col * k, (0.28 - 0.14 * uDetail) * fine * smoothstep(0.03, 0.12, lum));
    col *= 1.0 + (0.06 * dab + 0.085 * relief) * fine * mid;
    col += vec3(0.022, 0.005, -0.024) * dab * fine * mid;
    // The photograph's fine detail, carried back under the paint: edges and texture stay crisp.
    vec3 sharp = texture(uScene, vUv).rgb - textureLod(uScene, vUv, 1.6).rgb;
    col += sharp * uDetail * fine;
    // Slightly richer colour, as gouache reads.
    float l = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(l), col, 1.08);
    // Paper grain.
    float paper = texture(uPaper, vUv * uRes / 512.0).r;
    col *= 0.955 + 0.09 * paper;
    // Diffusion noise: coloured, re-drawn in discrete steps while it resolves.
    float a = pow(1.0 - r, 1.3);
    vec2 cell = floor(vUv * uRes / 1.5);
    vec3 nz = vec3(hash(cell + uSeed), hash(cell + uSeed + 17.1), hash(cell + uSeed + 31.7));
    nz += vec3(hash(cell * 1.31 + uSeed * 2.1), hash(cell * 1.73 + uSeed + 5.0), hash(cell * 0.71 + uSeed + 9.0));
    nz -= 1.0;
    col = mix(col, col * 0.55 + 0.16, a * 0.4) + nz * a * 0.6;
    // Vignette.
    vec2 q = vUv - 0.5;
    col *= 1.0 - 0.3 * dot(q, q);
    o = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

type Prog = { p: WebGLProgram; u: Record<string, WebGLUniformLocation | null> };
type Target = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };

function compile(gl: WebGL2RenderingContext, frag: string, uniforms: string[]): Prog {
    const mk = (type: number, src: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
        return s;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, mk(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, mk(gl.FRAGMENT_SHADER, frag));
    gl.bindAttribLocation(p, 0, 'aPos');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link');
    const u: Prog['u'] = {};
    for (const n of uniforms) u[n] = gl.getUniformLocation(p, n);
    return { p, u };
}

function mulberry32(seed: number) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Tileable value noise, a few octaves, as 8-bit grey. */
function paperTexture(size: number, seed: number) {
    const rand = mulberry32(seed);
    const out = new Uint8Array(size * size * 4);
    const octaves = [
        [8, 0.5],
        [32, 0.3],
        [128, 0.2],
    ];
    const grids = octaves.map(([n]) => Array.from({ length: n * n }, () => rand()));
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            let v = 0;
            octaves.forEach(([n, amp], k) => {
                const fx = (x / size) * n;
                const fy = (y / size) * n;
                const x0 = Math.floor(fx);
                const y0 = Math.floor(fy);
                const tx = fx - x0;
                const ty = fy - y0;
                const g = grids[k];
                const at = (i: number, j: number) => g[((j + n) % n) * n + ((i + n) % n)];
                const sx = tx * tx * (3 - 2 * tx);
                const sy = ty * ty * (3 - 2 * ty);
                const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * sx;
                const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * sx;
                v += (a + (b - a) * sy) * amp;
            });
            const c = Math.round(v * 255);
            const i = (y * size + x) * 4;
            out[i] = out[i + 1] = out[i + 2] = c;
            out[i + 3] = 255;
        }
    }
    return out;
}

/** Tileable noise for the strokes: R is white grain, G is soft blotches about six texels across. */
function strokeNoise(size: number, seed: number) {
    const rand = mulberry32(seed);
    const out = new Uint8Array(size * size * 4);
    const cells = size / 6;
    const grid = Array.from({ length: cells * cells }, () => rand());
    const at = (i: number, j: number) => grid[((j + cells) % cells) * cells + ((i + cells) % cells)];
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const fx = (x / size) * cells;
            const fy = (y / size) * cells;
            const x0 = Math.floor(fx);
            const y0 = Math.floor(fy);
            const sx = (fx - x0) * (fx - x0) * (3 - 2 * (fx - x0));
            const sy = (fy - y0) * (fy - y0) * (3 - 2 * (fy - y0));
            const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * sx;
            const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * sx;
            const i = (y * size + x) * 4;
            out[i] = Math.round(rand() * 255);
            out[i + 1] = Math.round((a + (b - a) * sy) * 255);
            out[i + 2] = 128;
            out[i + 3] = 255;
        }
    }
    return out;
}

const imageCache = new Map<string, Promise<HTMLImageElement>>();
export function loadImage(src: string) {
    let p = imageCache.get(src);
    if (!p) {
        p = new Promise((resolve, reject) => {
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`image ${src}`));
            img.src = src;
        });
        imageCache.set(src, p);
    }
    return p;
}

export class LivePainter {
    readonly canvas: HTMLCanvasElement;
    private gl: WebGL2RenderingContext;
    private vao: WebGLVertexArrayObject;
    private progs: Record<'tensor' | 'blur' | 'kuwa' | 'lic' | 'comp', Prog>;
    private enc: number;
    private tensorFormat: { internal: number; type: number };
    private texScene: WebGLTexture;
    private texNoise: WebGLTexture;
    private texPaper: WebGLTexture;
    private t: { tensor: Target; tmp: Target; kuwa: Target; paint: Target } | null = null;
    private sceneCanvas = document.createElement('canvas');
    private sctx: CanvasRenderingContext2D;
    private scene: LiveScene | null = null;
    private images: HTMLImageElement[] = [];
    private dirty = true;
    private W = 0;
    private H = 0;
    lost = false;

    /**
     * Whether live painting can run here: `gpu`, `software` (WebGL2 emulated
     * on the CPU, as when a GPU is blocklisted; far too slow for this) or `none`.
     */
    static support(): 'gpu' | 'software' | 'none' {
        try {
            const c = document.createElement('canvas');
            const gl = c.getContext('webgl2');
            if (!gl) return 'none';
            const info = gl.getExtension('WEBGL_debug_renderer_info');
            const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? '');
            gl.getExtension('WEBGL_lose_context')?.loseContext();
            return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer) ? 'software' : 'gpu';
        } catch {
            return 'none';
        }
    }

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const gl = canvas.getContext('webgl2', {
            alpha: false,
            antialias: false,
            depth: false,
            stencil: false,
            premultipliedAlpha: false,
            preserveDrawingBuffer: true,
            powerPreference: 'high-performance',
        });
        if (!gl) throw new Error('webgl2');
        this.gl = gl;
        canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            this.lost = true;
        });
        const float = gl.getExtension('EXT_color_buffer_float');
        this.enc = float ? 0 : 1;
        this.tensorFormat = float ? { internal: gl.RGBA16F, type: gl.HALF_FLOAT } : { internal: gl.RGBA8, type: gl.UNSIGNED_BYTE };
        const flowU = ['uTensor', 'uEnc', 'uGlobal', 'uTime', 'uShimmer'];
        this.progs = {
            tensor: compile(gl, TENSOR, ['uSrc', 'uPx', 'uEnc']),
            blur: compile(gl, BLUR, ['uSrc', 'uDir']),
            kuwa: compile(gl, KUWAHARA, ['uSrc', 'uPx', 'uRadius', ...flowU]),
            lic: compile(gl, LIC, ['uSrc', 'uNoise', 'uPx', 'uRes', 'uLen', ...flowU]),
            comp: compile(gl, COMPOSITE, ['uPaint', 'uPaper', 'uScene', 'uRes', 'uReveal', 'uSeed', 'uDetail']),
        };
        this.vao = gl.createVertexArray()!;
        gl.bindVertexArray(this.vao);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        this.sctx = this.sceneCanvas.getContext('2d')!;
        this.texScene = this.makeTex(1, 1, gl.RGBA8, gl.UNSIGNED_BYTE, gl.LINEAR_MIPMAP_LINEAR, gl.CLAMP_TO_EDGE, null);
        this.texNoise = this.makeTex(256, 256, gl.RGBA8, gl.UNSIGNED_BYTE, gl.LINEAR, gl.REPEAT, strokeNoise(256, 11));
        this.texPaper = this.makeTex(512, 512, gl.RGBA8, gl.UNSIGNED_BYTE, gl.LINEAR, gl.REPEAT, paperTexture(512, 5));
    }

    private makeTex(w: number, h: number, internal: number, type: number, filter: number, wrap: number, data: ArrayBufferView | null) {
        const gl = this.gl;
        const t = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, gl.RGBA, type, data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
        return t;
    }

    private target(w: number, h: number, internal: number, type: number, mip = false): Target {
        const gl = this.gl;
        const tex = this.makeTex(w, h, internal, type, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR, gl.CLAMP_TO_EDGE, null);
        if (mip) gl.generateMipmap(gl.TEXTURE_2D);
        const fbo = gl.createFramebuffer()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        return { tex, fbo, w, h };
    }

    private freeTargets() {
        if (!this.t) return;
        for (const x of Object.values(this.t)) {
            this.gl.deleteTexture(x.tex);
            this.gl.deleteFramebuffer(x.fbo);
        }
        this.t = null;
    }

    /** Sets the output size in device pixels. The scene and the paint run at full size; the flow field at half. */
    resize(W: number, H: number) {
        if (W === this.W && H === this.H) return;
        const gl = this.gl;
        this.W = W;
        this.H = H;
        this.canvas.width = W;
        this.canvas.height = H;
        this.freeTargets();
        const hw = Math.max(2, Math.round(W / 2));
        const hh = Math.max(2, Math.round(H / 2));
        const { internal, type } = this.tensorFormat;
        this.t = {
            tensor: this.target(hw, hh, internal, type),
            tmp: this.target(hw, hh, internal, type),
            kuwa: this.target(W, H, gl.RGBA8, gl.UNSIGNED_BYTE),
            paint: this.target(W, H, gl.RGBA8, gl.UNSIGNED_BYTE, true),
        };
        this.sceneCanvas.width = W;
        this.sceneCanvas.height = H;
        this.dirty = true;
    }

    /** Swaps the scene. Resolves once its photographs are loaded. */
    async setScene(scene: LiveScene) {
        const images = await Promise.all((scene.images ?? []).map(loadImage));
        this.useScene(scene, images);
    }

    /** Swaps the scene at once, with its photographs already loaded. */
    useScene(scene: LiveScene, images: HTMLImageElement[]) {
        this.scene = scene;
        this.images = images;
        this.dirty = true;
    }

    get ready() {
        return !!this.scene && this.W > 0 && !this.lost;
    }

    private pass(prog: Prog, target: Target | null, bind: (u: Prog['u']) => void) {
        const gl = this.gl;
        gl.useProgram(prog.p);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fbo : null);
        gl.viewport(0, 0, target ? target.w : this.W, target ? target.h : this.H);
        bind(prog.u);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    private bindTex(unit: number, tex: WebGLTexture, loc: WebGLUniformLocation | null) {
        const gl = this.gl;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(loc, unit);
    }

    /**
     * Renders one frame. `t` drives the scene and the living strokes, `reveal`
     * runs 0 (noise) to 1 (resolved), `step` re-seeds the noise. `paint` is
     * false when only the reveal changed, so the painted layer is reused.
     */
    render(t: number, reveal: number, step: number, shimmer: boolean, paint = true) {
        const gl = this.gl;
        const scene = this.scene;
        const T = this.t;
        if (!scene || this.lost || !T) return;
        gl.bindVertexArray(this.vao);
        const d = ((scene.direction ?? -12) * Math.PI) / 180;
        const global = [Math.cos(d), -Math.sin(d)];
        const flow = (u: Prog['u']) => {
            this.bindTex(1, T.tensor.tex, u.uTensor);
            gl.uniform1f(u.uEnc, this.enc);
            gl.uniform2f(u.uGlobal, global[0], global[1]);
            gl.uniform1f(u.uTime, t);
            gl.uniform1f(u.uShimmer, shimmer ? 1 : 0);
        };
        const brush = scene.brush ?? 1;

        if (this.dirty || scene.animated) {
            const sw = this.sceneCanvas.width;
            const sh = this.sceneCanvas.height;
            this.sctx.save();
            scene.draw(this.sctx, sw, sh, t, this.images);
            this.sctx.restore();
            gl.bindTexture(gl.TEXTURE_2D, this.texScene);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, this.sceneCanvas);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.generateMipmap(gl.TEXTURE_2D);
            // The flow field is read at half size, with a two-pixel stencil on the full-size scene.
            this.pass(this.progs.tensor, T.tensor, (u) => {
                this.bindTex(0, this.texScene, u.uSrc);
                gl.uniform2f(u.uPx, 2 / sw, 2 / sh);
                gl.uniform1f(u.uEnc, this.enc);
            });
            this.pass(this.progs.blur, T.tmp, (u) => {
                this.bindTex(0, T.tensor.tex, u.uSrc);
                gl.uniform2f(u.uDir, 1 / T.tmp.w, 0);
            });
            this.pass(this.progs.blur, T.tensor, (u) => {
                this.bindTex(0, T.tmp.tex, u.uSrc);
                gl.uniform2f(u.uDir, 0, 1 / T.tensor.h);
            });
            this.pass(this.progs.kuwa, T.kuwa, (u) => {
                this.bindTex(0, this.texScene, u.uSrc);
                gl.uniform2f(u.uPx, 1 / sw, 1 / sh);
                gl.uniform1f(u.uRadius, Math.max(2, 3.4 * brush * Math.min(1.5, Math.max(0.7, T.kuwa.w / 1500))));
                flow(u);
            });
            this.dirty = false;
            paint = true;
        }

        if (paint) {
            this.pass(this.progs.lic, T.paint, (u) => {
                this.bindTex(0, T.kuwa.tex, u.uSrc);
                this.bindTex(2, this.texNoise, u.uNoise);
                gl.uniform2f(u.uPx, 1 / this.W, 1 / this.H);
                gl.uniform2f(u.uRes, this.W, this.H);
                gl.uniform1f(u.uLen, 1.3 * brush * Math.max(1, this.W / 1400));
                flow(u);
            });
            gl.bindTexture(gl.TEXTURE_2D, T.paint.tex);
            gl.generateMipmap(gl.TEXTURE_2D);
        }

        this.pass(this.progs.comp, null, (u) => {
            this.bindTex(0, T.paint.tex, u.uPaint);
            this.bindTex(1, this.texPaper, u.uPaper);
            this.bindTex(2, this.texScene, u.uScene);
            gl.uniform2f(u.uRes, this.W, this.H);
            gl.uniform1f(u.uReveal, reveal);
            gl.uniform1f(u.uSeed, (step % 97) * 7.31);
            gl.uniform1f(u.uDetail, scene.detail ?? 0.5);
        });
    }

    dispose() {
        this.freeTargets();
        this.gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
}
