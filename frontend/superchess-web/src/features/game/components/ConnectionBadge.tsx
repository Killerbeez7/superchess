type ConnectionBadgeProps = {
  isConnected: boolean;
};

export function ConnectionBadge({ isConnected }: ConnectionBadgeProps) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        isConnected
          ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          : "border border-amber-500/20 bg-amber-500/10 text-amber-300"
      }`}
    >
      {isConnected ? "Live" : "Offline"}
    </span>
  );
}
