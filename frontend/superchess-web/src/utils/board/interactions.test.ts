import { describe, expect, it } from "vitest";
import { createStartPosition } from "./position";
import { applyOptimisticMoveToFen, getCandidateSquares } from "./interactions";

describe("board position", () => {
  describe("createStartPosition", () => {
    it("createStartingPosition", () => {
      const position = createStartPosition();
      expect(position);
    });
    it("places white king on e1", () => {
      const position = createStartPosition();
      expect(position.e1).toEqual({
        type: "king",
        color: "white",
      });
    });
    it("places black king on e8", () => {
      const position = createStartPosition();
      expect(position.e8).toEqual({
        type: "king",
        color: "black",
      });
    });
  });
  // describe("FEN parsing", () => {
  //   // it("parses a real FEN", () => {});
  //   // it("falls back for invalid FEN", () => {});
  // });
});

describe("board interactions", () => {
  // describe("square helpers", () => {
  //   // it("converts a8 to row 0 col 0", () => {});
  //   // it("returns null for off-board coordinates", () => {});
  // });

  describe("pawns", () => {
    it("shows starting white pawn moves", () => {
      const position = createStartPosition();

      expect(getCandidateSquares(position, "e2", position.e2)).toEqual(["e3", "e4"]);
    });

    it("blocks white pawn when forward square is occupied", () => {
      const position = createStartPosition();

      position.e3 = { type: "knight", color: "black" };

      expect(getCandidateSquares(position, "e2", position.e2)).toEqual([]);
    });

    it("allows white pawn to capture enemy diagonally", () => {
      const position = createStartPosition();

      position.d3 = { type: "knight", color: "black" };

      expect(getCandidateSquares(position, "e2", position.e2)).toEqual([
        "e3",
        "e4",
        "d3",
      ]);
    });

    // it("allows white pawn to capture enemy en pessant", () => {});
  });

  describe("rooks", () => {
    it("has no moves in the starting position", () => {
      const position = createStartPosition();

      expect(getCandidateSquares(position, "a1", position.a1)).toEqual([]);
    });

    it("moves on an open file", () => {
      const position = createStartPosition();

      delete position.a2;
      expect(position.a2).toBeUndefined();

      expect(getCandidateSquares(position, "a1", position.a1)).toEqual([
        "a2",
        "a3",
        "a4",
        "a5",
        "a6",
        "a7",
      ]);
    });
  });
  // describe("knights", () => {});
  // describe("bishops", () => {});
  // describe("kings", () => {});
  // describe("queens", () => {});
  // describe("board position", () => {});
});

it("applies an optimistic pawn move to FEN", () => {
  const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  expect(applyOptimisticMoveToFen(startFen, "e2", "e4")).toBe(
    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1"
  );
});
