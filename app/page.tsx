import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans ">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16  sm:items-start"></main>

      <div
        className="absolute -z-10 inset-0 h-full w-full 
bg-[radial-gradient(circle,#73737350_2px,transparent_1px)] 
bg-[size:30px_30px]"
      />
    </div>
  );
}
