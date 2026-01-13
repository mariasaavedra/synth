// Cloud.tsx (only the relevant parts)
"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  SYNTH_NOTE_OFF_EVENT,
  SYNTH_NOTE_ON_EVENT,
  type SynthNoteDetail,
} from "@/lib/synthEvents";

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

// NEW
uniform float u_freq;     // Hz
uniform float u_energy;   // 0..1
uniform float u_midiNorm; // 0..1

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

  // map pitch -> useful ranges
  // midiNorm already 0..1; freq can be huge, so compress it
  float pitch = clamp(u_midiNorm, 0.0, 1.0);
  float freqCompressed = clamp(log2(max(u_freq, 1.0)) / 12.0, 0.0, 2.0); // ~0..2-ish
  float e = clamp(u_energy, 0.0, 1.0);

  // make warps and line frequency respond to pitch + energy
  float warpAmt = mix(0.4, 1.2, e);
  float timeSpeed = mix(0.02, 0.18, e);

  vec2 warp1 = vec2(
    noise(uv * (1.0 + pitch) + vec2(u_time * (1.3 + timeSpeed), u_time * 0.2)),
    noise(uv * (120.0 + 80.0 * pitch) + vec2(-u_time * 0.4, u_time * 0.2))
  );
  vec2 uv2 = uv + (warp1 - 0.25) * (0.6 * warpAmt);

  vec2 warp2 = vec2(
    noise(uv2 * (1.0 + 0.6 * pitch) + vec2(-u_time * 0.6, u_time * (0.4 + timeSpeed))),
    noise(uv2 * (190.0 + 140.0 * pitch) + vec2(u_time * 2.5, u_time * 0.3))
  );
  vec2 uvFinal = uv2 + (warp2 - 1.5) / 0.995;

  vec2 flow = uvFinal + vec2(u_time * (0.26 + 0.08 * e), u_time * (0.1 + 0.05 * e));
  float n = fbm(flow);

  float n1 = fbm(flow + vec2(0.001, 0.0));
  float n2 = fbm(flow + vec2(0.0, 0.001));
  float grad = length(vec2(n1 - n, n2 - n));
  float edge = smoothstep(0.02, 0.2, grad);

  float baseFreq = 10.0;
  float pitchFreq = 12.0 * pitch + 6.0 * freqCompressed;
  float frequency = baseFreq + pitchFreq + 18.0 * e;

  float thickness = mix(0.10, 0.20, e);
  float lines = contourLines(n, frequency, thickness);

  float finalVal = mix(lines / 0.99, 1.0 / 0.01, edge * 0.9);

  gl_FragColor = vec4(vec3(finalVal), 1.0);
}
`;

function CloudPlane() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { size, gl } = useThree();

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_freq: { value: 220 },
      u_energy: { value: 0 },
      u_midiNorm: { value: 0.5 },
    }),
    []
  );
  const BASE_FREQ = 220;
  const BASE_MIDI_NORM = 0.5;

  const energyRef = useRef(0);
  const freqTargetRef = useRef(BASE_FREQ);
  const midiNormTargetRef = useRef(BASE_MIDI_NORM);
  const tRef = useRef(0);

  useEffect(() => {
    const onNoteOn = (e: Event) => {
      const ce = e as CustomEvent<SynthNoteDetail>;
      const d = ce.detail;
      if (!d) return;

      energyRef.current = 1;

      freqTargetRef.current = d.freq || BASE_FREQ;

      const midi = d.midi ?? 60;
      const norm = (midi - 36) / (84 - 36);
      midiNormTargetRef.current = Math.min(1, Math.max(0, norm));
    };

    const onNoteOff = () => {
      // snap back immediately OR let it ease back (your choice)
      energyRef.current = 0;
      freqTargetRef.current = BASE_FREQ;
      midiNormTargetRef.current = BASE_MIDI_NORM;
    };

    window.addEventListener(SYNTH_NOTE_ON_EVENT, onNoteOn);
    window.addEventListener(SYNTH_NOTE_OFF_EVENT, onNoteOff);
    return () => {
      window.removeEventListener(SYNTH_NOTE_ON_EVENT, onNoteOn);
      window.removeEventListener(SYNTH_NOTE_OFF_EVENT, onNoteOff);
    };
  }, []);

  useFrame((state, delta) => {
    const mat = matRef.current;
    if (!mat) return;

    mat.uniforms.u_resolution.value.set(
      size.width * gl.getPixelRatio(),
      size.height * gl.getPixelRatio()
    );

    // if you want *hard* revert on note off, keep energy at 0 and stop time
    const idleSpeed = 0.0;
    const activeBoost = 0.08;
    const speed = idleSpeed + activeBoost * energyRef.current;
    tRef.current += delta * speed;

    const expLerp = (a: number, b: number, k: number) =>
      a + (b - a) * (1 - Math.exp(-k * delta));

    mat.uniforms.u_time.value = tRef.current;
    mat.uniforms.u_energy.value = energyRef.current;

    // ease back to baseline after NOTE_OFF (targets reset)
    mat.uniforms.u_freq.value = expLerp(
      mat.uniforms.u_freq.value,
      freqTargetRef.current,
      22
    );
    mat.uniforms.u_midiNorm.value = expLerp(
      mat.uniforms.u_midiNorm.value,
      midiNormTargetRef.current,
      22
    );
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
    <div className="rounded-2xl p-4 border-2 border-white cursor-pointer h-55 w-60 mx-2 !overflow-hidden">
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
