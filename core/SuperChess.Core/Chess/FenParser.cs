namespace SuperChess.Core.Chess;

/// <summary>
/// Handles FEN string parsing and generation.
/// FEN format: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
/// </summary>
internal static class FenParser
{
    public static Board ParseBoard(string fen)
    {
        var boardPart = fen.Split(' ')[0];
        var ranks = boardPart.Split('/');

        if (ranks.Length != 8)
            throw new InvalidOperationException("Invalid FEN: expected 8 ranks.");

        var board = new Board();

        for (var row = 0; row < 8; row++)
        {
            var file = 0;
            foreach (var ch in ranks[row])
            {
                if (char.IsDigit(ch))
                {
                    file += ch - '0';
                    continue;
                }

                if (file > 7)
                    throw new InvalidOperationException("Invalid FEN: too many files in rank.");

                // FEN rank 0 = rank 8 (index 7), rank 7 = rank 1 (index 0)
                board[file, 7 - row] = ch;
                file++;
            }

            if (file != 8)
                throw new InvalidOperationException("Invalid FEN: rank does not sum to 8 files.");
        }

        return board;
    }

    public static PieceColor ParseActiveColor(string fen)
    {
        var parts = fen.Split(' ');
        if (parts.Length < 2) return PieceColor.White;
        return parts[1] == "b" ? PieceColor.Black : PieceColor.White;
    }

    public static string ParseCastling(string fen)
    {
        var parts = fen.Split(' ');
        return parts.Length > 2 ? parts[2] : "KQkq";
    }

    public static string ParseEnPassant(string fen)
    {
        var parts = fen.Split(' ');
        return parts.Length > 3 ? parts[3] : "-";
    }

    public static int ParseHalfmove(string fen)
    {
        var parts = fen.Split(' ');
        return parts.Length > 4 && int.TryParse(parts[4], out var hm) ? hm : 0;
    }

    public static int ParseFullmove(string fen)
    {
        var parts = fen.Split(' ');
        return parts.Length > 5 && int.TryParse(parts[5], out var fm) ? fm : 1;
    }

    public static string BuildBoardFen(Board board)
    {
        var ranks = new string[8];

        for (var rank = 7; rank >= 0; rank--)
        {
            var empty = 0;
            var row = "";

            for (var file = 0; file < 8; file++)
            {
                var piece = board[file, rank];
                if (piece.HasValue)
                {
                    if (empty > 0)
                    {
                        row += empty;
                        empty = 0;
                    }

                    row += piece.Value;
                }
                else
                {
                    empty++;
                }
            }

            if (empty > 0) row += empty;
            ranks[7 - rank] = row;
        }

        return string.Join("/", ranks);
    }

    public static string BuildFen(
        Board board,
        PieceColor activeColor,
        string castling,
        string enPassant,
        int halfmove,
        int fullmove)
    {
        var boardPart = BuildBoardFen(board);
        var turn = activeColor == PieceColor.White ? "w" : "b";
        return $"{boardPart} {turn} {castling} {enPassant} {halfmove} {fullmove}";
    }
}
