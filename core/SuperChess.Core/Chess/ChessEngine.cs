namespace SuperChess.Core.Chess;

/// <summary>
/// Chess engine that validates and applies moves with full legality checking:
/// - Piece movement rules (pawn, knight, bishop, rook, queen, king)
/// - Path obstruction for sliding pieces
/// - Cannot capture own pieces
/// - Cannot move into check
/// - Cannot leave own king in check (pinned pieces)
/// - Check detection after move
/// - Checkmate detection (no legal moves while in check)
/// - Stalemate detection (no legal moves while NOT in check)
/// - Castling (king-side and queen-side)
/// - En passant capture
/// - Pawn promotion
/// - Halfmove clock for 50-move rule
/// - Fullmove counter
///
/// Does NOT yet implement:
/// - 50-move rule auto-draw
/// - Threefold repetition
/// - Insufficient material detection
/// </summary>
public sealed class ChessEngine : IChessEngine
{
    public string StartingFen => "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    public MoveResult TryApplyMove(string fen, string from, string to, string? promotion = null)
    {
        // --- Normalize input ---
        var fromSq = Square.FromAlgebraic(from?.Trim().ToLowerInvariant() ?? "");
        var toSq = Square.FromAlgebraic(to?.Trim().ToLowerInvariant() ?? "");

        if (fromSq is null || toSq is null)
            return MoveResult.Illegal("Invalid square notation.");
        if (fromSq.Value == toSq.Value)
            return MoveResult.Illegal("Source and target must differ.");

        var f = fromSq.Value;
        var t = toSq.Value;

        // --- Parse position ---
        Board board;
        try
        {
            board = FenParser.ParseBoard(fen);
        }
        catch (Exception ex)
        {
            return MoveResult.Illegal($"Invalid FEN: {ex.Message}");
        }

        var activeColor = FenParser.ParseActiveColor(fen);
        var castling = FenParser.ParseCastling(fen);
        var enPassant = FenParser.ParseEnPassant(fen);
        var halfmove = FenParser.ParseHalfmove(fen);
        var fullmove = FenParser.ParseFullmove(fen);

        // --- Validate piece ---
        var piece = board[f];
        if (!piece.HasValue)
            return MoveResult.Illegal("No piece on source square.");

        var pieceColor = Board.ColorOf(piece.Value);
        if (pieceColor != activeColor)
            return MoveResult.Illegal(activeColor == PieceColor.White
                ? "It is white's turn."
                : "It is black's turn.");

        // --- Cannot capture own piece ---
        var targetPiece = board[t];
        if (targetPiece.HasValue && Board.SameColor(piece.Value, targetPiece.Value))
            return MoveResult.Illegal("Cannot capture own piece.");
        if (targetPiece.HasValue && Board.IsKing(targetPiece.Value))
            return MoveResult.Illegal("Cannot capture the king.");

        // --- Special move detection ---
        var pieceLower = char.ToLowerInvariant(piece.Value);
        var isCapture = targetPiece.HasValue;
        var isPawn = pieceLower == 'p';
        var isKing = pieceLower == 'k';

        // Castling
        if (isKing && Math.Abs(t.File - f.File) == 2)
            return TryCastle(board, f, t, activeColor, castling, halfmove, fullmove);

        // En passant
        var isEnPassant = false;
        if (isPawn && Math.Abs(t.File - f.File) == 1 && !targetPiece.HasValue)
        {
            // Diagonal pawn move to empty square — must be en passant.
            var epSq = Square.FromAlgebraic(enPassant);
            if (epSq.HasValue && t == epSq.Value)
                isEnPassant = true;
            else
                return MoveResult.Illegal("Illegal pawn move.");
        }

        // --- Piece-specific movement validation ---
        if (!IsPseudoLegalMove(board, f, t, piece.Value, isEnPassant))
            return MoveResult.Illegal("Illegal move for this piece.");

        // --- Promotion ---
        var promotionPiece = ResolvePromotion(piece.Value, t, promotion);
        if (isPawn && (t.Rank == 7 || t.Rank == 0) && promotionPiece is null)
            return MoveResult.Illegal("Pawn promotion requires specifying a piece (q, r, b, n).");

        // --- Apply the move temporarily to check king safety ---
        char? capturedForUndo = board[t];
        Square? enPassantCapturedSq = null;

        board[t] = promotionPiece ?? piece.Value;
        board[f] = null;

        // Remove en passant captured pawn
        if (isEnPassant)
        {
            enPassantCapturedSq = new Square(t.File, f.Rank);
            capturedForUndo = board[enPassantCapturedSq.Value];
            board[enPassantCapturedSq.Value] = null;
            isCapture = true;
        }

        // --- King safety: does this move leave our king in check? ---
        if (board.IsInCheck(activeColor))
        {
            // Undo
            board[f] = piece.Value;
            board[t] = isEnPassant ? null : capturedForUndo;
            if (enPassantCapturedSq.HasValue)
                board[enPassantCapturedSq.Value] = capturedForUndo;

            return MoveResult.Illegal("Move leaves king in check.");
        }

        // --- The move is legal. Build the new FEN. ---
        var nextColor = activeColor == PieceColor.White ? PieceColor.Black : PieceColor.White;

        // Update castling rights
        var newCastling = UpdateCastling(castling, f, t, piece.Value);

        // Update en passant target
        var newEnPassant = "-";
        if (isPawn && Math.Abs(t.Rank - f.Rank) == 2)
        {
            var epRank = (f.Rank + t.Rank) / 2;
            newEnPassant = new Square(f.File, epRank).ToAlgebraic();
        }

        // Update clocks
        var newHalfmove = (isPawn || isCapture) ? 0 : halfmove + 1;
        var newFullmove = activeColor == PieceColor.Black ? fullmove + 1 : fullmove;

        // --- Detect check, checkmate, stalemate for the opponent ---
        var isCheck = board.IsInCheck(nextColor);
        var hasLegalMoves = board.HasAnyLegalMove(nextColor);
        var isCheckmate = isCheck && !hasLegalMoves;
        var isStalemate = !isCheck && !hasLegalMoves;

        var newFen = FenParser.BuildFen(
            board, nextColor, newCastling, newEnPassant, newHalfmove, newFullmove);

        return MoveResult.Legal(newFen, isCheck, isCheckmate, isStalemate);
    }

