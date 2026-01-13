"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

// 1) Put your GLSL here.
// If your original p5 shader is "shadertoy-like" (mainImage), see the wrapper section below.
const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Placeholder frag (replace with SamuelYAN frag body)
// Keep the uniforms exactly as you used in p5.
const frag = /* glsl */ `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_frame;
  uniform vec2 u_mouse;

  varying vec2 vUv;

  // --- demo cloud-ish noise (replace with the real shader) ---
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i);
    float b = hash(i+vec2(1.,0.));
    float c = hash(i+vec2(0.,1.));
    float d = hash(i+vec2(1.,1.));
    vec2 u = f*f*(3.-2.*f);
    return mix(a,b,u.x) + (c-a)*u.y*(1.-u.x) + (d-b)*u.x*u.y;
  }
  float fbm(vec2 p){
    float v=0., a=.5;
    for(int i=0;i<5;i++){
      v += a*noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Convert to pixel coords like shadertoy style if you want
    vec2 fragCoord = vUv * u_resolution;
    vec2 uv = (fragCoord - 0.5*u_resolution) / min(u_resolution.x, u_resolution.y);

    // mild mouse influence
    uv += (u_mouse - vec2(0.5)) * 0.25;

    float n = fbm(uv*2.5 + vec2(u_time*0.05, -u_time*0.07));
    float c = smoothstep(0.35, 0.75, n);

    gl_FragColor = vec4(vec3(c), 1.0);
  }
`;

function CloudPlane() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { size, gl } = useThree();

  // create once (no mutations to this object later)
  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_frame: { value: 0 },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    []
  );

  useFrame(({ clock, pointer }) => {
    const mat = matRef.current;
    if (!mat) return;

    // mutate through the material (allowed)
    mat.uniforms.u_time.value = clock.getElapsedTime();
    mat.uniforms.u_frame.value += 1;

    mat.uniforms.u_resolution.value.set(
      size.width * gl.getPixelRatio(),
      size.height * gl.getPixelRatio()
    );

    // pointer is -1..1 -> 0..1
    mat.uniforms.u_mouse.value.set(
      pointer.x * 0.5 + 0.5,
      pointer.y * 0.5 + 0.5
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
    <div className="rounded-2xl p-4 border-2 border-white cursor-pointer h-60 w-60 mx-2 !overflow-hidden">
      <Canvas
        className="rounded-2xl"
        orthographic
        camera={{ position: [0, 0, 1], zoom: 100 }}
        dpr={[1, 2]}
      >
        <CloudPlane />
      </Canvas>
    </div>
  );
}
