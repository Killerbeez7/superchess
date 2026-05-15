export type GameSidebarTab = "moves" | "info";

type GameSidebarTabsProps = {
  activeTab: GameSidebarTab;
  onChange: (tab: GameSidebarTab) => void;
};

const tabs: { id: GameSidebarTab; label: string }[] = [
  { id: "moves", label: "Moves" },
  { id: "info", label: "Info" },
];

export function GameSidebarTabs({ activeTab, onChange }: GameSidebarTabsProps) {
  return (
    <div className="grid grid-cols-2 border-b border-white/8 bg-[#262421] px-2 pt-2">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative h-10 rounded-t-lg text-sm font-semibold transition ${
              active
                ? "bg-[#24231f] text-white"
                : "text-[#b8b8b8] hover:bg-white/4 hover:text-white"
            }`}
          >
            {tab.label}

            {active && (
              <span className="absolute bottom-0 left-3 right-3 h-[3px] rounded-t-full bg-[#81b64c]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
