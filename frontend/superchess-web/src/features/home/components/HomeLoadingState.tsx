import { Container } from "@/components/layout/Container";
import { PageShell } from "@/components/layout/PageShell";

export function HomeLoadingState() {
  return (
    <PageShell>
      <Container className="py-8 lg:py-12">
        <div className="grid gap-5 min-[1400px]:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex min-h-16 items-center gap-5 rounded-xl border border-border-light bg-card px-5 py-3"
                >
                  <div className="h-10 w-10 rounded-lg bg-bg-light" />
                  <div className="space-y-2">
                    <div className="h-4 w-28 rounded-full bg-bg-light" />
                    <div className="h-3 w-36 rounded-full bg-bg-muted" />
                  </div>
                </div>
              ))}
            </div>

            <div className="h-48 rounded-2xl border border-border-light bg-card" />
          </div>

          <aside className="grid gap-5 min-[1400px]:self-start">
            <div className="h-48 rounded-2xl border border-border-light bg-card" />
            <div className="h-36 rounded-2xl border border-border-light bg-card" />
          </aside>
        </div>
      </Container>
    </PageShell>
  );
}
