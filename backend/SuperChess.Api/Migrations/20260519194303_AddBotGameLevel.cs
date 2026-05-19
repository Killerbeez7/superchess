using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SuperChess.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBotGameLevel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BotLevel",
                table: "Games",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BotLevel",
                table: "Games");
        }
    }
}
