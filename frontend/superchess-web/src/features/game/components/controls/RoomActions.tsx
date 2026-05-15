type RoomActionsProps = {
  copied: boolean;
  onCopyInviteLink: () => void;
  onRefresh: () => void | Promise<void>;
};

export function RoomActions({
  copied,
  onCopyInviteLink,
  onRefresh,
}: RoomActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={onRefresh}
        className="rounded-lg border border-white/[0.08] bg-[#24231f] px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
      >
        Refresh
      </button>

      <button
        type="button"
        onClick={onCopyInviteLink}
        className="rounded-lg border border-white/[0.08] bg-[#24231f] px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
      >
        {copied ? "Copied" : "Invite"}
      </button>
    </div>
  );
}
