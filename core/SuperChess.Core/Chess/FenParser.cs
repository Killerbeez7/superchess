namespace SuperChess.Core.Chess;

internal static class FenParser
{
    public static Board Parse(string fen)
    {
        var boardPart = fen.Split(' ')[0];
        var ranks = boardPart.Split('/');

        if (ranks.Length != 8)
            throw new InvalidOperationException("Invalid FEN board.");

        var squares = new Dictionary<string, char>();

        for (var row = 0; row < 8; row++)
        {
            var fileIndex = 0;

            foreach (var ch in ranks[row])
            {
                if (char.IsDigit(ch))
                {
                    fileIndex += ch - '0';
                    continue;
                }

                if (fileIndex > 7)
                    throw new InvalidOperationException("Invalid FEN board.");

                var square = $"{(char)('a' + fileIndex)}{8 - row}";
                squares[square] = ch;
                fileIndex++;
            }

            if (fileIndex != 8)
                throw new InvalidOperationException("Invalid FEN board.");
        }

        return new Board(squares);
    }

    public static string BuildBoardFen(Board board)
    {
        var ranks = new List<string>();

        for (var row = 8; row >= 1; row--)
        {
            var emptyCount = 0;
            var rank = "";

            for (var file = 'a'; file <= 'h'; file++)
            {
                var square = $"{file}{row}";

                if (board.TryGet(square, out var piece))
                {
                    if (emptyCount > 0)
                    {
                        rank += emptyCount.ToString();
                        emptyCount = 0;
                    }

                    rank += piece;
                }
                else
                {
                    emptyCount++;
                }
            }

            if (emptyCount > 0)
                rank += emptyCount.ToString();

            ranks.Add(rank);
        }

        return string.Join("/", ranks);
    }

    public static string BuildUpdatedFen(string currentFen, Board board, PieceColor nextTurn)
    {
        var parts = currentFen.Split(' ', StringSplitOptions.RemoveEmptyEntries);

        var boardPart = BuildBoardFen(board);
        var activeColor = nextTurn == PieceColor.White ? "w" : "b";

        var castling = parts.Length > 2 ? parts[2] : "KQkq";
        var enPassant = parts.Length > 3 ? parts[3] : "-";
        var halfmove = parts.Length > 4 ? parts[4] : "0";
        var fullmove = parts.Length > 5 ? parts[5] : "1";

        return $"{boardPart} {activeColor} {castling} {enPassant} {halfmove} {fullmove}";
    }

    public static PieceColor ParseActiveColor(string fen)
    {
        var parts = fen.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length < 2) return PieceColor.White;
        return parts[1] == "w" ? PieceColor.White : PieceColor.Black;
    }
}