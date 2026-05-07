==================================================================================
PLANNING PHASE
==================================================================================
1.Target

Stable classical 1vs1 chess MVP:
-ASP.NET Core Web API
-SignalR
-EF Core
-SQL Servcer or SQLite
-Next.js frontend
-server-autoritative game flow

*Later we will add SuperChess mechanics

2.Architecture

Projects:
-backend/SuperChess.Api
-core/SuperChess.Core
-frontend/superchess-web

3.Responsibilities

SuperChess.Api:
-endpoints
-SignalR hub
-EF Core
-application services
-auth/session checks

SuperChess.Core:
-domain models
-board/game abstractions
-future variants support
-interface for rules engine

superchess-web:
-UI
-API client
-SignalR client
-board rendering
-local interaction state only
==================================================================================
EXAMPLES
==================================================================================
Implement a rules service interface, so it can be swapped later
```
IChessRulesService
    GetLegalMoves(...)
    ApplyMove(...)
    GetGameState(...)

```
==================================================================================
BUILD ORDER
==================================================================================
1.Create clean solution structure
2.Create backend API project
3.Create core lib
4.Wire backend to core
5.Create frontend
6.Implement first vert slice:
-create game
-get game
-join game
7.Add realtime with SignalR
8.Add move submission flow
9.Add player session/ownership
10.Polish, type and test
==================================================================================
MVP
==================================================================================
Player:
-Id
-DisplayName
-Token/SessionKey
-CreatedAt

ChessGame:
-Id
-Status
-WhitePlayerId
-BlackPlayerId
-CurrentFen
-WhoseTurn
-Result
-CreatedAt
-UpdatedAt

Move:
-Id
-GameId
-MoveNumber
-Uci
-San
-PlayedByColor
-CreatedAt
==================================================================================

==================================================================================
