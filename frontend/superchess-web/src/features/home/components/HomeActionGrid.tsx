import { FaBolt, FaChessKnight, FaRobot, FaUserGroup } from "react-icons/fa6";

import {
  DEFAULT_ONLINE_SETUP_HREF,
  FRIEND_ONLINE_SETUP_HREF,
} from "@/features/game/setupRoutes";

import { HomeActionCard } from "./HomeActionCard";

export function HomeActionGrid() {
  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <HomeActionCard
        title="Quick Play"
        description="Jump back into your latest setup."
        href={DEFAULT_ONLINE_SETUP_HREF}
        icon={<FaBolt />}
        featured
      />
      <HomeActionCard
        title="New Game"
        description="Create or join a room."
        href={DEFAULT_ONLINE_SETUP_HREF}
        icon={<FaChessKnight />}
      />
      <HomeActionCard
        title="Play Friend"
        description="Start a private room link."
        href={FRIEND_ONLINE_SETUP_HREF}
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
