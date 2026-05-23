import Link from "next/link";
import Image from "next/image";
import {
  FaBolt,
  FaChessKnight,
  FaChessQueen,
  FaCirclePlay,
  FaClock,
  FaLayerGroup,
  FaPeopleGroup,
  FaShieldHalved,
} from "react-icons/fa6";

import { Container } from "@/components/layout/Container";
import { PageShell } from "@/components/layout/PageShell";
import { ONLINE_SETUP_HREF } from "@/features/game/setupRoutes";

const availableNow = [
  {
    label: "Realtime rooms",
    body: "Create a timed room, share it, and play through live SignalR updates.",
    icon: <FaPeopleGroup />,
  },
  {
    label: "Saved identity",
    body: "Accounts keep preferences, history, and setup choices ready between sessions.",
    icon: <FaShieldHalved />,
  },
  {
    label: "Game history",
    body: "Completed online matches are separated from bot games and waiting rooms.",
    icon: <FaLayerGroup />,
  },
];

const roadmap = [
  "Sharper bot levels and training-style practice.",
  "Variant rules that change the shape of the position.",
  "Special pieces and battleground modes after the classical base is stable.",
  "Profile stats that grow from real completed matches.",
];

export default function AboutPage() {
  return (
    <PageShell>
      <Container className="py-6 sm:py-8 lg:py-10">
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
          <article className="relative overflow-hidden rounded-3xl border border-border-light bg-card p-6 shadow-sm sm:p-8 lg:p-10">
            <Image
              src="/images/about/superchess-hero.png"
              alt=""
              fill
              priority
              aria-hidden="true"
              sizes="(min-width: 1024px) calc(100vw - 680px), calc(100vw - 32px)"
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(129,182,76,0.22),transparent_34%),linear-gradient(90deg,rgba(31,30,27,0.98)_0%,rgba(31,30,27,0.9)_42%,rgba(31,30,27,0.58)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-card to-transparent" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-border-light bg-card-muted/90 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-text-muted shadow-sm">
                <FaChessKnight className="text-accent" aria-hidden="true" />
                About SuperChess
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-text-primary sm:text-5xl lg:text-6xl">
                Chess that starts familiar, then refuses to stay predictable.
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-7 text-text-muted sm:text-lg">
                SuperChess is a portfolio full-stack chess project built around a simple
                idea: keep the elegance of classical chess, then make room for surprise.
                The stable base is timed online chess, history, accounts, realtime play,
                and bots. The long-term direction is a more chaotic strategy game where
                memorized openings matter less than adapting to the board in front of you.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={ONLINE_SETUP_HREF}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-black text-text-inverse shadow-sm transition hover:bg-accent-hover"
                >
                  Play now
                </Link>
                <Link
                  href="/games"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-border-light bg-card-muted/90 px-5 text-sm font-black text-text-primary transition hover:bg-bg-light"
                >
                  View history
                </Link>
              </div>
            </div>
          </article>

          <aside className="rounded-3xl border border-border-light bg-card p-4 shadow-sm">
            <div className="overflow-hidden rounded-2xl border border-border-light bg-bg-dark">
              <div className="relative aspect-4/3 overflow-hidden">
                <Image
                  src="/images/about/superchess-hero-card.webp"
                  alt="Stylized SuperChess board teaser"
                  fill
                  priority
                  sizes="(min-width: 1024px) 420px, calc(100vw - 48px)"
                  className="object-cover"
                />
              </div>

              <div className="border-t border-border-light bg-card-muted p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                  SuperChess preview
                </p>
                <p className="mt-2 text-sm leading-6 text-text-primary">
                  Classical chess foundations, realtime play, and room for stranger
                  variants as the project grows.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-5">
            <article className="rounded-3xl border border-border-light bg-card p-6 shadow-sm sm:p-7">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-lg text-text-inverse">
                  <FaBolt />
                </span>
                <div>
                  <h2 className="text-2xl font-black text-text-primary">
                    Why build another chess app?
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-text-muted sm:text-base">
                    Because chess is brilliant, but the online experience often becomes a
                    race through known structures. SuperChess starts with a clean
                    classical MVP so the foundation is honest: legal moves, clocks,
                    sessions, realtime updates, and reliable game records. From there, the
                    project can bend the rules without turning into a messy demo.
                  </p>
                  <p className="mt-4 text-sm leading-7 text-text-muted sm:text-base">
                    The goal is not to replace traditional chess. It is to create a second
                    lane beside it: a place where players still calculate, still plan, but
                    cannot rely on the same preparation every match.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-border-light bg-card p-6 shadow-sm sm:p-7">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-icon-muted text-lg text-accent">
                  <FaChessQueen />
                </span>
                <div>
                  <h2 className="text-2xl font-black text-text-primary">
                    The product direction
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-text-muted sm:text-base">
                    The current app focuses on a stable multiplayer loop. Accounts create
                    games, rooms update live, timers decide games, and history keeps the
                    main human-vs-human record clean. Bot games exist separately so
                    practice does not pollute the online match story.
                  </p>
                  <p className="mt-4 text-sm leading-7 text-text-muted sm:text-base">
                    Once the core stays solid, SuperChess can add the fun parts: stronger
                    bots, custom modes, larger rule sets, and special mechanics that make
                    each match feel less scripted.
                  </p>
                </div>
              </div>
            </article>
          </div>

          <aside className="grid gap-5 xl:self-start">
            <section className="rounded-3xl border border-border-light bg-card p-5 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">
                Available now
              </h2>

              <div className="mt-4 grid gap-3">
                {availableNow.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-card-muted p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-icon-muted text-accent">
                        {item.icon}
                      </span>
                      <h3 className="font-black text-text-primary">{item.label}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-text-muted">{item.body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-border-light bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">
                  Tutorial teaser
                </h2>
                <FaCirclePlay className="text-2xl text-accent" aria-hidden="true" />
              </div>

              <div className="mt-4 rounded-2xl border border-border-light bg-bg-dark p-5">
                <p className="text-lg font-black text-text-primary">
                  90-second intro video
                </p>
                <p className="mt-3 text-sm leading-6 text-text-muted">
                  A short walkthrough can live here: create a room, invite a player, make
                  the first move, then preview the future variant direction.
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-border-light bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-icon-muted text-accent">
                  <FaClock />
                </span>
                <h2 className="text-lg font-black text-text-primary">What is next?</h2>
              </div>

              <ul className="mt-4 grid gap-3 text-sm leading-6 text-text-muted">
                {roadmap.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </section>
      </Container>
    </PageShell>
  );
}
