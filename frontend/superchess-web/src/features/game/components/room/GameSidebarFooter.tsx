"use client";

type GameSidebarFooterProps = {
  isActiveGame: boolean;
};

export function GameSidebarFooter({ isActiveGame }: GameSidebarFooterProps) {
  return (
    <footer className="shrink-0 border-t border-white/8 bg-[#211f1c] p-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled
          className={`rounded-lg border border-white/8 bg-[#24231f] px-3 py-2 text-xs font-semibold ${
            isActiveGame ? "text-[#b8b8b8]" : "text-[#6f6a62]"
          }`}
        >
          Draw
        </button>
        <button
          type="button"
          disabled
          className={`rounded-lg border border-white/8 bg-[#24231f] px-3 py-2 text-xs font-semibold ${
            isActiveGame ? "text-[#b8b8b8]" : "text-[#6f6a62]"
          }`}
        >
          Resign
        </button>
      </div>
    </footer>
  );
}
