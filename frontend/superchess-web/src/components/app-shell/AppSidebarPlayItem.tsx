"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import {
  FaBookOpen,
  FaChartLine,
  FaChessKnight,
  FaDumbbell,
  FaRobot,
  FaTrophy,
} from "react-icons/fa6";

type PlayMenuItem = {
  href: string;
  label: string;
  description?: string;
  icon: ReactNode;
  isPrimary?: boolean;
  isDisabled?: boolean;
};

type PlayMenuGroup = {
  label: string;
  items: PlayMenuItem[];
};

const playMenuGroups: PlayMenuGroup[] = [
  {
    label: "Play",
    items: [
      {
        href: "/play/online/new",
        label: "Play Online",
        description: "Create a timed room",
        icon: <FaChessKnight />,
        isPrimary: true,
      },
      {
        href: "/play/bot/new",
        label: "Play Bots",
        description: "Practice mode",
        icon: <FaRobot />,
        isDisabled: true,
      },
      {
        href: "/training",
        label: "Training",
        description: "Puzzles and drills",
        icon: <FaDumbbell />,
        isDisabled: true,
      },
    ],
  },
  {
    label: "Progress",
    items: [
      {
        href: "/games",
        label: "Game History",
        description: "Review your games",
        icon: <FaBookOpen />,
      },
      {
        href: "/stats",
        label: "Stats",
        description: "Performance",
        icon: <FaChartLine />,
        isDisabled: true,
      },
      {
        href: "/rankings",
        label: "Rankings",
        description: "Leaderboards",
        icon: <FaTrophy />,
        isDisabled: true,
      },
    ],
  },
];

type PlayMenuRowStyle = CSSProperties & {
  "--row-delay"?: string;
};

function PlayMenuRow({ item, index }: { item: PlayMenuItem; index: number }) {
  const rowStyle: PlayMenuRowStyle = {
    "--row-delay": `${70 + index * 24}ms`,
  };

  const content = (
    <>
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs transition ${
          item.isPrimary
            ? "bg-primary-green text-panel"
            : "text-text-muted group-hover/menu-row:text-text-primary"
        }`}
      >
        {item.icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-bold text-text-muted transition group-hover/menu-row:text-text-primary">
          {item.label}
        </span>

        {/* {item.description ? (
          <span className="mt-0.5 block truncate text-[11px] text-text-muted">
            {item.description}
          </span>
        ) : null} */}
      </span>
    </>
  );

  const className = `sidebar-play-menu-row group/menu-row flex min-w-0 items-center gap-2.5 rounded-lg border border-transparent px-2 py-1.5 text-left transition ${
    item.isDisabled ? "cursor-not-allowed opacity-55" : "hover:bg-bg-light"
  }`;

  if (item.isDisabled) {
    return (
      <div aria-disabled="true" className={className} style={rowStyle}>
        {content}
      </div>
    );
  }

  return (
    <Link href={item.href} className={className} style={rowStyle}>
      {content}
    </Link>
  );
}

export function AppSidebarPlayItem() {
  const pathname = usePathname();

  const isActive =
    pathname === "/play" ||
    pathname.startsWith("/play/") ||
    pathname.startsWith("/game/");

  return (
    <div className="group/play relative">
      <Link
        href="/play"
        aria-current={isActive ? "page" : undefined}
        aria-haspopup="menu"
        className={`group relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
          isActive
            ? "bg-bg-light text-text-primary"
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
          <FaChessKnight />
        </span>

        <span className="truncate">Play</span>
      </Link>

      {/* Invisible desktop hover bridge */}
      <div className="absolute left-full top-0 hidden h-11 w-4 lg:block" />

      {/* Desktop flyout */}
      <div
        role="menu"
        className="sidebar-play-flyout absolute left-[calc(100%+1rem)] top-0 z-60 hidden w-[218px] lg:block"
      >
        <div className="relative rounded-r-2xl border border-border-light bg-card-muted p-1.5 shadow-2xl">
          <div className="grid gap-2">
            {playMenuGroups.map((group, groupIndex) => (
              <section key={group.label} className="grid gap-1">
                {groupIndex > 0 && (
                  <div className="px-2 py-1">
                    <div className="h-px bg-border-light" />
                  </div>
                )}

                <div className="grid gap-1">
                  {group.items.map((item, itemIndex) => (
                    <PlayMenuRow
                      key={item.label}
                      item={item}
                      index={groupIndex * 3 + itemIndex}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
