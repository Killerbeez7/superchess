"use client";

import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import type { GameResponse, MoveSummary } from "@/types/game";
import type { LocalGameSession } from "@/lib/storage/gameSession";
import { ConnectionBadge } from "./ConnectionBadge";
import { PlayerPanel } from "./PlayerPanel";
import { JoinGameForm } from "./JoinGameForm";
import { MoveHistory } from "./history/MoveHistory";
import { RoomActions } from "./RoomActions";
import { PlayerIdentitySetup } from "./PlayerIdentitySetup";

type Props = {
  game: GameResponse | null;
  session: LocalGameSession | null;
  isLoading: boolean;
  isConnected: boolean;
  isJoining: boolean;
  identityName: string | null;
  isIdentityReady: boolean;
  onSaveIdentity: (displayName: string) => void;
  onJoin: () => Promise<void>;
  onRefresh: () => void;
};

export function GameSidebar({
  game,
  session,
  isLoading,
  isConnected,
  isJoining,
  identityName,
  isIdentityReady,
  onSaveIdentity,
  onJoin,
  onRefresh,
}: Props) {
  const canJoinAsBlack = !!game && !game.blackPlayer && game.status === "waiting";
  const isSameBrowserWhite = !!session && session.color === "white" && canJoinAsBlack;
  const activeColor = game?.whoseTurn === "black" ? "black" : "white";

  return (
    <aside className="lg:h-[calc(100dvh-8rem)]">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur lg:flex lg:h-full lg:flex-col lg:overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <ConnectionBadge isConnected={isConnected} />
        </div>

        <RoomCode roomCode={game?.id ?? ""} />

        <Players game={game} isLoading={isLoading} activeColor={activeColor} />

        <div className="mt-4 border-t border-white/10 pt-4">
          {!session ? (
            <RoomJoinPanel
              canJoinAsBlack={canJoinAsBlack}
              hasBlackPlayer={!!game?.blackPlayer}
              isSameBrowserWhite={isSameBrowserWhite}
              isJoining={isJoining}
              identityName={identityName}
              isIdentityReady={isIdentityReady}
              onSaveIdentity={onSaveIdentity}
              onJoin={onJoin}
            />
          ) : (
            <MovesPanel moves={game?.moves ?? []} />
          )}
        </div>

        <div className="mt-4 border-t border-white/10 pt-4">
          <RoomActions onRefresh={onRefresh} />
        </div>
      </section>
    </aside>
  );
}

function RoomCode({ roomCode }: { roomCode: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/70 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
        Room code
      </p>
      <p className="mt-1.5 break-all font-mono text-[13px] text-slate-400">{roomCode}</p>
    </div>
  );
}

function Players({
  game,
  isLoading,
  activeColor,
}: {
  game: GameResponse | null;
  isLoading: boolean;
  activeColor: "white" | "black";
}) {
  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Players
        </p>
      </div>
      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/70 p-6">
          <LoadingSpinner />
        </div>
      ) : game ? (
        <div className="grid gap-3">
          <PlayerPanel
            color="white"
            name={game.whitePlayer.displayName}
            detail="White"
            isActive={activeColor === "white"}
          />
          <PlayerPanel
            color="black"
            name={game.blackPlayer?.displayName ?? "Waiting for black"}
            detail={game.blackPlayer ? "Black" : "Open seat"}
            isActive={activeColor === "black"}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
          No table data available.
        </div>
      )}
    </div>
  );
}

function RoomJoinPanel({
  canJoinAsBlack,
  hasBlackPlayer,
  isSameBrowserWhite,
  isJoining,
  identityName,
  isIdentityReady,
  onSaveIdentity,
  onJoin,
}: {
  canJoinAsBlack: boolean;
  hasBlackPlayer: boolean;
  isSameBrowserWhite: boolean;
  isJoining: boolean;
  identityName: string | null;
  isIdentityReady: boolean;
  onSaveIdentity: (displayName: string) => void;
  onJoin: () => Promise<void>;
}) {
  return (
    <>
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Room
        </p>
        {canJoinAsBlack && (
          <h3 className="mt-1 text-sm font-semibold text-white">Take the black side</h3>
        )}
        <p className="mt-2 text-sm leading-7 text-slate-300">
          {canJoinAsBlack
            ? identityName
              ? `Ready to join as ${identityName}.`
              : "Choose your player name to sit across from white."
            : hasBlackPlayer
            ? "Both players are seated."
            : "Waiting for an opponent."}
        </p>
      </div>

      {canJoinAsBlack &&
        !isSameBrowserWhite &&
        (!isIdentityReady ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/70 p-6">
            <LoadingSpinner />
          </div>
        ) : identityName ? (
          <JoinGameForm
            isJoining={isJoining}
            playerName={identityName}
            onSubmit={onJoin}
          />
        ) : (
          <PlayerIdentitySetup onSave={onSaveIdentity} />
        ))}

      {canJoinAsBlack && isSameBrowserWhite && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
          This browser session already owns the white seat, so joining as black is blocked
          here too.
        </div>
      )}
    </>
  );
}

function MovesPanel({ moves }: { moves: MoveSummary[] }) {
  return (
    <>
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Moves
        </p>
        <h3 className="mt-1 text-sm font-semibold text-white">History</h3>
      </div>
      <MoveHistory moves={moves} />
    </>
  );
}
