import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/layout/Container";
import { HomeActionGrid } from "@/features/home/components/HomeActionGrid";
import { LiveGamesPanel } from "@/features/home/components/LiveGamesPanel";
import { MainDashboardGrid } from "@/features/home/components/MainDashboardGrid";
import { RecentGamesPanel } from "@/features/home/components/RecentGamesPanel";
import { StatsPanel } from "@/features/home/components/StatsPanel";

export default function HomePage() {
  return (
    <PageShell>
      <Container className="pt-5 sm:pt-6 lg:pt-8">
        <MainDashboardGrid>
          <HomeActionGrid />
          <RecentGamesPanel />
          <StatsPanel />
          <LiveGamesPanel />
        </MainDashboardGrid>
      </Container>
    </PageShell>
  );
}
