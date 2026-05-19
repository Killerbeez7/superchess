using SuperChess.Core.Chess;

namespace SuperChess.Api.Services.Bots;

public sealed record BotMoveSelection(
    string From,
    string To,
    string? Promotion,
    MoveResult Result);