    // -------------------------------------------------------------------------
    // Pseudo-legal move validation (piece rules only, no king safety check)
    // -------------------------------------------------------------------------

    private static bool IsPseudoLegalMove(
        Board board, Square from, Square to, char piece, bool isEnPassant)
    {
        var df = to.File - from.File;
        var dr = to.Rank - from.Rank;
        var adf = Math.Abs(df);
        var adr = Math.Abs(dr);
        var isWhite = Board.IsWhite(piece);

        return char.ToLowerInvariant(piece) switch
        {
            'p' => IsLegalPawnMove(board, from, to, isWhite, df, dr, isEnPassant),
            'n' => (adf == 1 && adr == 2) || (adf == 2 && adr == 1),
            'b' => adf == adr && adf > 0 && IsPathClear(board, from, to),
            'r' => (df == 0 || dr == 0) && (adf + adr > 0) && IsPathClear(board, from, to),
            'q' => ((adf == adr) || df == 0 || dr == 0) && (adf + adr > 0) && IsPathClear(board, from, to),
            'k' => adf <= 1 && adr <= 1,
            _ => false
        };
    }

    private static bool IsLegalPawnMove(
        Board board, Square from, Square to, bool isWhite,
        int fileDelta, int rankDelta, bool isEnPassant)
    {
        var forward = isWhite ? 1 : -1;
        var startRank = isWhite ? 1 : 6;
        var targetOccupied = board.IsOccupied(to);

        // Forward push
        if (fileDelta == 0)
        {
            if (rankDelta == forward && !targetOccupied)
                return true;

            if (from.Rank == startRank && rankDelta == forward * 2 && !targetOccupied)
            {
                var intermediate = from.Offset(0, forward);
                return board.IsEmpty(intermediate);
            }

            return false;
        }

        // Diagonal capture (including en passant)
        if (Math.Abs(fileDelta) == 1 && rankDelta == forward)
        {
            if (isEnPassant) return true;
            if (!targetOccupied) return false;
            return Board.IsWhite(board[to]!.Value) != isWhite;
        }

        return false;
    }

    private static bool IsPathClear(Board board, Square from, Square to)
    {
        var fileStep = Math.Sign(to.File - from.File);
        var rankStep = Math.Sign(to.Rank - from.Rank);

        var sq = from.Offset(fileStep, rankStep);
        while (sq != to)
        {
            if (board.IsOccupied(sq)) return false;
            sq = sq.Offset(fileStep, rankStep);
        }

        return true;
    }

    // -------------------------------------------------------------------------
    // Castling
    // -------------------------------------------------------------------------

