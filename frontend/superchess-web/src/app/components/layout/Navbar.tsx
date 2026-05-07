"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  { label: "Play", href: "play" },
  { label: "Games", href: "#games" },
  { label: "About", href: "#about" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-white transition hover:text-slate-200"
        >
          SuperChess
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="play"
            className="rounded-full border border-white/15 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Start Game
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-md border border-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/5 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          Menu
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-white/10 bg-slate-950 md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6 lg:px-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="play"
              onClick={() => setIsOpen(false)}
              className="mt-2 rounded-full bg-white px-4 py-2 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Start Game
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
