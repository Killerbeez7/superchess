"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import {
  FaBolt,
  FaChessBoard,
  FaChessKnight,
  FaClockRotateLeft,
  FaFireFlameCurved,
  FaPuzzlePiece,
  FaShieldHalved,
  FaUserGroup,
} from "react-icons/fa6";

import { Container } from "@/components/layout/Container";
import { PageShell } from "@/components/layout/PageShell";
import { AuthModal } from "@/features/auth/components/AuthModal";
import type { AuthMode } from "@/features/auth/components/AuthModal";
import { ONLINE_SETUP_HREF } from "@/features/game/setupRoutes";

type FeatureCard = {
  title: string;
  body: string;
  icon: React.ReactNode;
};

const features: FeatureCard[] = [
  {
    title: "Break the book",
    body: "Start from classical chess, then step toward games where preparation matters less than adaptation.",
    icon: <FaChessKnight />,
  },
  {
    title: "Every match can turn",
    body: "SuperChess is being built for variants, powers, and board states that reward sharp decisions over memorized comfort.",
    icon: <FaFireFlameCurved />,
  },
  {
    title: "Classic now, chaos next",
    body: "Play stable timed rooms today while the project grows toward custom pieces, battleground rules, and stranger endings.",
    icon: <FaPuzzlePiece />,
  },
];

const currentHighlights = [
  { label: "Online classical rooms", icon: <FaUserGroup /> },
  { label: "Saved setup preferences", icon: <FaClockRotateLeft /> },
  { label: "Realtime multiplayer", icon: <FaBolt /> },
  { label: "Bot and variants evolving", icon: <FaShieldHalved /> },
];

export function LoggedOutLanding() {
  const [authMode, setAuthMode] = useState<AuthMode>("register");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuth = useCallback((mode: AuthMode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  return (
    <PageShell>
      <Container className="py-8 lg:py-12">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <div className="rounded-3xl border border-border-light bg-card p-6 shadow-sm sm:p-8 lg:p-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border-light bg-card-muted px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-text-muted">
                <FaChessBoard className="text-accent" aria-hidden="true" />
                New chess, same board instincts
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight text-text-primary sm:text-5xl lg:text-6xl">
                Welcome to SuperChess.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-text-muted sm:text-lg">
                A modern twist on chess, built to break away from endless preparation and
                memorized lines. Play classic games now, save your progress, and get ready
                for new rules, pieces, and chaotic variants as SuperChess evolves.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => openAuth("register")}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-black text-text-inverse shadow-sm transition hover:bg-accent-hover"
                >
                  Create account
                </button>
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-border-light bg-card-muted px-5 text-sm font-black text-text-primary transition hover:bg-bg-light"
                >
                  Sign in
                </button>
                <Link
                  href={ONLINE_SETUP_HREF}
                  className="inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-bold text-text-muted transition hover:bg-bg-light hover:text-text-primary"
                >
                  Explore play options
                </Link>
              </div>
            </div>

            <div className="mt-10 grid gap-3 md:grid-cols-3">
              {features.map((feature) => (
                <article key={feature.title} className="rounded-2xl bg-bg-dark p-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-icon-muted text-lg text-accent">
                    {feature.icon}
                  </div>
                  <h2 className="mt-4 text-base font-black text-text-primary">
                    {feature.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-text-muted">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-border-light bg-card p-5 shadow-sm">
            <div className="rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">
                Currently playable
              </p>

              <div className="mt-4 grid gap-3">
                {currentHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-xl bg-bg-dark px-3 py-3"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-icon-muted text-accent">
                      {item.icon}
                    </span>
                    <span className="text-sm font-bold text-text-primary">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">
                Why sign in?
              </p>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-text-muted">
                <li>Save your match history and revisit finished games.</li>
                <li>Keep your preferred time control for faster starts.</li>
                <li>Build a profile that can later power stats and variants.</li>
              </ul>
            </div>
          </aside>
        </section>
      </Container>

      <AuthModal
        key={authMode}
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
        reason="Create an account to save games, keep preferences, and jump back into SuperChess faster."
      />
    </PageShell>
  );
}
