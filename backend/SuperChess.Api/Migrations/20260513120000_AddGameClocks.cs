using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using SuperChess.Api.Data;

#nullable disable

namespace SuperChess.Api.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(AppDbContext))]
    [Migration("20260513120000_AddGameClocks")]
    public partial class AddGameClocks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BlackTimeRemainingMs",
                table: "Games",
                type: "integer",
                nullable: false,
                defaultValue: 600000);

            migrationBuilder.AddColumn<int>(
                name: "IncrementMs",
                table: "Games",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "InitialClockMs",
                table: "Games",
                type: "integer",
                nullable: false,
                defaultValue: 600000);

            migrationBuilder.AddColumn<DateTime>(
                name: "TurnStartedAtUtc",
                table: "Games",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WhiteTimeRemainingMs",
                table: "Games",
                type: "integer",
                nullable: false,
                defaultValue: 600000);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BlackTimeRemainingMs",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "IncrementMs",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "InitialClockMs",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "TurnStartedAtUtc",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "WhiteTimeRemainingMs",
                table: "Games");
        }
    }
}
