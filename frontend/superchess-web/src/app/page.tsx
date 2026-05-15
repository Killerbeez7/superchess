import Link from "next/link";

import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/layout/Container";
import { ChessBoard } from "@/features/game/components/board/ChessBoard";
import { createStartPosition } from "@/utils/board/position";

export default function HomePage() {
  return (
    <PageShell>
      <section className="border-b border-app-border">
        <Container className="grid gap-12 py-20 sm:py-24 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Multiplayer chess prototype
            </p>

            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              SuperChess.com
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-text-muted sm:text-lg">
              A modern twist on classic chess. Explore a world where every move can
              surprise, every match feels different, and multiplayer battles push you to
              think even harder. Freedom, unpredictability, and excitement await.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/play"
                className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-[#1f1e1b] transition hover:brightness-110"
              >
                Start Playing
              </Link>

              <Link
                href="/about"
                className="rounded-full border border-app-border px-6 py-3 text-sm font-semibold text-text-primary transition hover:bg-white/6"
              >
                Learn More
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[560px] lg:ml-auto">
            <ChessBoard variant="hero" position={createStartPosition()} />
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
