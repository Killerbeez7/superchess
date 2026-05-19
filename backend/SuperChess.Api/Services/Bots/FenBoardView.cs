namespace SuperChess.Api.Services.Bots;

public sealed class FenBoardView
{
    private readonly Dictionary<string, char> _pieces = [];

    private FenBoardView(char sideToMove)
    {
        SideToMove = sideToMove;
    }

    public char SideToMove { get; }

    public static FenBoardView Parse(string fen)
    {
        var parts = fen.Split(' ');
        var board = new FenBoardView(parts.Length > 1 && parts[1] == "b" ? 'b' : 'w');
        var boardPart = parts[0];
        var ranks = boardPart.Split('/');

        for (var row = 0; row < ranks.Length; row++)
        {
            var file = 0;
            var rank = 8 - row;

            foreach (var token in ranks[row])
            {
                if (char.IsDigit(token))
                {
                    file += token - '0';
                    continue;
                }

                if (file > 7)
                {
                    break;
                }

                var square = $"{(char)('a' + file)}{rank}";
                board._pieces[square] = token;
                file++;
            }
        }

        return board;
    }

    public char? GetPiece(string square) =>
        _pieces.TryGetValue(square, out var piece) ? piece : null;

    public IEnumerable<KeyValuePair<string, char>> Pieces => _pieces;

    public static bool IsWhitePiece(char piece) => char.IsUpper(piece);

    public static bool IsBlackPiece(char piece) => char.IsLower(piece);
}
