export default function Main({ children }: React.PropsWithChildren) {
  return (
    <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16  sm:items-start relative z-10">
      {children}
    </main>
  );
}
