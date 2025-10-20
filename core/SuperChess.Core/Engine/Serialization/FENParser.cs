using SuperChess.Core.Engine.Board;
using SuperChess.Core.Engine.Pieces;
using SuperChess.Core.Models;

namespace SuperChess.Core.Engine.Serialization;

public static class FENParser
{
    
    // Parses a full FEN string and returns a new ChessBoard.
    public static ChessBoard Parse(string fen)
    {
        var board = new ChessBoard();
        ParseInto(board, fen);
        return board;
    }

    // Parses a full FEN string and populates an existing ChessBoard.
    public static void ParseInto(ChessBoard board, string fen)
    {
        if (string.IsNullOrWhiteSpace(fen))
            throw new ArgumentException("FEN cannot be empty", nameof(fen));

        var parts = fen.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length < 6)
            throw new ArgumentException("Invalid FEN: Too few parts (expected 6)", nameof(fen));

        // 1. Clear grid and reset meta
        Array.Clear(board._grid!, 0, board._grid!.Length);
        board.ResetMeta();

        // 2. Parse Placement
        var ranks = parts[0].Split('/');
        if (ranks.Length != 8)
            throw new ArgumentException("Invalid FEN: Expected 8 ranks", nameof(fen));

        for (int row = 0; row < 8; row++)
        {
            string rankStr = ranks[row];
            int col = 0;

            foreach (char ch in rankStr)
            {
                if (char.IsDigit(ch))
                {
                    col += (ch - '0');
                }
                else
                {
                    if (col >= 8)
                        throw new ArgumentException($"Rank {row + 1} exceeds 8 files", nameof(fen));

                    // Parse piece: Uppercase = white, lowercase = black
                    bool isWhite = char.IsUpper(ch);
                    char lowerCh = char.ToLowerInvariant(ch);
                    PieceType type = PieceTypeExtensions.FromFenChar(lowerCh);
                    PlayerColor color = isWhite ? PlayerColor.White : PlayerColor.Black;

                    // Instantiate Piece
                    Piece piece = type switch
                    {
                        PieceType.Pawn => new Pawn(color),
                        PieceType.Rook => new Rook(color),
                        PieceType.Knight => new Knight(color),
                        PieceType.Bishop => new Bishop(color),
                        PieceType.Queen => new Queen(color),
                        PieceType.King => new King(color),
                        _ => throw new ArgumentException($"Unknown piece: {ch}", nameof(fen))
                    };

                    board[row, col] = piece;
                    col++;
                }
            }

            if (col != 8)
                throw new ArgumentException($"Rank {row + 1} does not fill 8 files (col={col})", nameof(fen));
        }

        // 3. Parse Active Color ('w' or 'b')
        board.Turn = parts[1] == "w" ? PlayerColor.White : PlayerColor.Black;

        // 4. Parse Castling Rights (KQkq or -)
        string castlingStr = parts[2];
        board.CanWhiteCastleKingside = castlingStr.Contains('K');
        board.CanWhiteCastleQueenside = castlingStr.Contains('Q');
        board.CanBlackCastleKingside = castlingStr.Contains('k');
        board.CanBlackCastleQueenside = castlingStr.Contains('q');

        // 5. Parse En Passant Target (square or -)
        board.EnPassantTarget = parts[3] == "-" ? null : parts[3];

        // 6. Parse Halfmove Clock
        if (!int.TryParse(parts[4], out int halfmove) || halfmove < 0)
            throw new ArgumentException("Invalid halfmove clock (must be non-negative int)", nameof(fen));
        board.HalfmoveClock = halfmove;

        // 7. Parse Fullmove Number
        if (!int.TryParse(parts[5], out int fullmove) || fullmove < 1)
            throw new ArgumentException("Invalid fullmove number (must be positive int)", nameof(fen));
        board.FullmoveNumber = fullmove;
    }
}