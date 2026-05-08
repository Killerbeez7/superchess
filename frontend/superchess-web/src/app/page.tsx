import { Navbar } from "@components/layout/Navbar";
import clsx from "clsx";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950/97 text-white">
      <Navbar />

      <section className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
              Multiplayer chess prototype
            </p>

            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              SuperChess.com
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              A modern twist on classic chess. Explore a world where every move can
              surprise, every match feels different, and multiplayer battles push you to
              think even harder. Freedom, unpredictability, and excitement await.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="play"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Start Playing
              </a>

              <a
                href="#about"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="grid grid-cols-8 gap-2 rounded-2xl bg-slate-900 p-4">
              {Array.from({ length: 64 }).map((_, index) => {
                const row = Math.floor(index / 8);
                const col = index % 8;
                const isDark = (row + col) % 2 === 1;

                return (
                  <div
                    key={index}
                    className={clsx(
                      "aspect-square rounded-md",
                      "transition-all duration-500 ease-out",
                      "hover:scale-105 hover:z-10",
                      "hover:shadow-lg hover:shadow-black/20",
                      "cursor-pointer",
                      isDark
                        ? "bg-slate-700 hover:bg-slate-500"
                        : "bg-slate-300 hover:bg-slate-100"
                    )}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
