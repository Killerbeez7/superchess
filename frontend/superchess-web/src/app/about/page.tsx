import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  FaBolt,
  FaChessKing,
  FaChessKnight,
  FaCirclePlay,
  FaDiscord,
  FaGlobe,
  FaShieldHalved,
  FaTrophy,
  FaUserGroup,
} from "react-icons/fa6";

import { PageShell } from "@/components/layout/PageShell";
import { ONLINE_SETUP_HREF } from "@/features/game/setupRoutes";

type CardItem = {
  title: string;
  body: string;
  icon: ReactNode;
};

const articles: CardItem[] = [
  {
    title: "What is SuperChess?",
    body: "SuperChess keeps the strategy, depth, and pure skill of classic chess, then opens the door to freedom. It starts with stable online games and grows toward new pieces, bigger boards, and dynamic variants where every match can shift in a new direction.",
    icon: <FaChessKing />,
  },
  {
    title: "Built for Players",
    body: "Focused matches, bot practice, and experimental battles should all feel fair, fast, and readable. No pay-to-win. No tricks. Just chess, reimagined.",
    icon: <FaUserGroup />,
  },
];

const availableNow: CardItem[] = [
  {
    title: "Online games",
    body: "Real players, real matches.",
    icon: <FaGlobe />,
  },
  {
    title: "Saved setup",
    body: "Your time control. Your style.",
    icon: <FaShieldHalved />,
  },
  {
    title: "Realtime play",
    body: "Live updates. Smooth experience.",
    icon: <FaBolt />,
  },
];

const comingSoon: CardItem[] = [
  {
    title: "New variants",
    body: "More ways to play.",
    icon: <FaBolt />,
  },
  {
    title: "Special pieces",
    body: "Break the rules. Change the game.",
    icon: <FaChessKnight />,
  },
  {
    title: "Tournaments",
    body: "Compete. Climb. Prove yourself.",
    icon: <FaTrophy />,
  },
];

export default function AboutPage() {
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-[1700px] px-0 pb-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
        <section className="relative overflow-hidden rounded-none border-b border-border-light bg-card shadow-sm sm:rounded-2xl sm:border">
          <Image
            src="/images/about/superchess-hero.png"
            alt=""
            fill
            priority
            aria-hidden="true"
            sizes="(min-width: 1024px) calc(100vw - 280px), calc(100vw - 32px)"
            className="object-cover opacity-25 sm:opacity-35"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_35%,rgba(129,182,76,0.12),transparent_30%),linear-gradient(90deg,rgba(31,30,27,0.96)_0%,rgba(31,30,27,0.86)_43%,rgba(31,30,27,0.52)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-card/75 via-transparent to-transparent" />

          <div className="relative z-10 grid min-h-[250px] gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,440px)] lg:items-center lg:p-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-black leading-tight text-text-primary sm:text-4xl lg:text-5xl">
                Chess that starts familiar, then refuses to stay predictable.
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-6 text-text-muted sm:text-base">
                SuperChess is a modern evolution of the world&apos;s most timeless game.
                Classic at its core, but built to break the limits of repetition. New
                rules. New pieces. New strategies. Same beautiful chaos.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={ONLINE_SETUP_HREF}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-black text-text-inverse shadow-sm transition hover:bg-accent-hover sm:w-auto"
                >
                  <FaBolt aria-hidden="true" />
                  Play now
                </Link>
                <Link
                  href="/games"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border-light bg-card-muted/80 px-5 text-sm font-black text-text-primary transition hover:bg-bg-light sm:w-auto"
                >
                  <FaTrophy aria-hidden="true" />
                  View history
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-border-light bg-bg-dark/65 p-2 shadow-lg backdrop-blur-[2px] lg:translate-y-2">
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <Image
                  src="/images/about/superchess-hero-card.webp"
                  alt="Dark fantasy chess battlefield with a glowing king"
                  fill
                  priority
                  sizes="(min-width: 1024px) 380px, calc(100vw - 72px)"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 px-4 sm:mt-4 sm:px-0 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.76fr)_minmax(310px,0.86fr)]">
          <div className="grid gap-4">
            {articles.map((article) => (
              <InfoCard key={article.title} item={article} />
            ))}
          </div>

          <div className="grid gap-4 xl:self-start">
            <StackedList
              title="Currently Available"
              items={availableNow}
              marker="green"
            />
            <StackedList title="What's Coming" items={comingSoon} marker="gold" />
          </div>

          <aside className="grid gap-4 xl:self-start">
            <section className="rounded-none border-0 border-b border-border-light bg-transparent p-0 pb-4 shadow-none sm:rounded-xl sm:border sm:border-border-light sm:bg-card sm:bg-[linear-gradient(135deg,rgba(255,255,255,0.035),transparent_55%)] sm:p-4 sm:shadow-sm">
              <div className="flex items-center gap-2">
                <FaCirclePlay className="text-accent" aria-hidden="true" />
                <h2 className="text-sm font-black text-text-primary">Gameplay teaser</h2>
              </div>

              <div className="relative mt-3 aspect-video overflow-hidden rounded-lg border border-border-medium bg-bg-dark shadow-lg">
                <Image
                  src="/images/about/gameplay-teaser.png"
                  alt="SuperChess gameplay teaser"
                  fill
                  sizes="(min-width: 1280px) 310px, calc(100vw - 48px)"
                  className="object-cover"
                />
                <span className="absolute inset-0 grid place-items-center bg-black/20">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-text-primary/90 text-lg text-text-inverse shadow-xl ring-4 ring-black/20">
                    <FaCirclePlay aria-hidden="true" />
                  </span>
                </span>
                <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 to-transparent px-3 pb-3 pt-10">
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-text-primary">
                    Teaser preview
                  </span>
                </span>
              </div>
            </section>

            <CommunityPanel />
          </aside>
        </section>
      </div>
    </PageShell>
  );
}

