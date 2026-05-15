type GameRoomShellProps = {
  table: React.ReactNode;
  sidebar: React.ReactNode;
};

export function GameRoomShell({ table, sidebar }: GameRoomShellProps) {
  return (
    <main
      className="h-[calc(100dvh-57px)] overflow-hidden bg-app p-3 lg:h-dvh lg:p-4"
      style={{
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        overscrollBehavior: "none",
      }}
    >
      <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">
        <section className="flex min-h-0 items-center justify-center overflow-hidden">
          {table}
        </section>

        <aside className="hidden min-h-0 overflow-hidden lg:block">{sidebar}</aside>
      </div>
    </main>
  );
}
