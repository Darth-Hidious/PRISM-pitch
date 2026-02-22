import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;

/* ── 1. particleField: dim scattered particles ── */
const particleFieldFragment = `
uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    uv.x *= aspect;

    float t = uTime * 0.08;
    vec3 col = vec3(0.02, 0.03, 0.06);

    for (float i = 0.0; i < 80.0; i++) {
        vec2 pos = vec2(hash(vec2(i, 0.0)) * aspect, hash(vec2(0.0, i)));
        pos += vec2(sin(t + i * 0.3) * 0.01, cos(t + i * 0.5) * 0.01);
        float d = length(uv - pos);
        float brightness = hash(vec2(i, i)) > 0.99 ? 1.0 : 0.15;
        vec3 particleColor = brightness > 0.5 ? vec3(0.0, 0.83, 1.0) : vec3(0.3, 0.4, 0.5);
        col += particleColor * (0.001 / (d * d + 0.001)) * brightness;
    }

    float vig = 1.0 - length((vUv - 0.5) * 1.4);
    col *= vig;
    gl_FragColor = vec4(col, 1.0);
}
`;

/* ── 2. neuralFlow: pulsing network connections ── */
const neuralFlowFragment = `
uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float line(vec2 a, vec2 b, vec2 p, float w) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return smoothstep(w, 0.0, length(pa - ba * h));
}

void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    uv.x *= aspect;
    float t = uTime * 0.15;

    vec3 col = vec3(0.02, 0.04, 0.08);
    const int N = 12;
    vec2 nodes[12];

    for (int i = 0; i < N; i++) {
        float fi = float(i);
        nodes[i] = vec2(
            hash(vec2(fi, 1.0)) * aspect * 0.8 + aspect * 0.1,
            hash(vec2(1.0, fi)) * 0.8 + 0.1
        );
        nodes[i] += vec2(sin(t + fi * 1.1) * 0.03, cos(t + fi * 0.7) * 0.03);
    }

    // Draw connections
    for (int i = 0; i < N; i++) {
        for (int j = i + 1; j < N; j++) {
            float dist = length(nodes[i] - nodes[j]);
            if (dist < 0.45) {
                float pulse = sin(t * 2.0 + float(i + j) * 0.5) * 0.5 + 0.5;
                float l = line(nodes[i], nodes[j], uv, 0.002);
                vec3 lineColor = mix(vec3(0.0, 0.4, 0.8), vec3(0.0, 0.83, 1.0), pulse);
                col += lineColor * l * (1.0 - dist / 0.45) * 0.5;
            }
        }
    }

    // Draw nodes
    for (int i = 0; i < N; i++) {
        float d = length(uv - nodes[i]);
        float glow = 0.004 / (d * d + 0.001);
        float pulse = sin(t * 1.5 + float(i)) * 0.3 + 0.7;
        col += vec3(0.0, 0.6, 1.0) * glow * 0.08 * pulse;
    }

    float vig = 1.0 - length((vUv - 0.5) * 1.3);
    col *= vig;
    gl_FragColor = vec4(col, 1.0);
}
`;

/* ── 3. orbitalRings: concentric spinning layers ── */
const orbitalRingsFragment = `
uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
    vec2 uv = vUv - 0.5;
    float aspect = uResolution.x / uResolution.y;
    uv.x *= aspect;
    float t = uTime * 0.2;

    vec3 col = vec3(0.02, 0.03, 0.07);
    float r = length(uv);

    for (float i = 1.0; i <= 5.0; i++) {
        float radius = i * 0.08 + 0.05;
        float ring = abs(r - radius);
        float angle = atan(uv.y, uv.x) + t * (0.3 / i);
        float dashes = sin(angle * (4.0 + i * 2.0)) * 0.5 + 0.5;
        float intensity = smoothstep(0.008, 0.001, ring) * dashes;
        vec3 ringColor = mix(vec3(0.0, 0.5, 1.0), vec3(0.0, 0.83, 1.0), i / 5.0);
        col += ringColor * intensity * 0.4;
    }

    // Center glow
    float centerGlow = 0.01 / (r * r + 0.01);
    col += vec3(0.0, 0.6, 1.0) * centerGlow * 0.03;

    float vig = 1.0 - length((vUv - 0.5) * 1.5);
    col *= max(vig, 0.0);
    gl_FragColor = vec4(col, 1.0);
}
`;

/* ── 4. heatDistortion: thermal shimmer ── */
const heatDistortionFragment = `
uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i), b = hash(i + vec2(1,0));
    float c = hash(i + vec2(0,1)), d = hash(i + vec2(1,1));
    return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}

float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p *= 2.0; a *= 0.5;
    }
    return v;
}

void main() {
    vec2 uv = vUv;
    float t = uTime * 0.1;

    float distort = fbm(uv * 3.0 + vec2(0, t * 2.0)) * 0.04;
    vec2 duv = uv + vec2(distort, distort * 0.5);

    float heat = fbm(duv * 4.0 + t);
    float rise = fbm(vec2(uv.x * 5.0, uv.y * 2.0 - t * 3.0));

    vec3 cold = vec3(0.04, 0.02, 0.06);
    vec3 warm = vec3(0.6, 0.15, 0.0);
    vec3 hot = vec3(1.0, 0.6, 0.0);
    vec3 white = vec3(1.0, 0.9, 0.8);

    float intensity = heat * rise * 1.5;
    intensity = pow(intensity, 1.5);

    vec3 col = cold;
    col = mix(col, warm, smoothstep(0.2, 0.5, intensity));
    col = mix(col, hot, smoothstep(0.5, 0.7, intensity));
    col = mix(col, white, smoothstep(0.8, 1.0, intensity));

    // Bottom glow (heat rises from below)
    col *= 0.5 + 0.5 * smoothstep(1.0, 0.2, vUv.y);

    float vig = 1.0 - length((vUv - 0.5) * 1.4);
    col *= max(vig, 0.0);
    gl_FragColor = vec4(col, 1.0);
}
`;

