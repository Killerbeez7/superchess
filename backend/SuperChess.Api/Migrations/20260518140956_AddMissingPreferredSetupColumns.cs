using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SuperChess.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingPreferredSetupColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LastInitialMinutes",
                table: "AspNetUsers",
                type: "integer",
                nullable: false,
                defaultValue: 5);

            migrationBuilder.AddColumn<int>(
                name: "LastIncrementSeconds",
                table: "AspNetUsers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "LastIsRated",
                table: "AspNetUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "LastGameMode",
                table: "AspNetUsers",
                type: "character varying(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "classical");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastInitialMinutes",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastIncrementSeconds",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastIsRated",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastGameMode",
                table: "AspNetUsers");
        }
    }
}
