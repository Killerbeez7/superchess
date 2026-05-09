using SuperChess.Core.Chess;

namespace SuperChess.Core.Tests;

public class ChessEngineTests
{
    private readonly ChessEngine _engine = new();

    [Fact]
    public void White_pawn_can_move_one_square_from_start()
    {
        var result = _engine.TryApplyMove(_engine.StartingFen, "e2", "e3");
        Assert.True(result.IsLegal);
    }

    [Fact]
    public void White_pawn_can_move_two_squares_from_start()
    {
        var result = _engine.TryApplyMove(_engine.StartingFen, "e2", "e4");
        Assert.True(result.IsLegal);
    }

    [Fact]
    public void White_pawn_cannot_move_three_squares()
    {
        var result = _engine.TryApplyMove(_engine.StartingFen, "e2", "e5");
        Assert.False(result.IsLegal);
    }

    [Fact]
    public void Knight_can_make_L_shape_move()
    {
        var result = _engine.TryApplyMove(_engine.StartingFen, "b1", "c3");
        Assert.True(result.IsLegal);
    }

    [Fact]
    public void Knight_cannot_move_diagonally()
    {
        var result = _engine.TryApplyMove(_engine.StartingFen, "b1", "c2");
        Assert.False(result.IsLegal);
    }

    [Fact]
    public void Cannot_move_when_no_piece_on_source()
    {
        var result = _engine.TryApplyMove(_engine.StartingFen, "e4", "e5");
        Assert.False(result.IsLegal);
    }

    [Fact]
    public void Cannot_move_opponents_piece()
    {
        // Starting FEN has white to move; trying to move black's pawn should fail
        var result = _engine.TryApplyMove(_engine.StartingFen, "e7", "e5");
        Assert.False(result.IsLegal);
    }

    [Fact]
    public void Legal_move_returns_updated_fen()
    {
        var result = _engine.TryApplyMove(_engine.StartingFen, "e2", "e4");
        Assert.NotNull(result.NewFen);
        Assert.Contains("b ", result.NewFen); // black to move next
    }
}