/*
 * A real Earth, drawn with WebGL 2: every pixel of the disc is traced back to a latitude and
 * longitude and read from a satellite map (EOxCloudless 2016, CC BY 4.0). No mesh, no painting:
 * the sphere is exact at any size, and only the pixels under the globe are drawn.
 *
 * Conventions shared by the shader and `project` below: a point at latitude φ, longitude λ sits at
 * world (cos φ sin λ, sin φ, cos φ cos λ). A view looks at (lat, lon) head on:
 * view = Rx(lat) · Ry(−lon) · world, with x to the right, y up and z towards the viewer.
 */

export interface GlobeView {
    /** Longitude and latitude at the centre of the disc, in degrees. */
    lon: number;
    lat: number;
    /** Centre of the disc and its radius, in CSS pixels within the canvas. */
    cx: number;
    cy: number;
    r: number;
}

export interface Globe {
    draw(view: GlobeView): void;
    /** Where a place appears on the canvas, in CSS pixels, and whether it faces the viewer. */
    project(view: GlobeView, lat: number, lon: number): { x: number; y: number; front: number };
    resize(): void;
    destroy(): void;
}

const VERT = `#version 300 es
in vec2 a_pos;
uniform vec2 u_canvas;   // canvas size in device pixels
uniform vec3 u_disc;     // centre x, centre y, radius in device pixels (y down)
out vec2 v_p;            // position on the disc, radius 1, y up
void main() {
    // A square a little larger than the disc, so the rim of air fits.
    vec2 p = a_pos * 1.12;
    v_p = p;
    vec2 px = u_disc.xy + vec2(p.x, -p.y) * u_disc.z;
    vec2 clip = px / u_canvas * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 v_p;
uniform sampler2D u_map;
uniform vec2 u_rot;      // lat, lon in radians
uniform float u_px;      // one device pixel, in disc units, for smooth edges
out vec4 outColor;

const float PI = 3.14159265358979;

void main() {
    float r2 = dot(v_p, v_p);
    float r = sqrt(r2);
    vec3 air = vec3(0.42, 0.62, 1.0);

    if (r > 1.0) {
        // A thin rim of air around the limb, fading to nothing (premultiplied colour).
        float halo = pow(smoothstep(1.12, 1.0, r), 2.0) * 0.35;
        outColor = vec4(air * halo, halo);
        return;
    }

    vec3 n = vec3(v_p, sqrt(max(0.0, 1.0 - r2)));

    // Back to the world: world = Ry(lon) · Rx(−lat) · view.
    float cl = cos(u_rot.x), sl = sin(u_rot.x);
    vec3 a = vec3(n.x, n.y * cl + n.z * sl, -n.y * sl + n.z * cl);
    float co = cos(u_rot.y), so = sin(u_rot.y);
    vec3 w = vec3(a.x * co + a.z * so, a.y, -a.x * so + a.z * co);

    float lat = asin(clamp(w.y, -1.0, 1.0));
    float lon = atan(w.x, w.z);
    vec2 uv = vec2(lon / (2.0 * PI) + 0.5, 0.5 - lat / PI);

    // Mip level from whichever of two longitude seams is far from this pixel, so no line shows.
    vec2 uvB = vec2(fract(uv.x + 0.5), uv.y);
    vec2 dxA = dFdx(uv), dyA = dFdy(uv), dxB = dFdx(uvB), dyB = dFdy(uvB);
    vec2 dx = abs(dxA.x) < abs(dxB.x) ? dxA : dxB;
    vec2 dy = abs(dyA.x) < abs(dyB.x) ? dyA : dyB;
    vec3 col = textureGrad(u_map, uv, dx, dy).rgb;

    // Soft daylight from the upper left, a little darkening towards the limb, air at the edge.
    vec3 light = normalize(vec3(-0.55, 0.45, 0.72));
    float diffuse = max(dot(n, light), 0.0);
    col *= 0.42 + 0.78 * diffuse;
    float limb = 1.0 - n.z;
    col = mix(col, air * 0.9, pow(limb, 2.6) * 0.55);

    // Smooth edge, meeting the rim of air outside at the same strength.
    float edge = smoothstep(1.0, 1.0 - 2.0 * u_px, r);
    outColor = vec4(col * edge, edge) + vec4(air, 1.0) * (1.0 - edge) * 0.35;
}`;

