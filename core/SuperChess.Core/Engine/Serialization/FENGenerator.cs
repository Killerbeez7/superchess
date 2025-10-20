using System.Text;
using SuperChess.Core.Engine.Board;
using SuperChess.Core.Engine.Pieces;
using SuperChess.Core.Models;

namespace SuperChess.Core.Engine.Serialization;

public static class FENGenerator
{
    // Generates a full FEN string from ChessBoard state.
    public static string Generate(ChessBoard board)
    {
        var sb = new StringBuilder();

        // 1. Placement: Iterate ranks
        for (int row = 0; row < 8; row++)
        {
            int emptyCount = 0;
            for (int col = 0; col < 8; col++)
            {
                var piece = board[row, col];
                if (piece == null)
                {
                    emptyCount++;  // Count consecutive empties
                }
                else
                {
                    // Flush empties, then append piece char
                    if (emptyCount > 0)
                    {
                        sb.Append(emptyCount);
                        emptyCount = 0;
                    }
                    sb.Append(piece.GetFenChar());  // Upper for white, lower for black
                }
            }
            // Flush trailing empties
            if (emptyCount > 0)
            {
                sb.Append(emptyCount);
            }
            // Separate ranks
            if (row < 7)
            {
                sb.Append('/');
            }
        }

        // 2. Active color: 'w' or 'b'
        sb.Append(' ');
        sb.Append(board.Turn == PlayerColor.White ? 'w' : 'b');

        // 3. Castling rights: Concat flags (K=White kingside, Q=queenside, k/q for Black) or '-'
        sb.Append(' ');
        var castlingFlags = new StringBuilder();
        if (board.CanWhiteCastleKingside) castlingFlags.Append('K');
        if (board.CanWhiteCastleQueenside) castlingFlags.Append('Q');
        if (board.CanBlackCastleKingside) castlingFlags.Append('k');
        if (board.CanBlackCastleQueenside) castlingFlags.Append('q');
        sb.Append(castlingFlags.Length > 0 ? castlingFlags.ToString() : "-");

        // 4. En passant target: Square ('e3') if pawn just moved 2, else '-'
        sb.Append(' ');
        sb.Append(board.EnPassantTarget ?? "-");

        // 5. Halfmove clock: Resets on pawn move/capture
        sb.Append(' ');
        sb.Append(board.HalfmoveClock);

        // 6. Fullmove number: Increments after Black's move
        sb.Append(' ');
        sb.Append(board.FullmoveNumber);

        return sb.ToString();
    }
}