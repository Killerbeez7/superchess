"use client";

import Link from "next/link";

type TopNavItem = {
  href?: string;
  label: string;
  mark: string;
  active?: boolean;
  disabled?: boolean;
};

const topNavItems: TopNavItem[] = [
  { href: "/play", label: "Play", mark: "P", active: true },
  { href: "/play", label: "New Game", mark: "+", active: false },
  { href: "/games", label: "Games", mark: "G", active: false },
  { label: "Players", mark: "2", disabled: true },
];

function navItemClassName(active?: boolean, disabled?: boolean) {
  if (disabled) {
    return "cursor-not-allowed text-[#6f6a62]";
  }

  return active
    ? "bg-[#262421] text-white shadow-[inset_0_-2px_0_#81b64c]"
    : "text-[#b8b8b8] hover:bg-white/[0.05] hover:text-white";
}

export function GameSidebarTopNav() {
  return (
    <div className="grid grid-cols-4 border-b border-white/8 bg-[#211f1c]">
      {topNavItems.map((item) => {
        const content = (
          <>
            <span
              className={`grid h-7 w-7 place-items-center rounded-md text-xs font-black ${
                item.active ? "bg-[#81b64c] text-[#211f1c]" : "bg-white/6"
              }`}
            >
              {item.mark}
            </span>
            <span className="max-w-full truncate text-[11px] font-semibold leading-none">
              {item.label}
            </span>
          </>
        );

        const className = `flex h-[62px] min-w-0 flex-col items-center justify-center gap-1.5 px-1 transition ${navItemClassName(
          item.active,
          item.disabled
        )}`;

        if (item.href && !item.disabled) {
          return (
            <Link key={item.label} href={item.href} className={className}>
              {content}
            </Link>
          );
        }

        return (
          <button
            key={item.label}
            type="button"
            disabled={item.disabled}
            className={className}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
