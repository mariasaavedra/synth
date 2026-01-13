"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { SYNTH_NOTE_EVENT } from "@/lib/synthEvents";

// 1) Put your GLSL here.
// If your original p5 shader is "shadertoy-like" (mainImage), see the wrapper section below.
const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const frag = /* glsl */ `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

// --- hash + noise ---
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// --- fbm ---
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.25;
  for (int i = 0; i < 2; i++) {
    value += amplitude * noise(p);
    p *= 1.25;
    amplitude *= 0.125;
  }
  return value;
}

float contourLines(float v, float frequency, float line_thickness) {
  float lines = abs(fract(v * frequency) - 0.299);
  return smoothstep(0.5 - line_thickness, 0.499 + line_thickness, lines);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv = uv * -4.0 - 10.0;
  uv.x *= u_resolution.x / u_resolution.y;

  vec2 warp1 = vec2(
    noise(uv * 1.0 + vec2(u_time * 1.3, u_time * 0.2)),
    noise(uv * 120.0 + vec2(-u_time * 0.4, u_time * 0.2))
  );
  vec2 uv2 = uv + (warp1 - 0.25) * 0.6;

  vec2 warp2 = vec2(
    noise(uv2 * 1.0 + vec2(-u_time * 0.6, u_time * 0.4)),
    noise(uv2 * 190.0 + vec2(u_time * 2.5, u_time * 0.3))
  );
  vec2 uvFinal = uv2 + (warp2 - 1.5) / 0.995;

  // --- fbm flow ---
  vec2 flow = uvFinal + vec2(u_time * 0.26, u_time * 0.1);
  float n = fbm(flow);

  float n1 = fbm(flow + vec2(0.001, 0.0));
  float n2 = fbm(flow + vec2(0.0, 0.001));
  float grad = length(vec2(n1 - n, n2 - n));
  float edge = smoothstep(0.02, 0.2, grad);

  float frequency = sin(u_time * 0.1) * 5.0 + 10.0;
  float thickness = 0.125;
  float lines = contourLines(n, frequency, thickness);

  float finalVal = mix(lines / 0.99, 1.0 / 0.01, edge * 0.9);

  gl_FragColor = vec4(vec3(finalVal), 1.0);
}
`;

function CloudPlane() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { size, gl } = useThree();

  // create once (no mutations to this object later)
  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(1, 1) },
    }),
    []
  );

  const energyRef = useRef(0);
  const tRef = useRef(0);

  useEffect(() => {
    const onNote = () => {
      energyRef.current = 1;
    };
    window.addEventListener(SYNTH_NOTE_EVENT, onNote);
    return () => window.removeEventListener(SYNTH_NOTE_EVENT, onNote);
  }, []);
  useFrame((state, delta) => {
    const mat = matRef.current;
    if (!mat) return;

    mat.uniforms.u_resolution.value.set(
      size.width * gl.getPixelRatio(),
      size.height * gl.getPixelRatio()
    );

    // decay envelope
    energyRef.current = Math.max(0, energyRef.current - 2.5 * delta);

    const idleSpeed = 0.0; // fully frozen when idle
    const activeBoost = 0.08; // slow movement when notes happen
    const speed = idleSpeed + activeBoost * energyRef.current;

    tRef.current += delta * speed;
    mat.uniforms.u_time.value = tRef.current;
  });
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function Cloud() {
  return (
    <div className="rounded-2xl p-4 border-2 border-white cursor-pointer h-60 w-60 mx-2 !overflow-hidden">
      <Canvas
        className="rounded-2xl"
        orthographic
        camera={{ position: [0, 0, 0.5], zoom: 100 }}
        dpr={[1, 2]}
      >
        <CloudPlane />
      </Canvas>
    </div>
  );
}
