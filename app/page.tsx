"use client";

import Background from "@/components/Background";
import Cloud from "@/components/Cloud";
import Synth from "@/components/Synth";

export default function Home() {
  return (
    <>
      <div className="flex flex-col md:flex-row min-h-screen items-center justify-start font-sans mt-16 p-4 gap-2 max-w-1/2 mx-auto">
        <Cloud />
        <Synth />
      </div>
      <Background />
    </>
  );
}
