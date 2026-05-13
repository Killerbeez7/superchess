namespace SuperChess.Core.Chess;

/// <summary>
/// Mutable board representation. Each square is either empty (null) or holds a char piece.
/// Uppercase = white (P, N, B, R, Q, K), lowercase = black (p, n, b, r, q, k).
/// </summary>
internal sealed class Board
{
    private readonly char?[] _cells = new char?[64];

    // Access

    public char? this[Square sq]
    {
        get => sq.IsValid ? _cells[sq.Rank * 8 + sq.File] : null;
        set
        {
            if (sq.IsValid) _cells[sq.Rank * 8 + sq.File] = value;
        }
    }

    public char? this[int file, int rank]
    {
        get => file is >= 0 and <= 7 && rank is >= 0 and <= 7 ? _cells[rank * 8 + file] : null;
        set
        {
            if (file is >= 0 and <= 7 && rank is >= 0 and <= 7) _cells[rank * 8 + file] = value;
        }
    }

    public bool IsOccupied(Square sq) => this[sq].HasValue;
    public bool IsEmpty(Square sq) => !IsOccupied(sq);

    // Color helpers

    public static bool IsWhite(char piece) => char.IsUpper(piece);
    public static bool IsBlack(char piece) => char.IsLower(piece);

    public static PieceColor ColorOf(char piece) =>
        IsWhite(piece) ? PieceColor.White : PieceColor.Black;

    public static bool SameColor(char a, char b) =>
        IsWhite(a) == IsWhite(b);

    public static bool IsKing(char piece) =>
        char.ToLowerInvariant(piece) == 'k';

    // Find king

    public Square? FindKing(PieceColor color)
    {
        var king = color == PieceColor.White ? 'K' : 'k';
        for (var r = 0; r < 8; r++)
        for (var f = 0; f < 8; f++)
        {
            if (_cells[r * 8 + f] == king)
                return new Square(f, r);
        }

        return null;
    }

    // Attack detection

    public bool IsAttackedBy(Square target, PieceColor byColor)
    {
        // Check all 8 directions for sliding pieces (rook/bishop/queen).
        // Check knight jumps.
        // Check pawn attacks.
        // Check king adjacency.

        var isWhiteAttacker = byColor == PieceColor.White;

        // --- Pawn attacks ---
        var pawnChar = isWhiteAttacker ? 'P' : 'p';
        var pawnDir = isWhiteAttacker ? -1 : 1;
        for (var df = -1; df <= 1; df += 2)
        {
            var pawnSq = target.Offset(df, pawnDir);
            if (pawnSq.IsValid && this[pawnSq] == pawnChar)
                return true;
        }

        // --- Knight attacks ---
        var knightChar = isWhiteAttacker ? 'N' : 'n';
        ReadOnlySpan<(int df, int dr)> knightMoves =
        [
            (-2, -1), (-2, 1), (-1, -2), (-1, 2),
            (1, -2), (1, 2), (2, -1), (2, 1)
        ];
        foreach (var (df, dr) in knightMoves)
        {
            var sq = target.Offset(df, dr);
            if (sq.IsValid && this[sq] == knightChar)
                return true;
        }

        // King attacks (adjacency)
        var kingChar = isWhiteAttacker ? 'K' : 'k';
        for (var df = -1; df <= 1; df++)
        for (var dr = -1; dr <= 1; dr++)
        {
            if (df == 0 && dr == 0) continue;
            var sq = target.Offset(df, dr);
            if (sq.IsValid && this[sq] == kingChar)
                return true;
        }

        // Sliding pieces (rook/queen along ranks/files, bishop/queen along diagonals) 
        var rookChar = isWhiteAttacker ? 'R' : 'r';
        var bishopChar = isWhiteAttacker ? 'B' : 'b';
        var queenChar = isWhiteAttacker ? 'Q' : 'q';

        // Straight directions (rook/queen)
        ReadOnlySpan<(int df, int dr)> straightDirs = [(0, 1), (0, -1), (1, 0), (-1, 0)];
        foreach (var (df, dr) in straightDirs)
        {
            if (ScanRay(target, df, dr, rookChar, queenChar))
                return true;
        }

        // Diagonal directions (bishop/queen)
        ReadOnlySpan<(int df, int dr)> diagDirs = [(1, 1), (1, -1), (-1, 1), (-1, -1)];
        foreach (var (df, dr) in diagDirs)
        {
            if (ScanRay(target, df, dr, bishopChar, queenChar))
                return true;
        }

        return false;
    }

    /// Scans along a ray from a square. Returns true if the first piece found is one of piece1 or piece2.
    private bool ScanRay(Square from, int df, int dr, char piece1, char piece2)
    {
        var sq = from.Offset(df, dr);
        while (sq.IsValid)
        {
            var p = this[sq];
            if (p.HasValue)
                return p.Value == piece1 || p.Value == piece2;
            sq = sq.Offset(df, dr);
        }

        return false;
    }

    // Move simulation

    /// Applies a move (mutates the board). Does not validate legality.
    /// Returns the captured piece (if any).
    public char? ApplyMove(Square from, Square to)
    {
        var captured = this[to];
        this[to] = this[from];
        this[from] = null;
        return captured;
    }

    /// Undoes a move (mutates the board).
    public void UndoMove(Square from, Square to, char? captured)
    {
        this[from] = this[to];
        this[to] = captured;
    }

    /// Returns true if the specified color's king is currently in check.
    public bool IsInCheck(PieceColor color)
    {
        var kingSq = FindKing(color);
        if (kingSq is null) return false;
        var enemy = color == PieceColor.White ? PieceColor.Black : PieceColor.White;
        return IsAttackedBy(kingSq.Value, enemy);
    }

