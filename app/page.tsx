"use client";

import Background from "@/components/Background";
import Cloud from "@/components/Cloud";
import Synth from "@/components/Synth";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans ">
      <Cloud />
      <Synth />
      <Background />
    </div>
  );
}
