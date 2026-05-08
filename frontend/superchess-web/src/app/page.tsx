import { ChessBoardPlaceholder } from "@components/game/ChessBoardPlaceholder";
import { Navbar } from "@components/layout/Navbar";
import Link from "next/link";

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
              <Link
                href="/play"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Start Playing
              </Link>

              <a
                href="#about"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Learn More
              </a>
            </div>
          </div>
          <ChessBoardPlaceholder variant="hero" />
        </div>
      </section>
    </main>
  );
}
