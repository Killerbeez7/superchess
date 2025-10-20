using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SuperChess.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Players",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DisplayName = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Color = table.Column<int>(type: "int", nullable: false),
                    Elo = table.Column<int>(type: "int", nullable: false),
                    IsBot = table.Column<bool>(type: "bit", nullable: false),
                    IsOnline = table.Column<bool>(type: "bit", nullable: false),
                    AvatarUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Location = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Players", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ChessGames",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    Player1Id = table.Column<int>(type: "int", nullable: false),
                    Player2Id = table.Column<int>(type: "int", nullable: true),
                    Player1Color = table.Column<int>(type: "int", nullable: false),
                    Player2Color = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    WhoseTurn = table.Column<int>(type: "int", nullable: false),
                    Fen = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    Pgn = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: true),
                    Result = table.Column<int>(type: "int", nullable: false),
                    EndReason = table.Column<int>(type: "int", nullable: false),
                    TimeControlSeconds = table.Column<int>(type: "int", nullable: true),
                    IncrementSeconds = table.Column<int>(type: "int", nullable: true),
                    RemainingSecondsPlayer1 = table.Column<int>(type: "int", nullable: false),
                    RemainingSecondsPlayer2 = table.Column<int>(type: "int", nullable: false),
                    IsRated = table.Column<bool>(type: "bit", nullable: false),
                    AllowSpectators = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    LastMoveAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChessGames", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChessGames_Players_Player1Id",
                        column: x => x.Player1Id,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ChessGames_Players_Player2Id",
                        column: x => x.Player2Id,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Moves",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ChessGameId = table.Column<int>(type: "int", nullable: false),
                    MoveNumber = table.Column<int>(type: "int", nullable: false),
                    ByColor = table.Column<int>(type: "int", nullable: false),
                    From = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    To = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    Promotion = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: true),
                    San = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: true),
                    Uci = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: true),
                    PlayedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Moves", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Moves_ChessGames_ChessGameId",
                        column: x => x.ChessGameId,
                        principalTable: "ChessGames",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChessGames_Fen",
                table: "ChessGames",
                column: "Fen");

            migrationBuilder.CreateIndex(
                name: "IX_ChessGames_Player1Id",
                table: "ChessGames",
                column: "Player1Id");

            migrationBuilder.CreateIndex(
                name: "IX_ChessGames_Player2Id",
                table: "ChessGames",
                column: "Player2Id");

            migrationBuilder.CreateIndex(
                name: "IX_ChessGames_Status_CreatedAt",
                table: "ChessGames",
                columns: new[] { "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Moves_ChessGameId",
                table: "Moves",
                column: "ChessGameId");

            migrationBuilder.CreateIndex(
                name: "IX_Players_DisplayName",
                table: "Players",
                column: "DisplayName");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Moves");

            migrationBuilder.DropTable(
                name: "ChessGames");

            migrationBuilder.DropTable(
                name: "Players");
        }
    }
}
