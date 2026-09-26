"use client";

import Link from "next/link";
import { useState } from "react";
import { FaChessKnight, FaCircleQuestion, FaHouse, FaTableCellsLarge } from "react-icons/fa6";

import { AccountButton } from "./AccountButton";
import { AppSidebarItem } from "./AppSidebarItem";
import { SettingsButton } from "./SettingsButton";

const navItems = [
  { href: "/", label: "Home", icon: <FaHouse />, exact: true },
  { href: "/play", label: "Play", icon: <FaChessKnight /> },
  { href: "/games", label: "Games", icon: <FaTableCellsLarge /> },
  { href: "/about", label: "About", icon: <FaCircleQuestion /> },
];

export function MobileAppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prevOpen) => !prevOpen);
  };

  return (
    <header className="relative z-50 border-b border-app-border bg-sidebar px-3 py-2 lg:hidden">
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-app-menu"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="grid h-10 w-10 place-items-center rounded-xl border border-border-light bg-card-muted text-text-primary shadow-sm transition hover:border-border-medium hover:bg-bg-light"
          >
            <span className="relative block h-4 w-5 shrink-0">
              <span
                className={`absolute left-0 top-0 h-[2px] w-5 rounded-full bg-text-primary transition ${
                  isMenuOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[7px] h-[2px] w-5 rounded-full bg-text-primary transition ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[14px] h-[2px] w-5 rounded-full bg-text-primary transition ${
                  isMenuOpen ? "translate-y-[-7px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>

          <Link
            href="/"
            aria-label="SuperChess home"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-green text-base font-black text-panel shadow-[0_8px_24px_rgba(129,182,76,0.22)] transition hover:bg-primary-green-hover"
          >
            S
          </Link>

          <div className="hidden min-w-0 min-[390px]:block">
            <p className="truncate text-sm font-black leading-tight text-text-primary">
              SuperChess
            </p>
            <p className="truncate text-[11px] font-medium leading-tight text-text-muted">
              Online chess
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <AccountButton variant="icon" onOpen={() => setIsMenuOpen(false)} />
          <SettingsButton variant="icon" onOpen={() => setIsMenuOpen(false)} />
        </div>

        {isMenuOpen && (
          <nav
            id="mobile-app-menu"
            className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-app-border bg-card p-2 shadow-2xl"
          >
            <div className="grid gap-1 rounded-xl bg-card-muted/55 p-1">
              {navItems.map((item) => (
                <AppSidebarItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  exact={item.exact}
                  onClick={() => setIsMenuOpen(false)}
                />
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
