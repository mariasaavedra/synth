
# Cloud Piano

A browser-based polyphonic piano with a reactive cloud mesh.  
Built with **Tone.js** for audio and **React Three Fiber** for visuals.

This project is intentionally simple: play notes → hear sound → see sound.

---

## Tech Stack

- **Framework:** Next.js (App Router) + React + TypeScript
- **Audio:** Tone.js (Web Audio API under the hood)
- **3D / Visuals:** Three.js via @react-three/fiber
- **Styling:** TailwindCSS
- **State:** Minimal (Zustand or local React state)

---

## Features

- Polyphonic on-screen piano (mouse, touch, keyboard)
- ADSR envelope (attack, release)
- Waveform selection
- Low-pass filter (cutoff + resonance)
- Distortion + limiter
- Master volume
- Pitch bend (continuous, affects held notes)
- Fullscreen cloud mesh reacting to live audio analysis
- Mobile-safe (pointer events + autoplay handling)

---

## References

### Audio / Tone.js
- [Tone.js Official Site](https://tonejs.github.io/) — framework for interactive web audio, synths, effects, scheduling, transport. :contentReference[oaicite:0]{index=0}
- [Tone.js API Docs](https://tonejs.github.io/docs/) — full class & method reference. :contentReference[oaicite:1]{index=1}
- [Tone.Analyser (FFT + waveform)](https://tonejs.github.io/docs/r13/Analyser) — wrapper over native AnalyserNode. :contentReference[oaicite:2]{index=2}

### Web Audio API (Core)
- [Web Audio API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) — conceptual overview & reference. :contentReference[oaicite:3]{index=3}
- [Using the Web Audio API — MDN Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API) — intro with examples. :contentReference[oaicite:4]{index=4}
- [AnalyserNode — MDN](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode) — real-time FFT/time-domain data extraction. :contentReference[oaicite:5]{index=5}

### WebGL / Rendering
- [WebGL API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) — low-level GPU rendering API reference.
- [React Three Fiber (R3F) Docs](https://r3f.docs.pmnd.rs/) — React renderer for three.js scenes & hooks. :contentReference[oaicite:6]{index=6}
- [three.js Core Docs](https://threejs.org/docs/) — base three.js library (geometry, shaders, audio helpers). :contentReference[oaicite:7]{index=7}


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
