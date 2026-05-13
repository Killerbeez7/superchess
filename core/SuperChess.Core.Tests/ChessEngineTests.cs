using SuperChess.Core.Chess;

namespace SuperChess.Core.Tests;

public class ChessEngineTests
{
    private readonly IChessEngine _engine = new ChessEngine();

    // =====================================================================
    // Basic piece movement
    // =====================================================================

    [Fact]
    public void Pawn_can_move_one_forward()
    {
        var result = _engine.TryApplyMove(_engine.StartingFen, "e2", "e3");
        Assert.True(result.IsLegal);
    }

    [Fact]
    public void Pawn_can_move_two_from_start()
    {
        var result = _engine.TryApplyMove(_engine.StartingFen, "e2", "e4");
        Assert.True(result.IsLegal);
    }

    [Fact]
    public void Pawn_cannot_move_three()
    {
        var result = _engine.TryApplyMove(_engine.StartingFen, "e2", "e5");
        Assert.False(result.IsLegal);
    }

    [Fact]
    public void Pawn_cannot_push_into_occupied_square()
    {
        // Set up a position where e3 is blocked
        var fen = "rnbqkbnr/pppppppp/8/8/8/4p3/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        var result = _engine.TryApplyMove(fen, "e2", "e3");
        Assert.False(result.IsLegal);
    }

    [Fact]
    public void Knight_L_shape_is_legal()
    {
        var result = _engine.TryApplyMove(_engine.StartingFen, "b1", "c3");
        Assert.True(result.IsLegal);
    }

    [Fact]
    public void Knight_non_L_shape_is_illegal()
    {
        var result = _engine.TryApplyMove(_engine.StartingFen, "b1", "c2");
        Assert.False(result.IsLegal);
    }

    [Fact]
    public void Cannot_move_opponents_piece()
    {
        var result = _engine.TryApplyMove(_engine.StartingFen, "e7", "e5");
        Assert.False(result.IsLegal);
    }

    [Fact]
    public void Cannot_capture_own_piece()
    {
        // Knight trying to capture own pawn
        var result = _engine.TryApplyMove(_engine.StartingFen, "b1", "d2");
        Assert.False(result.IsLegal);
    }

    [Fact]
    public void Legal_move_switches_active_color()
    {
        var result = _engine.TryApplyMove(_engine.StartingFen, "e2", "e4");
        Assert.True(result.IsLegal);
        Assert.Contains(" b ", result.NewFen!); // black to move
    }

    // =====================================================================
    // King safety — cannot move INTO check
    // =====================================================================

