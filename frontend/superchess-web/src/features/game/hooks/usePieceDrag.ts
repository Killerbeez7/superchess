"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { BoardPiece, BoardPosition } from "@/utils/board/position";
import type { BoardPerspective } from "../components/board/ChessBoard";

type PointerState =
  | { kind: "idle" }
  | {
      kind: "pressing";
      from: string;
      piece: BoardPiece | null;
      suppressTap: boolean;
      startX: number;
      startY: number;
      x: number;
      y: number;
      size: number;
      pointerId: number;
    }
  | {
      kind: "dragging";
      from: string;
      piece: BoardPiece;
      hoveredSquare: string | null;
      x: number;
      y: number;
      size: number;
      pointerId: number;
    };

type UsePieceDragArgs = {
  enabled?: boolean;
  perspective?: BoardPerspective;
  position: BoardPosition | undefined;
  onPiecePress?: (square: string, piece: BoardPiece) => boolean | void;
  onTap: (square: string) => void;
  onDragEnd?: (from: string, releasedOn: string | null) => void;
};

const DRAG_THRESHOLD_PX = 8;
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

function squareFromCoords(
  rect: DOMRect,
  clientX: number,
  clientY: number,
  perspective: BoardPerspective
) {
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;

  const visualCol = Math.min(7, Math.max(0, Math.floor((x / rect.width) * 8)));
  const visualRow = Math.min(7, Math.max(0, Math.floor((y / rect.height) * 8)));

  const boardCol = perspective === "white" ? visualCol : 7 - visualCol;
  const boardRow = perspective === "white" ? visualRow : 7 - visualRow;

  return `${FILES[boardCol]}${8 - boardRow}`;
}

function clamp(value: number, min: number, max: number) {
  if (max < min) return (min + max) / 2;
  return Math.min(max, Math.max(min, value));
}

function clampDragPoint(rect: DOMRect, clientX: number, clientY: number) {
  return {
    x: clamp(clientX, rect.left, rect.right),
    y: clamp(clientY, rect.top, rect.bottom),
  };
}

export function usePieceDrag({
  enabled = true,
  perspective = "white",
  position,
  onPiecePress,
  onTap,
  onDragEnd,
}: UsePieceDragArgs) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<PointerState>({ kind: "idle" });
  const [state, setState] = useState<PointerState>({ kind: "idle" });

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setBoth = useCallback((next: PointerState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled) return;
      if (!boardRef.current) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (stateRef.current.kind !== "idle") return;

      event.preventDefault();

      const rect = boardRef.current.getBoundingClientRect();
      const square = squareFromCoords(rect, event.clientX, event.clientY, perspective);
      if (!square) return;

      const piece = position?.[square] ?? null;
      const squareSize = rect.width / 8;
      const size = squareSize * 0.72;
      const point = clampDragPoint(rect, event.clientX, event.clientY);
      const suppressTap = piece ? onPiecePress?.(square, piece) === true : false;

      setBoth({
        kind: "pressing",
        from: square,
        piece,
        suppressTap,
        startX: event.clientX,
        startY: event.clientY,
        x: point.x,
        y: point.y,
        size,
        pointerId: event.pointerId,
      });

      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [enabled, perspective, position, onPiecePress, setBoth]
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const current = stateRef.current;
      if (current.kind === "idle") return;
      if (event.pointerId !== current.pointerId) return;

      event.preventDefault();

      if (current.kind === "pressing") {
        const rect = boardRef.current?.getBoundingClientRect();
        const point = rect
          ? clampDragPoint(rect, event.clientX, event.clientY)
          : { x: event.clientX, y: event.clientY };
        const hoveredSquare = rect
          ? squareFromCoords(rect, event.clientX, event.clientY, perspective)
          : null;
        const distance = Math.hypot(
          event.clientX - current.startX,
          event.clientY - current.startY
        );

        if (distance < DRAG_THRESHOLD_PX) {
          setBoth({ ...current, x: point.x, y: point.y });
          return;
        }

        if (!current.piece) {
          setBoth({ ...current, x: point.x, y: point.y });
          return;
        }

        setBoth({
          kind: "dragging",
          from: current.from,
          piece: current.piece,
          hoveredSquare,
          x: point.x,
          y: point.y,
          size: current.size,
          pointerId: current.pointerId,
        });
        return;
      }

      const rect = boardRef.current?.getBoundingClientRect();
      const point = rect
        ? clampDragPoint(rect, event.clientX, event.clientY)
        : { x: event.clientX, y: event.clientY };

      setBoth({
        ...current,
        hoveredSquare: rect
          ? squareFromCoords(rect, event.clientX, event.clientY, perspective)
          : null,
        x: point.x,
        y: point.y,
      });
    },
    [perspective, setBoth]
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const current = stateRef.current;
      if (current.kind === "idle") return;
      if (event.pointerId !== current.pointerId) return;

      event.preventDefault();

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      const rect = boardRef.current?.getBoundingClientRect();
      const releasedOn = rect
        ? squareFromCoords(rect, event.clientX, event.clientY, perspective)
        : null;

      if (current.kind === "pressing") {
        if (releasedOn === current.from && !current.suppressTap) {
          onTap(current.from);
        } else if (current.piece) {
          onDragEnd?.(current.from, releasedOn);
        }
      } else {
        onDragEnd?.(current.from, releasedOn);
      }

      setBoth({ kind: "idle" });
    },
    [onTap, onDragEnd, perspective, setBoth]
  );

  const handlePointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const current = stateRef.current;
      if (current.kind === "idle") return;
      if (event.pointerId !== current.pointerId) return;

      event.preventDefault();

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      if (current.kind === "dragging" || current.piece) {
        onDragEnd?.(current.from, null);
      }

      setBoth({ kind: "idle" });
    },
    [onDragEnd, setBoth]
  );

  const dragOverlay =
    state.kind === "pressing" && state.piece
      ? { piece: state.piece, x: state.x, y: state.y, size: state.size }
      : state.kind === "dragging"
      ? { piece: state.piece, x: state.x, y: state.y, size: state.size }
      : null;

  const draggingFrom =
    state.kind === "pressing" && state.piece
      ? state.from
      : state.kind === "dragging"
      ? state.from
      : null;

  return {
    boardRef,
    pointerHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
    },
    dragOverlay,
    draggingFrom,
    hoveredSquare:
      state.kind === "dragging" && state.hoveredSquare !== state.from
        ? state.hoveredSquare
        : null,
  };
}
