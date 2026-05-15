import { Container } from "@/components/layout/Container";
import { PageShell } from "@/components/layout/PageShell";

export default function AboutPage() {
  return (
    <PageShell>
      <Container className="flex min-h-[calc(100dvh-4rem)] items-center justify-center py-16">
        <div className="max-w-2xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#81b64c]">
            Games
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            About page coming soon.
          </h1>

          <p className="mt-4 text-base leading-7 text-text-muted">
            Match history, active rooms, and archived games will live here.
          </p>
        </div>
      </Container>
    </PageShell>
  );
}
