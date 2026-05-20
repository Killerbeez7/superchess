using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SuperChess.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddGameKind : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Kind",
                table: "Games",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Online");

            migrationBuilder.Sql("""
                UPDATE "Games"
                SET "Kind" = 'Bot'
                WHERE "WhitePlayerId" IN (
                    SELECT "Id"
                    FROM "Players"
                    WHERE "IsBot" = TRUE
                )
                OR "BlackPlayerId" IN (
                    SELECT "Id"
                    FROM "Players"
                    WHERE "IsBot" = TRUE
                );
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Kind",
                table: "Games");
        }
    }
}
