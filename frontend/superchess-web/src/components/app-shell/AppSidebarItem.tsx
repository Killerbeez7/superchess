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
          ? "bg-[#3a352d] text-white"
          : "text-text-muted hover:bg-white/[0.07] hover:text-text-primary"
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-2 h-7 w-1 rounded-r-full bg-primary-green" />
      )}
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-md text-base leading-none transition ${
          !isActive && "bg-white/6 group-hover:bg-[#3a352d]"
        }`}
      >
        {icon}
      </span>

      <span className="truncate">{label}</span>
    </Link>
  );
}
