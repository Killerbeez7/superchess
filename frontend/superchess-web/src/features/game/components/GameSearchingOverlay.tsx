type GameSearchingOverlayProps = {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
};

export function GameSearchingOverlay({
  isOpen,
  title = "Waiting for opponent",
  subtitle = "Looking for a compatible SuperChess room.",
}: GameSearchingOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-30 grid place-items-center overflow-hidden rounded-[inherit] bg-black/45 px-4">
      <div
        role="status"
        aria-live="polite"
        className="w-full max-w-[340px] rounded-xl border border-border-light bg-card px-5 py-6 text-center shadow-2xl"
      >
        <p className="text-xl font-black text-text-primary">{title}</p>
        <p className="mt-2 text-sm text-text-muted">{subtitle}</p>

        {/* <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border border-border-light bg-bg-muted px-3 py-2"> */}
        <div className="mx-auto mt-5 flex w-fit items-center gap-2 px-3 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary-green" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary-green [animation-delay:120ms]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary-green [animation-delay:240ms]" />
        </div>
      </div>
    </div>
  );
}
