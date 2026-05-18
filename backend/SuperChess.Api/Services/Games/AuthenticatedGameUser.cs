namespace SuperChess.Api.Services.Games;

public sealed record AuthenticatedGameUser(Guid UserId, string DisplayName);
