type ConnectionBadgeProps = {
  isConnected: boolean;
};

export function ConnectionBadge({ isConnected }: ConnectionBadgeProps) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        isConnected
          ? "border border-primary-green/25 bg-primary-green/10 text-primary-green"
          : "border border-amber-500/20 bg-amber-500/10 text-amber-300"
      }`}
    >
      {isConnected ? "Live" : "Offline"}
    </span>
  );
}
