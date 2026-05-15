"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { AppSidebarItem } from "./AppSidebarItem";

const navItems = [
  { href: "/", label: "Home", icon: "H", exact: true },
  { href: "/play", label: "Play", icon: "P" },
  { href: "/games", label: "Games", icon: "G" },
  { href: "/about", label: "About", icon: "?" },
];

export function MobileAppHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [prevPathname, setPrevPathname] = useState(pathname);

  const toggleMenu = () => {
    setIsMenuOpen((prevOpen) => !prevOpen);
  };

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-app-border bg-sidebar/95 px-3 py-2 backdrop-blur lg:hidden">
      <div className="relative flex items-center justify-between gap-3">
        <Link
          href="/"
          aria-label="SuperChess home"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-green text-base font-black text-panel shadow-[0_8px_24px_rgba(129,182,76,0.22)]"
        >
          S
        </Link>

        <button
          type="button"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-app-menu"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-text-primary transition hover:bg-white/[0.07]"
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

        {isMenuOpen && (
          <nav
            id="mobile-app-menu"
            className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-app-border bg-sidebar p-2 shadow-2xl"
          >
            <div className="grid gap-1">
              {navItems.map((item) => (
                <AppSidebarItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={<span>{item.icon}</span>}
                  exact={item.exact}
                />
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