    [Fact]
    public void King_cannot_move_into_attacked_square()
    {
        // White king on e1, black rook on d8. King cannot go to d1 or d2.
        var fen = "3r4/8/8/8/8/8/8/4K3 w - - 0 1";
        var result = _engine.TryApplyMove(fen, "e1", "d1");
        Assert.False(result.IsLegal);
        Assert.Contains("check", result.Error!, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void King_can_move_to_safe_square()
    {
        var fen = "3r4/8/8/8/8/8/8/4K3 w - - 0 1";
        var result = _engine.TryApplyMove(fen, "e1", "f2");
        Assert.True(result.IsLegal);
    }

    // =====================================================================
    // King safety — cannot LEAVE king in check (pins)
    // =====================================================================

    [Fact]
    public void Pinned_piece_cannot_move_off_pin_line()
    {
        // White king e1, white bishop e2 (on the file), black rook e8.
        // The bishop is pinned — moving it would expose the king.
        var fen = "4r3/8/8/8/8/8/4B3/4K3 w - - 0 1";
        var result = _engine.TryApplyMove(fen, "e2", "d3");
        Assert.False(result.IsLegal);
        Assert.Contains("check", result.Error!, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Pinned_piece_can_move_along_pin_line()
    {
        // White king e1, white rook e4 (on the file), black rook e8.
        // The rook is pinned on the file but can move along it.
        var fen = "4r3/8/8/8/4R3/8/8/4K3 w - - 0 1";
        var result = _engine.TryApplyMove(fen, "e4", "e6");
        Assert.True(result.IsLegal);
    }

    [Fact]
    public void Pinned_piece_can_capture_pinner()
    {
        // White king e1, white rook e4, black rook e8. Rook can capture the pinner.
        var fen = "4r3/8/8/8/4R3/8/8/4K3 w - - 0 1";
        var result = _engine.TryApplyMove(fen, "e4", "e8");
        Assert.True(result.IsLegal);
    }

    // =====================================================================
    // Must escape check
    // =====================================================================

    [Fact]
    public void Must_escape_check_cannot_make_unrelated_move()
    {
        // White king e1 in check from black rook e8. White knight on b1.
        // Knight move doesn't resolve the check.
        var fen = "4r3/8/8/8/8/8/8/1N2K3 w - - 0 1";
        var result = _engine.TryApplyMove(fen, "b1", "c3");
        Assert.False(result.IsLegal);
    }

    [Fact]
    public void Can_block_check()
    {
        // White king e1 in check from black rook e8. White rook on a4.
        // Rook can block by moving to e4.
        var fen = "4r3/8/8/8/R7/8/8/4K3 w - - 0 1";
        var result = _engine.TryApplyMove(fen, "a4", "e4");
        Assert.True(result.IsLegal);
    }

    [Fact]
    public void Can_capture_checking_piece()
    {
        // White king e1 is in check from black knight on d3.
        // White queen captures the knight and removes the check.
        var fen = "k7/8/8/8/8/3n4/8/3QK3 w - - 0 1";
        var result = _engine.TryApplyMove(fen, "d1", "d3");
        Assert.True(result.IsLegal);
    }

    // =====================================================================
    // Check detection
    // =====================================================================

    [Fact]
    public void Delivering_check_is_detected()
    {
        // White rook on a1, black king on a8. Move rook to a7 (not check) then a8 would
        // be capture. Let's use a cleaner position.
        // White queen on d1, white king on e1, black king on e8, no other pieces.
        // Qd1-d8 delivers check.
        var fen = "4k3/8/8/8/8/8/8/3QK3 w - - 0 1";
        var result = _engine.TryApplyMove(fen, "d1", "d8");
        Assert.True(result.IsLegal);
        Assert.True(result.IsCheck);
    }

    [Fact]
    public void Non_checking_move_is_not_marked_as_check()
    {
        var result = _engine.TryApplyMove(_engine.StartingFen, "e2", "e4");
        Assert.True(result.IsLegal);
        Assert.False(result.IsCheck);
    }

    // =====================================================================
    // Checkmate
    // =====================================================================

    [Fact]
    public void Scholars_mate_is_checkmate()
    {
        // Position right before scholar's mate: white queen on h5, about to take f7.
        // 1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6?? 4. Qxf7#
        var fen = "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4";
        var result = _engine.TryApplyMove(fen, "h5", "f7");
        Assert.True(result.IsLegal);
        Assert.True(result.IsCheck);
        Assert.True(result.IsCheckmate);
    }

    [Fact]
    public void Back_rank_mate()
    {
        // White rook on a1. Black king on h8, pawns on f7, g7, h7.
        // Ra1-a8 is back-rank mate.
        var fen = "7k/5ppp/8/8/8/8/8/R3K3 w - - 0 1";
        var result = _engine.TryApplyMove(fen, "a1", "a8");
        Assert.True(result.IsLegal);
        Assert.True(result.IsCheckmate);
    }

    [Fact]
    public void Check_but_not_mate_when_escape_exists()
    {
        // White rook delivers check but black king can move.
        // White rook a1, black king e8, no other pieces.
        var fen = "4k3/8/8/8/8/8/8/R3K3 w - - 0 1";
        var result = _engine.TryApplyMove(fen, "a1", "a8");
        Assert.True(result.IsLegal);
        Assert.True(result.IsCheck);
        Assert.False(result.IsCheckmate); // King can go to d7, e7, f7, etc.
    }

    // =====================================================================
    // Stalemate
    // =====================================================================

    [Fact]
    public void Stalemate_detected()
    {
        // Classic stalemate: black king on a8, white queen on b6, white king on c8 wouldn't work.
        // Simpler: black king on h8, white queen blocks all escape but doesn't check.
        // King h8, white queen on g6 (covers h7, g7, g8, f7), white king on f6 (covers g7, g8).
        // Actually that's check. Let's use a known stalemate position:
        // Black king a8, white queen a6 — wait that's check too.
        // Use: Black king h1, white king f2, white queen g3. Black to move.
        // h1 is trapped: g1 covered by Kg2 path... let me think.
        // Simplest: Black king a1, white queen c2, white king b3. Black to move.
        // a1: can go to a2 (covered by Qc2), b1 (covered by Qc2), b2 (covered by Kb3). 
        // Hmm a2 is attacked by Qc2? Qc2 attacks along file c, rank 2, and diagonals.
        // Qc2 attacks a2? No — c2 to a2 is rank 2, yes it does.
        // b1: Qc2 attacks b1 via diagonal. Yes.
        // So king a1 has no moves and is not in check. Stalemate!
        var fen = "8/8/8/8/8/1K6/2Q5/k7 b - - 0 1";
        var result = _engine.TryApplyMove(fen, "a1", "a2");
        // a2 should be illegal because queen covers it
        Assert.False(result.IsLegal);

        // Actually, to properly test stalemate, we need to make the LAST move
        // that causes stalemate and check the result.
        // White queen on b3, moves to c2, causing stalemate for black.
        var fenBefore = "8/8/8/8/8/1KQ5/8/k7 w - - 0 1";
        var stalemateMoveResult = _engine.TryApplyMove(fenBefore, "c3", "c2");
        Assert.True(stalemateMoveResult.IsLegal);
        Assert.False(stalemateMoveResult.IsCheck);
        Assert.True(stalemateMoveResult.IsStalemate);
    }

    // =====================================================================
    // Castling
    // =====================================================================

    [Fact]
    public void White_kingside_castle()
    {
        // Clear path for kingside castle
        var fen = "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1";
        var result = _engine.TryApplyMove(fen, "e1", "g1");
        Assert.True(result.IsLegal);
        Assert.Equal("R4RK1", GetRank(result.NewFen!.Split(' ')[0], 1));
    }

    [Fact]
    public void White_queenside_castle()
    {
        var fen = "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1";
        var result = _engine.TryApplyMove(fen, "e1", "c1");
        Assert.True(result.IsLegal);
    }

    [Fact]
    public void Cannot_castle_through_check()
    {
        // Black rook on f8 attacks f1 — king would pass through check.
        var fen = "5r2/8/8/8/8/8/8/R3K2R w KQ - 0 1";
        var result = _engine.TryApplyMove(fen, "e1", "g1");
        Assert.False(result.IsLegal);
    }

    [Fact]
    public void Cannot_castle_while_in_check()
    {
        // Black rook on e8 gives check.
        var fen = "4r3/8/8/8/8/8/8/R3K2R w KQ - 0 1";
        var result = _engine.TryApplyMove(fen, "e1", "g1");
        Assert.False(result.IsLegal);
    }

    [Fact]
    public void Cannot_castle_without_rights()
    {
        var fen = "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w - - 0 1";
        var result = _engine.TryApplyMove(fen, "e1", "g1");
        Assert.False(result.IsLegal);
    }

    [Fact]
    public void Cannot_castle_with_pieces_in_the_way()
    {
        var result = _engine.TryApplyMove(_engine.StartingFen, "e1", "g1");
        Assert.False(result.IsLegal);
    }

    [Fact]
    public void Cannot_castle_to_wrong_rank()
    {
        var fen = "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1";
        var result = _engine.TryApplyMove(fen, "e1", "g2");
        Assert.False(result.IsLegal);
    }

    [Fact]
    public void Castling_removes_castling_rights()
    {
        var fen = "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1";
        var result = _engine.TryApplyMove(fen, "e1", "g1");
        Assert.True(result.IsLegal);
        // White should lose both K and Q rights
        Assert.DoesNotContain("K", result.NewFen!.Split(' ')[2]);
        Assert.DoesNotContain("Q", result.NewFen!.Split(' ')[2]);
    }

    [Fact]
    public void Castling_preserves_and_updates_clocks()
    {
        var fen = "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 7 12";
        var result = _engine.TryApplyMove(fen, "e1", "g1");
        Assert.True(result.IsLegal);

        var parts = result.NewFen!.Split(' ');
        Assert.Equal("8", parts[4]);
        Assert.Equal("12", parts[5]);
    }

    // =====================================================================
    // En passant
    // =====================================================================

    [Fact]
    public void En_passant_capture()
    {
        // White pawn on e5, black just played d7-d5 (en passant target is d6).
        var fen = "rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3";
        var result = _engine.TryApplyMove(fen, "e5", "d6");
        Assert.True(result.IsLegal);
        // The black pawn on d5 should be removed
        var board = result.NewFen!.Split(' ')[0];
        Assert.DoesNotContain("p", GetRank(board, 5)); // rank 5 (index 4 from top)
    }

    [Fact]
    public void En_passant_not_available_without_flag()
    {
        // Same position but no en passant flag
        var fen = "rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3";
        var result = _engine.TryApplyMove(fen, "e5", "d6");
        Assert.False(result.IsLegal);
    }

    [Fact]
    public void Double_pawn_push_sets_en_passant_target()
    {
        var result = _engine.TryApplyMove(_engine.StartingFen, "e2", "e4");
        Assert.True(result.IsLegal);
        Assert.Contains("e3", result.NewFen!); // en passant target
    }

    // =====================================================================
    // Pawn promotion
    // =====================================================================

    [Fact]
    public void Pawn_promotion_to_queen()
    {
        // White pawn on e7, empty e8.
        var fen = "k7/4P3/8/8/8/8/8/4K3 w - - 0 1";
        var result = _engine.TryApplyMove(fen, "e7", "e8", "q");
        Assert.True(result.IsLegal);
        var board = result.NewFen!.Split(' ')[0];
        Assert.Contains("Q", GetRank(board, 8));
    }

    [Fact]
    public void Pawn_promotion_to_knight()
    {
        var fen = "k7/4P3/8/8/8/8/8/4K3 w - - 0 1";
        var result = _engine.TryApplyMove(fen, "e7", "e8", "n");
        Assert.True(result.IsLegal);
        var board = result.NewFen!.Split(' ')[0];
        Assert.Contains("N", GetRank(board, 8));
    }

    [Fact]
    public void Pawn_promotion_required_when_reaching_back_rank()
    {
        var fen = "k7/4P3/8/8/8/8/8/4K3 w - - 0 1";
        var result = _engine.TryApplyMove(fen, "e7", "e8"); // no promotion specified
        Assert.False(result.IsLegal);
        Assert.Contains("promotion", result.Error!, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Cannot_capture_the_king()
    {
        var fen = "3k4/8/8/8/8/8/8/3QK3 w - - 0 1";
        var result = _engine.TryApplyMove(fen, "d1", "d8");
        Assert.False(result.IsLegal);
        Assert.Contains("king", result.Error!, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Pawn_promotion_with_capture()
    {
        // White pawn on e7, black rook on d8.
        var fen = "3rk3/4P3/8/8/8/8/8/4K3 w - - 0 1";
        var result = _engine.TryApplyMove(fen, "e7", "d8", "q");
        Assert.True(result.IsLegal);
    }

    // =====================================================================
    // Castling rights updated on rook capture
    // =====================================================================

    [Fact]
    public void Capturing_rook_removes_opponent_castling_rights()
    {
        // White bishop captures black rook on h8.
        var fen = "r3k2r/ppppppBp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1";
        var result = _engine.TryApplyMove(fen, "g7", "h8");
        Assert.True(result.IsLegal);
        var castling = result.NewFen!.Split(' ')[2];
        Assert.DoesNotContain("k", castling); // black kingside gone
    }

    // =====================================================================
    // Halfmove clock
    // =====================================================================

    [Fact]
    public void Halfmove_increments_on_non_capture_non_pawn()
    {
        // Knight move
        var result = _engine.TryApplyMove(_engine.StartingFen, "b1", "c3");
        Assert.True(result.IsLegal);
        var halfmove = result.NewFen!.Split(' ')[4];
        Assert.Equal("1", halfmove);
    }

    [Fact]
    public void Halfmove_resets_on_pawn_move()
    {
        var fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 5 1";
        var result = _engine.TryApplyMove(fen, "e2", "e4");
        Assert.True(result.IsLegal);
        var halfmove = result.NewFen!.Split(' ')[4];
        Assert.Equal("0", halfmove);
    }

    // =====================================================================
    // Fullmove counter
    // =====================================================================

    [Fact]
    public void Fullmove_increments_after_black_moves()
    {
        // Black's turn, fullmove = 1.
        var fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";
        var result = _engine.TryApplyMove(fen, "e7", "e5");
        Assert.True(result.IsLegal);
        var fullmove = result.NewFen!.Split(' ')[5];
        Assert.Equal("2", fullmove);
    }

    // =====================================================================
    // Edge cases
    // =====================================================================

    [Fact]
    public void Invalid_square_notation_rejected()
    {
        var result = _engine.TryApplyMove(_engine.StartingFen, "z9", "e4");
        Assert.False(result.IsLegal);
    }

    [Fact]
    public void Same_square_rejected()
    {
        var result = _engine.TryApplyMove(_engine.StartingFen, "e2", "e2");
        Assert.False(result.IsLegal);
    }

    [Fact]
    public void Empty_source_rejected()
    {
        var result = _engine.TryApplyMove(_engine.StartingFen, "e4", "e5");
        Assert.False(result.IsLegal);
    }

    // =====================================================================
    // Helpers
    // =====================================================================

    /// <summary>
    /// Gets the FEN rank string for a 1-based rank number (1=bottom, 8=top).
    /// </summary>
    private static string GetRank(string boardFen, int rank)
    {
        var ranks = boardFen.Split('/');
        return ranks[8 - rank]; // FEN ranks are top-to-bottom
    }
}