    private static MoveResult TryCastle(
        Board board, Square kingFrom, Square kingTo,
        PieceColor color, string castling, int halfmove, int fullmove)
    {
        var isWhite = color == PieceColor.White;
        var rank = isWhite ? 0 : 7;
        var isKingSide = kingTo.File > kingFrom.File;

        if (kingFrom.Rank != rank || kingTo.Rank != rank || kingFrom.File != 4)
            return MoveResult.Illegal("Invalid castling move.");

        if (kingTo.File is not 2 and not 6)
            return MoveResult.Illegal("Invalid castling move.");

        // Check castling rights
        var requiredRight = (isWhite, isKingSide) switch
        {
            (true, true) => 'K',
            (true, false) => 'Q',
            (false, true) => 'k',
            (false, false) => 'q',
        };

        if (!castling.Contains(requiredRight))
            return MoveResult.Illegal("Castling not available (rights lost).");

        // Check that king and rook are in expected positions
        var rookFile = isKingSide ? 7 : 0;
        var rookSq = new Square(rookFile, rank);
        var expectedRook = isWhite ? 'R' : 'r';

        if (board[rookSq] != expectedRook)
            return MoveResult.Illegal("Rook not in position for castling.");

        // King must not be in check
        var enemy = isWhite ? PieceColor.Black : PieceColor.White;
        if (board.IsAttackedBy(kingFrom, enemy))
            return MoveResult.Illegal("Cannot castle while in check.");

        // Squares between king and destination must be empty
        var step = isKingSide ? 1 : -1;
        var clearStart = isKingSide ? 5 : 1;
        var clearEnd = isKingSide ? 6 : 3;

        for (var f = clearStart; f <= clearEnd; f++)
        {
            if (board.IsOccupied(new Square(f, rank)))
                return MoveResult.Illegal("Squares between king and rook must be empty.");
        }

        // King must not pass through or land on an attacked square
        var passThroughFile = kingFrom.File + step;
        if (board.IsAttackedBy(new Square(passThroughFile, rank), enemy))
            return MoveResult.Illegal("King cannot pass through check.");
        if (board.IsAttackedBy(kingTo, enemy))
            return MoveResult.Illegal("King cannot land on an attacked square.");

        // --- Apply castling ---
        var rookTo = new Square(isKingSide ? 5 : 3, rank);
        board[kingTo] = board[kingFrom];
        board[kingFrom] = null;
        board[rookTo] = board[rookSq];
        board[rookSq] = null;

        // After castling, verify king is not in check (shouldn't be, but safety)
        if (board.IsInCheck(color))
        {
            // Undo
            board[kingFrom] = board[kingTo];
            board[kingTo] = null;
            board[rookSq] = board[rookTo];
            board[rookTo] = null;
            return MoveResult.Illegal("Castling leaves king in check.");
        }

        // Build new FEN
        var nextColor = color == PieceColor.White ? PieceColor.Black : PieceColor.White;
        var newCastling = UpdateCastling(castling, kingFrom, kingTo, board[kingTo]!.Value);
        var newHalfmove = halfmove + 1;
        var newFullmove = color == PieceColor.Black ? fullmove + 1 : fullmove;

        var isCheck = board.IsInCheck(nextColor);
        var hasLegalMoves = board.HasAnyLegalMove(nextColor);
        var isCheckmate = isCheck && !hasLegalMoves;
        var isStalemate = !isCheck && !hasLegalMoves;

        var newFen = FenParser.BuildFen(
            board, nextColor, newCastling, "-", newHalfmove, newFullmove);
        return MoveResult.Legal(newFen, isCheck, isCheckmate, isStalemate);
    }

    // -------------------------------------------------------------------------
    // Castling rights update
    // -------------------------------------------------------------------------

    private static string UpdateCastling(string castling, Square from, Square to, char piece)
    {
        if (castling == "-") return "-";

        var result = castling;

        // King moved → lose both rights for that color
        if (char.ToLowerInvariant(piece) == 'k')
        {
            result = Board.IsWhite(piece)
                ? result.Replace("K", "").Replace("Q", "")
                : result.Replace("k", "").Replace("q", "");
        }

        // Rook moved from or captured on its starting square → lose that right
        RemoveRightIfCorner(ref result, from);
        RemoveRightIfCorner(ref result, to);

        return result.Length == 0 ? "-" : result;
    }

    private static void RemoveRightIfCorner(ref string castling, Square sq)
    {
        if (sq.Rank == 0 && sq.File == 0) castling = castling.Replace("Q", "");
        if (sq.Rank == 0 && sq.File == 7) castling = castling.Replace("K", "");
        if (sq.Rank == 7 && sq.File == 0) castling = castling.Replace("q", "");
        if (sq.Rank == 7 && sq.File == 7) castling = castling.Replace("k", "");
    }

    // -------------------------------------------------------------------------
    // Pawn promotion
    // -------------------------------------------------------------------------

    private static char? ResolvePromotion(char piece, Square to, string? promotion)
    {
        if (char.ToLowerInvariant(piece) != 'p') return null;

        var isWhite = Board.IsWhite(piece);
        var promotionRank = isWhite ? 7 : 0;
        if (to.Rank != promotionRank) return null;

        var p = promotion?.Trim().ToLowerInvariant();

        return p switch
        {
            "q" or "queen" => isWhite ? 'Q' : 'q',
            "r" or "rook" => isWhite ? 'R' : 'r',
            "b" or "bishop" => isWhite ? 'B' : 'b',
            "n" or "knight" => isWhite ? 'N' : 'n',
            null or "" => null, // Caller must check and reject
            _ => null
        };
    }
}
