import Link from "next/link";

import { RoomActions } from "./RoomActions";

type GameActionsPanelProps = {
  actionLabel: string;
  copied: boolean;
  onCopyInviteLink: () => void;
  onRefresh: () => void | Promise<void>;
};

export function GameActionsPanel({
  actionLabel,
  copied,
  onCopyInviteLink,
  onRefresh,
}: GameActionsPanelProps) {
  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#211f1c] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b8b8b8]">
        Game controls
      </p>

      <div className="mt-3 grid gap-2">
        <Link
          href="/play"
          className="rounded-lg bg-[#81b64c] px-3 py-2.5 text-center text-sm font-bold text-[#211f1c] transition hover:bg-[#95c85a]"
        >
          {actionLabel}
        </Link>

        <RoomActions
          copied={copied}
          onCopyInviteLink={onCopyInviteLink}
          onRefresh={onRefresh}
        />
      </div>
    </section>
  );
}
