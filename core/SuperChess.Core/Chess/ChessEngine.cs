namespace SuperChess.Core.Chess;

public sealed class ChessEngine : IChessEngine
{
    public string StartingFen => "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    public MoveResult TryApplyMove(string fen, string from, string to, string? promotion = null)
    {
        // 1. Normalize input
        from = from?.Trim().ToLowerInvariant() ?? "";
        to = to?.Trim().ToLowerInvariant() ?? "";

        if (!IsValidSquare(from) || !IsValidSquare(to))
            return MoveResult.Illegal("Invalid square notation.");
        if (from == to)
            return MoveResult.Illegal("Source and target squares must be different.");

        // 2. Parse the position
        Board board;
        try
        {
            board = FenParser.Parse(fen);
        }
        catch (Exception ex)
        {
            return MoveResult.Illegal($"Invalid FEN: {ex.Message}");
        }

        if (!board.TryGet(from, out var piece))
            return MoveResult.Illegal("No piece on source square.");

        // 3. Verify it's the right color's turn
        var activeColor = FenParser.ParseActiveColor(fen);
        var pieceIsWhite = Board.IsWhite(piece);

        if (activeColor == PieceColor.White && !pieceIsWhite)
            return MoveResult.Illegal("It is white's turn.");
        if (activeColor == PieceColor.Black && pieceIsWhite)
            return MoveResult.Illegal("It is black's turn.");

        // 4. Cannot capture own piece
        if (board.TryGet(to, out var targetPiece) && Board.IsWhite(targetPiece) == pieceIsWhite)
            return MoveResult.Illegal("You cannot capture your own piece.");

        // 5. Piece-specific legality
        if (!IsLegalMove(board, from, to, piece))
            return MoveResult.Illegal("Illegal move for this piece.");

        // 6. Apply the move and build new FEN
        board.Move(from, to);
        var nextTurn = activeColor == PieceColor.White ? PieceColor.Black : PieceColor.White;
        var newFen = FenParser.BuildUpdatedFen(fen, board, nextTurn);

        return MoveResult.Legal(newFen);
    }

    private static bool IsValidSquare(string square)
    {
        if (square.Length != 2) return false;
        var file = square[0];
        var rank = square[1];
        return file >= 'a' && file <= 'h' && rank >= '1' && rank <= '8';
    }

    private static bool IsLegalMove(Board board, string from, string to, char piece)
    {
        var (fromFile, fromRank) = ParseSquare(from);
        var (toFile, toRank) = ParseSquare(to);

        var fileDelta = toFile - fromFile;
        var rankDelta = toRank - fromRank;
        var absFileDelta = Math.Abs(fileDelta);
        var absRankDelta = Math.Abs(rankDelta);

        var isWhite = Board.IsWhite(piece);
        char? targetPiece = board.TryGet(to, out var existing) ? existing : null;

        return char.ToLowerInvariant(piece) switch
        {
            'p' => IsLegalPawnMove(board, from, isWhite, fileDelta, rankDelta, targetPiece),
            'n' => (absFileDelta == 1 && absRankDelta == 2) ||
                   (absFileDelta == 2 && absRankDelta == 1),
            'b' => absFileDelta == absRankDelta &&
                   IsPathClear(board, from, to),
            'r' => (fileDelta == 0 || rankDelta == 0) &&
                   IsPathClear(board, from, to),
            'q' => ((absFileDelta == absRankDelta) || fileDelta == 0 || rankDelta == 0) &&
                   IsPathClear(board, from, to),
            'k' => absFileDelta <= 1 && absRankDelta <= 1,
            _ => false
        };
    }

    private static bool IsLegalPawnMove(
        Board board,
        string from,
        bool isWhitePawn,
        int fileDelta,
        int rankDelta,
        char? targetPiece)
    {
        var (_, fromRank) = ParseSquare(from);

        var forwardStep = isWhitePawn ? 1 : -1;
        var startRank = isWhitePawn ? 2 : 7;

        var isForward = fileDelta == 0;
        var isDiagonal = Math.Abs(fileDelta) == 1 && rankDelta == forwardStep;
        var targetOccupied = targetPiece.HasValue;

        if (isForward)
        {
            if (rankDelta == forwardStep && !targetOccupied)
                return true;

            if (fromRank == startRank && rankDelta == forwardStep * 2 && !targetOccupied)
            {
                var intermediateRank = fromRank + forwardStep;
                var intermediateSquare = $"{from[0]}{intermediateRank}";
                return !board.IsOccupied(intermediateSquare);
            }

            return false;
        }

        if (isDiagonal)
        {
            if (targetPiece is not char captured) return false;
            return Board.IsWhite(captured) != isWhitePawn;
        }

        return false;
    }

    private static bool IsPathClear(Board board, string from, string to)
    {
        var (fromFile, fromRank) = ParseSquare(from);
        var (toFile, toRank) = ParseSquare(to);

        var fileStep = Math.Sign(toFile - fromFile);
        var rankStep = Math.Sign(toRank - fromRank);

        var currentFile = fromFile + fileStep;
        var currentRank = fromRank + rankStep;

        while (currentFile != toFile || currentRank != toRank)
        {
            var square = $"{(char)currentFile}{currentRank}";
            if (board.IsOccupied(square)) return false;
            currentFile += fileStep;
            currentRank += rankStep;
        }

        return true;
    }

    private static (char file, int rank) ParseSquare(string square) =>
        (square[0], square[1] - '0');
}