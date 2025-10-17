# SuperChess

Tired of endless opening prep ruining the fun? This app reimagines classical chess with intuitive 1v1 matching, room-based invites, and real-time moves-focusing on pure gameplay.
SuperChess is a modern twist on classic chess that brings strategy, creativity, and chaos together. 
Explore a world where every move can surprise, every match feels different, and multiplayer battles push you to think beyond the usual. 
Freedom, unpredictability, and excitement await.

## Tech Stack & Structure
- **Frontend** (`/frontend`): Next.js for dynamic UI, chessboard rendering, and responsive design.
- **Backend** (`/backend`): ASP.NET Core Web API for auth, game logic, and SignalR real-time sync.
- **Core** (`/core`): Shared .NET class library for models (e.g., FEN parsing, move validation) and business rules-easy to port to Unity later.

## Quick Start
1. `cd backend && dotnet restore`
2. `cd frontend && npm install`
3. Run both and play!
