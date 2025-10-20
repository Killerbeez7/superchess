using SuperChess.Core.Models;
using SuperChess.Core.Engine.Pieces;
using SuperChess.Core.Engine.Serialization;

namespace SuperChess.Core.Engine.Board;

public class ChessBoard
{
    internal Piece?[,] _grid = new Piece?[8, 8];

    // Metadata from FEN
    public PlayerColor Turn { get; internal set; } = PlayerColor.White;
    public string? EnPassantTarget { get; internal set; }
    public bool CanWhiteCastleKingside { get; internal set; } = true;
    public bool CanWhiteCastleQueenside { get; internal set; } = true;
    public bool CanBlackCastleKingside { get; internal set; } = true;
    public bool CanBlackCastleQueenside { get; internal set; } = true;
    public int HalfmoveClock { get; internal set; } = 0;
    public int FullmoveNumber { get; internal set; } = 1;

    // Indexer: Access by Position
    public Piece? this[Position pos]
    {
        get => _grid[pos.Row, pos.Col];
        set => _grid[pos.Row, pos.Col] = value;
    }

    public Piece? this[int row, int col]
    {
        get => _grid[row, col];
        set => _grid[row, col] = value;
    }

    // Thin wrapper for FEN parsing
    public void LoadFromFen(string fen) => FENParser.ParseInto(this, fen);

    // Applies a move: From -> To 
    public void Move(Piece piece, Position from, Position to)
    {
        if (this[from] != piece) throw new InvalidOperationException("Piece not at from position");
        this[to] = piece;
        this[from] = null;
        piece.HasMoved = true;
        // Flip turn, increment clocks
        Turn = Turn == PlayerColor.White ? PlayerColor.Black : PlayerColor.White;
        HalfmoveClock++;
        if (Turn == PlayerColor.White) FullmoveNumber++;
    }

    // Gets legal moves for the side to move, filtered by 'from' square if provided (UCI).
    public IEnumerable<string> GetLegalMoves(PlayerColor side, string? fromUci = null)
    {
        var moves = new List<string>();
        var pieces = GetPieces(side);
        foreach (var pos in pieces)
        {
            if (fromUci != null && pos.ToUci() != fromUci)
                continue;

            var piece = this[pos];
            if (piece == null) continue;

            // Stub: Generate basic moves (e.g., pawn forward; expand with piece-specific)
            var forward = pos + Direction.North;
            if (forward is not null && !IsOccupied(forward))
                moves.Add(pos.ToUci() + forward.ToUci());

            // Add more: e.g., for Rook: Ray in 4 directions, stop at occupied
        }
        return moves;
    }

    // Gets all occupied positions for a color
    public IEnumerable<Position> GetPieces(PlayerColor color)
    {
        for (int r = 0; r < 8; r++)
        {
            for (int c = 0; c < 8; c++)
            {
                if (_grid[r, c]?.Color == color)
                    yield return new Position(r, c);
            }
        }
    }

    // Checks if a position is occupied.
    public bool IsOccupied(Position pos) => this[pos] != null;

    // Deep copy for branching (e.g., minimax).
    public ChessBoard Copy()
    {
        var copy = new ChessBoard();
        for (int r = 0; r < 8; r++)
        {
            for (int c = 0; c < 8; c++)
            {
                if (_grid[r, c] != null)
                    copy[r, c] = (Piece)_grid[r, c]!.Copy();  // Uses Piece.Copy()
            }
        }
        // Copy meta
        copy.Turn = Turn;
        copy.EnPassantTarget = EnPassantTarget;
        copy.CanWhiteCastleKingside = CanWhiteCastleKingside;
        copy.CanWhiteCastleQueenside = CanWhiteCastleQueenside;
        copy.CanBlackCastleKingside = CanBlackCastleKingside;
        copy.CanBlackCastleQueenside = CanBlackCastleQueenside;
        copy.HalfmoveClock = HalfmoveClock;
        copy.FullmoveNumber = FullmoveNumber;
        return copy;
    }

    // Thin wrapper for FEN generation
    public string ToFen() => FENGenerator.Generate(this);

    // Internal: Reset metadata to defaults
    internal void ResetMeta()
    {
        Turn = PlayerColor.White;
        EnPassantTarget = null;
        CanWhiteCastleKingside = true;
        CanWhiteCastleQueenside = true;
        CanBlackCastleKingside = true;
        CanBlackCastleQueenside = true;
        HalfmoveClock = 0;
        FullmoveNumber = 1;
    }
}