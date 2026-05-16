import { FaBolt, FaChessKnight, FaRobot, FaUserGroup } from "react-icons/fa6";

import { HomeActionCard } from "./HomeActionCard";

export function HomeActionGrid() {
  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <HomeActionCard
        title="Quick Play"
        description="Jump back into your latest setup."
        href="/play"
        icon={<FaBolt />}
        featured
      />
      <HomeActionCard
        title="New Game"
        description="Create or join a room."
        href="/play"
        icon={<FaChessKnight />}
      />
      <HomeActionCard
        title="Play Friend"
        description="Start a private room link."
        href="/play"
        icon={<FaUserGroup />}
      />
      <HomeActionCard
        title="Play Bot"
        description="Coming soon."
        icon={<FaRobot />}
        disabled
      />
    </section>
  );
}