    /// Returns true if playing move from→to would leave the moving side's king in check.
    /// Temporarily applies and undoes the move.
    public bool WouldLeaveKingInCheck(Square from, Square to, PieceColor movingColor)
    {
        var captured = ApplyMove(from, to);
        var inCheck = IsInCheck(movingColor);
        UndoMove(from, to, captured);
        return inCheck;
    }

    // Enumerate all legal moves

    /// Returns true if the given color has at least one legal move.
    /// Used for checkmate/stalemate detection. Stops at the first legal move found.
    public bool HasAnyLegalMove(PieceColor color)
    {
        for (var r = 0; r < 8; r++)
        for (var f = 0; f < 8; f++)
        {
            var piece = this[f, r];
            if (!piece.HasValue) continue;
            if (ColorOf(piece.Value) != color) continue;

            var from = new Square(f, r);
            var moves = GetPseudoLegalMoves(from, piece.Value);
            foreach (var to in moves)
            {
                if (!WouldLeaveKingInCheck(from, to, color))
                    return true;
            }
        }

        return false;
    }

    /// Returns pseudo-legal target squares for a piece on the given square.
    /// "Pseudo-legal" means piece movement rules are respected (path clear, captures, etc.)
    /// but the move might leave the king in check.
    public List<Square> GetPseudoLegalMoves(Square from, char piece)
    {
        var targets = new List<Square>();
        var isWhite = IsWhite(piece);

        switch (char.ToLowerInvariant(piece))
        {
            case 'p':
                AddPawnMoves(from, isWhite, targets);
                break;
            case 'n':
                AddKnightMoves(from, isWhite, targets);
                break;
            case 'b':
                AddSlidingMoves(from, isWhite, targets, diagonal: true, straight: false);
                break;
            case 'r':
                AddSlidingMoves(from, isWhite, targets, diagonal: false, straight: true);
                break;
            case 'q':
                AddSlidingMoves(from, isWhite, targets, diagonal: true, straight: true);
                break;
            case 'k':
                AddKingMoves(from, isWhite, targets);
                break;
        }

        return targets;
    }

    // Piece-specific pseudo-legal move generation

    private void AddPawnMoves(Square from, bool isWhite, List<Square> targets)
    {
        var dir = isWhite ? 1 : -1;
        var startRank = isWhite ? 1 : 6;

        // Single push
        var oneForward = from.Offset(0, dir);
        if (oneForward.IsValid && IsEmpty(oneForward))
        {
            targets.Add(oneForward);

            // Double push
            if (from.Rank == startRank)
            {
                var twoForward = from.Offset(0, dir * 2);
                if (twoForward.IsValid && IsEmpty(twoForward))
                    targets.Add(twoForward);
            }
        }

        // Captures (diagonal)
        for (var df = -1; df <= 1; df += 2)
        {
            var captureSq = from.Offset(df, dir);
            if (!captureSq.IsValid) continue;

            var target = this[captureSq];
            if (target.HasValue && IsWhite(target.Value) != isWhite && !IsKing(target.Value))
                targets.Add(captureSq);
        }
    }

    private void AddKnightMoves(Square from, bool isWhite, List<Square> targets)
    {
        ReadOnlySpan<(int df, int dr)> jumps =
        [
            (-2, -1), (-2, 1), (-1, -2), (-1, 2),
            (1, -2), (1, 2), (2, -1), (2, 1)
        ];

        foreach (var (df, dr) in jumps)
        {
            var to = from.Offset(df, dr);
            if (!to.IsValid) continue;

            var target = this[to];
            if (!target.HasValue || (IsWhite(target.Value) != isWhite && !IsKing(target.Value)))
                targets.Add(to);
        }
    }

    private void AddSlidingMoves(
        Square from, bool isWhite, List<Square> targets,
        bool diagonal, bool straight)
    {
        Span<(int df, int dr)> dirs = stackalloc (int, int)[8];
        var count = 0;

        if (straight)
        {
            dirs[count++] = (0, 1);
            dirs[count++] = (0, -1);
            dirs[count++] = (1, 0);
            dirs[count++] = (-1, 0);
        }

        if (diagonal)
        {
            dirs[count++] = (1, 1);
            dirs[count++] = (1, -1);
            dirs[count++] = (-1, 1);
            dirs[count++] = (-1, -1);
        }

        for (var i = 0; i < count; i++)
        {
            var (df, dr) = dirs[i];
            var sq = from.Offset(df, dr);
            while (sq.IsValid)
            {
                var target = this[sq];
                if (!target.HasValue)
                {
                    targets.Add(sq);
                }
                else
                {
                    if (IsWhite(target.Value) != isWhite && !IsKing(target.Value))
                        targets.Add(sq); // capture
                    break; // blocked either way
                }

                sq = sq.Offset(df, dr);
            }
        }
    }

    private void AddKingMoves(Square from, bool isWhite, List<Square> targets)
    {
        for (var df = -1; df <= 1; df++)
        for (var dr = -1; dr <= 1; dr++)
        {
            if (df == 0 && dr == 0) continue;
            var to = from.Offset(df, dr);
            if (!to.IsValid) continue;

            var target = this[to];
            if (!target.HasValue || (IsWhite(target.Value) != isWhite && !IsKing(target.Value)))
                targets.Add(to);
        }
    }

    // Clone

    public Board Clone()
    {
        var copy = new Board();
        Array.Copy(_cells, copy._cells, 64);
        return copy;
    }
}
