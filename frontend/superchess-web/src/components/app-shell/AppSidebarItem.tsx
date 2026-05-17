"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AppSidebarItemProps = {
  href: string;
  label: string;
  icon: ReactNode;
  exact?: boolean;
};

export function AppSidebarItem({
  href,
  label,
  icon,
  exact = false,
}: AppSidebarItemProps) {
  const pathname = usePathname();

  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`group relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
        isActive
          ? "bg-bg-light text-white"
          : "text-text-muted hover:bg-bg-light hover:text-text-primary"
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-2 h-7 w-1 rounded-r-full bg-primary-green" />
      )}

      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-md text-base leading-none transition ${
          isActive
            ? "bg-bg-light text-text-primary"
            : "text-text-muted group-hover:bg-bg-light group-hover:text-text-primary"
        }`}
      >
        {icon}
      </span>

      <span className="truncate">{label}</span>
    </Link>
  );
}