function shader(gl: WebGL2RenderingContext, type: number, src: string) {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(s);
        gl.deleteShader(s);
        throw new Error(`globe shader: ${log}`);
    }
    return s;
}

const RAD = Math.PI / 180;

/** Rotates a world point into view space for the given view (see the conventions above). */
function toView(view: GlobeView, lat: number, lon: number) {
    const p = lat * RAD;
    const l = lon * RAD;
    const x = Math.cos(p) * Math.sin(l);
    const y = Math.sin(p);
    const z = Math.cos(p) * Math.cos(l);
    // Ry(−lon)
    const b = -view.lon * RAD;
    const x1 = x * Math.cos(b) + z * Math.sin(b);
    const z1 = -x * Math.sin(b) + z * Math.cos(b);
    // Rx(lat)
    const a = view.lat * RAD;
    const y2 = y * Math.cos(a) - z1 * Math.sin(a);
    const z2 = y * Math.sin(a) + z1 * Math.cos(a);
    return { x: x1, y: y2, z: z2 };
}

/**
 * Sets up the globe on `canvas` and starts loading the map. Returns null when WebGL 2 is not
 * available, so the caller can show a photograph instead. `onReady` runs once the map is loaded.
 */
export function createGlobe(canvas: HTMLCanvasElement, mapUrl: string, onReady: () => void): Globe | null {
    const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true });
    if (!gl) return null;

    let program: WebGLProgram;
    try {
        program = gl.createProgram()!;
        gl.attachShader(program, shader(gl, gl.VERTEX_SHADER, VERT));
        gl.attachShader(program, shader(gl, gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'link');
    } catch {
        return null;
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const loc = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = {
        canvas: gl.getUniformLocation(program, 'u_canvas'),
        disc: gl.getUniformLocation(program, 'u_disc'),
        rot: gl.getUniformLocation(program, 'u_rot'),
        px: gl.getUniformLocation(program, 'u_px'),
        map: gl.getUniformLocation(program, 'u_map'),
    };

    const tex = gl.createTexture();
    let ready = false;
    let dpr = 1;
    let last: GlobeView | null = null;

    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const aniso = gl.getExtension('EXT_texture_filter_anisotropic');
        if (aniso) {
            const max = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number;
            gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, max));
        }
        ready = true;
        if (last) draw(last);
        onReady();
    };
    img.src = mapUrl;

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = canvas.getBoundingClientRect();
        const w = Math.max(1, Math.round(rect.width * dpr));
        const h = Math.max(1, Math.round(rect.height * dpr));
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
        }
    }

    function draw(view: GlobeView) {
        last = view;
        gl!.viewport(0, 0, canvas.width, canvas.height);
        gl!.clearColor(0, 0, 0, 0);
        gl!.clear(gl!.COLOR_BUFFER_BIT);
        if (!ready) return;
        gl!.useProgram(program);
        gl!.bindVertexArray(vao);
        gl!.enable(gl!.BLEND);
        gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);
        gl!.activeTexture(gl!.TEXTURE0);
        gl!.bindTexture(gl!.TEXTURE_2D, tex);
        gl!.uniform1i(u.map, 0);
        gl!.uniform2f(u.canvas, canvas.width, canvas.height);
        gl!.uniform3f(u.disc, view.cx * dpr, view.cy * dpr, view.r * dpr);
        gl!.uniform2f(u.rot, view.lat * RAD, view.lon * RAD);
        gl!.uniform1f(u.px, 1 / Math.max(1, view.r * dpr));
        gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    function project(view: GlobeView, lat: number, lon: number) {
        const v = toView(view, lat, lon);
        return { x: view.cx + v.x * view.r, y: view.cy - v.y * view.r, front: v.z };
    }

    resize();

    return {
        draw,
        project,
        resize,
        destroy() {
            img.onload = null;
            gl.deleteTexture(tex);
            gl.deleteBuffer(buf);
            gl.deleteVertexArray(vao);
            gl.deleteProgram(program);
        },
    };
}