function InfoCard({ item }: { item: CardItem }) {
  return (
    <article className="rounded-none border-0 border-b border-border-light bg-transparent p-0 pb-4 shadow-none sm:rounded-xl sm:border sm:border-border-light sm:bg-card sm:bg-[linear-gradient(135deg,rgba(255,255,255,0.035),transparent_55%)] sm:p-5 sm:shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-icon-muted text-sm text-accent sm:h-8 sm:w-8 sm:text-base">
          {item.icon}
        </span>
        <h2 className="text-lg font-black text-text-primary">{item.title}</h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-text-muted">{item.body}</p>
    </article>
  );
}

function StackedList({
  title,
  items,
  marker,
}: {
  title: string;
  items: CardItem[];
  marker: "green" | "gold";
}) {
  return (
    <section className="rounded-none border-0 border-b border-border-light bg-transparent p-0 pb-4 shadow-none sm:rounded-xl sm:border sm:border-border-light sm:bg-card sm:bg-[linear-gradient(135deg,rgba(255,255,255,0.035),transparent_55%)] sm:p-4 sm:shadow-sm">
      <div className="flex items-center gap-2">
        <span
          className={
            marker === "green"
              ? "h-3 w-3 rounded-full bg-accent"
              : "h-3 w-3 rounded-full bg-[#d5a94d]"
          }
        />
        <h2 className="text-sm font-black text-text-primary">{title}</h2>
      </div>

      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-lg py-0.5 sm:px-1">
            <div className="flex items-center gap-2">
            <span
              className={
                marker === "green"
                  ? "text-base text-accent"
                  : "text-base text-[#d5a94d]"
              }
            >
              {item.icon}
            </span>
              <h3 className="text-sm font-black text-text-primary">{item.title}</h3>
            </div>
            <p className="mt-1 text-xs leading-5 text-text-muted">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CommunityPanel() {
  return (
    <section className="rounded-none border-0 border-b border-border-light bg-transparent p-0 pb-4 shadow-none sm:rounded-xl sm:border sm:border-border-light sm:bg-card sm:bg-[linear-gradient(135deg,rgba(255,255,255,0.035),transparent_55%)] sm:p-4 sm:shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-text-muted">
          <FaDiscord />
        </span>
        <h2 className="text-sm font-black text-text-primary">Community & Feedback</h2>
      </div>
      <p className="mt-2 text-xs leading-5 text-text-muted">
        Share ideas, report bugs, and help shape what SuperChess becomes next.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        <button
          type="button"
          className="h-9 rounded-lg border border-border-light bg-card-muted text-xs font-black text-text-primary transition hover:bg-bg-light"
        >
          Join Discord
        </button>
        <button
          type="button"
          className="h-9 rounded-lg border border-border-light bg-card-muted text-xs font-black text-text-primary transition hover:bg-bg-light"
        >
          Send feedback
        </button>
      </div>
    </section>
  );
}
