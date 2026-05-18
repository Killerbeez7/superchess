using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SuperChess.Api.Migrations
{
    /// <inheritdoc />
    [Migration("20260518120000_PersistSelectedTimeControl")]
    public partial class PersistSelectedTimeControl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsRated",
                table: "Games",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "TimeControlType",
                table: "Games",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Blitz");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsRated",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "TimeControlType",
                table: "Games");
        }
    }
}
