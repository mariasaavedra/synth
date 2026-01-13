"use client";

import Background from "@/components/Background";
import Synth from "@/components/Synth";


export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans ">
      <Synth/>
      <Background />
    </div>
  );
}