/* ── 5. dataStream: vertical falling symbols ── */
const dataStreamFragment = `
uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    float t = uTime * 0.5;

    vec3 col = vec3(0.01, 0.02, 0.05);

    float columns = 40.0;
    float colX = floor(uv.x * columns);
    float speed = hash(vec2(colX, 0.0)) * 0.8 + 0.4;
    float offset = hash(vec2(colX, 1.0)) * 100.0;
    float y = fract(uv.y - t * speed + offset);

    // Leading bright character
    float head = smoothstep(0.0, 0.03, y) * smoothstep(0.08, 0.03, y);
    col += vec3(0.0, 0.83, 1.0) * head * 0.8;

    // Trail
    float trail = smoothstep(0.0, 0.02, y) * smoothstep(0.5, 0.02, y);
    float charGrid = step(0.3, hash(vec2(colX, floor(y * 30.0))));
    col += vec3(0.0, 0.3, 0.6) * trail * charGrid * 0.15;

    // Random bright flashes
    float flash = step(0.98, hash(vec2(colX, floor(t * 2.0))));
    col += vec3(0.0, 0.6, 1.0) * flash * 0.1 * smoothstep(0.5, 0.0, abs(uv.y - fract(t * speed)));

    float vig = 1.0 - length((vUv - 0.5) * 1.3);
    col *= max(vig, 0.0);
    gl_FragColor = vec4(col, 1.0);
}
`;

/* ── 6. liquidMetal: chrome/gold flowing metal ── */
const liquidMetalFragment = `
uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
               mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}

float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 6; i++) { v += a * noise(p); p *= 2.1; a *= 0.5; }
    return v;
}

void main() {
    vec2 uv = vUv;
    float t = uTime * 0.12;

    float n1 = fbm(uv * 3.0 + t * 0.3);
    float n2 = fbm(uv * 5.0 - t * 0.2 + n1 * 0.5);
    float n3 = fbm(uv * 8.0 + vec2(n2, n1) * 0.3);

    float metallic = (n1 + n2 * 0.5 + n3 * 0.25) / 1.75;

    // Specular highlights
    float spec = pow(metallic, 4.0) * 2.0;

    vec3 gold = vec3(0.9, 0.7, 0.2);
    vec3 chrome = vec3(0.6, 0.65, 0.7);
    vec3 dark = vec3(0.04, 0.03, 0.06);

    vec3 col = mix(dark, chrome, smoothstep(0.3, 0.5, metallic));
    col = mix(col, gold, smoothstep(0.55, 0.75, metallic));
    col += vec3(1.0, 0.95, 0.8) * spec * 0.15;

    // Subtle cyan reflection
    col += vec3(0.0, 0.4, 0.6) * pow(1.0 - metallic, 3.0) * 0.1;

    float vig = 1.0 - length((vUv - 0.5) * 1.3);
    col *= max(vig, 0.0);
    gl_FragColor = vec4(col, 1.0);
}
`;

/* ── 7. subtleParticle: very minimal floating dots ── */
const subtleParticleFragment = `
uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    uv.x *= aspect;
    float t = uTime * 0.05;

    vec3 col = vec3(0.03, 0.04, 0.08);

    for (float i = 0.0; i < 30.0; i++) {
        vec2 pos = vec2(hash(vec2(i, 0.0)) * aspect, hash(vec2(0.0, i)));
        pos += vec2(sin(t + i * 0.7) * 0.02, cos(t + i * 0.5) * 0.02);
        float d = length(uv - pos);
        col += vec3(0.3, 0.4, 0.6) * (0.0003 / (d * d + 0.0002));
    }

    float vig = 1.0 - length((vUv - 0.5) * 1.2);
    col *= max(vig, 0.0);
    gl_FragColor = vec4(col, 1.0);
}
`;

export const SHADERS = {
  particleField: particleFieldFragment,
  neuralFlow: neuralFlowFragment,
  orbitalRings: orbitalRingsFragment,
  heatDistortion: heatDistortionFragment,
  dataStream: dataStreamFragment,
  liquidMetal: liquidMetalFragment,
  subtleParticle: subtleParticleFragment,
} as const;

export type ShaderName = keyof typeof SHADERS;

interface Props {
  shader: ShaderName;
}

export default function ShaderBackground({ shader }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: SHADERS[shader],
      uniforms,
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.uResolution.value.set(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      material.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [shader]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
}
