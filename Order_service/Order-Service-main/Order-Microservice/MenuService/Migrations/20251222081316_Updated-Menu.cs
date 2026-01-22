using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MenuService.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedMenu : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "userId",
                table: "Menus");

            migrationBuilder.RenameColumn(
                name: "price",
                table: "Menus",
                newName: "variant_price");

            migrationBuilder.AddColumn<DateTime>(
                name: "added_at",
                table: "Menus",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<decimal>(
                name: "computed_subtotal",
                table: "Menus",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "img_url",
                table: "Menus",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "item_description",
                table: "Menus",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "item_name",
                table: "Menus",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "variant_name",
                table: "Menus",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "added_at",
                table: "Menus");

            migrationBuilder.DropColumn(
                name: "computed_subtotal",
                table: "Menus");

            migrationBuilder.DropColumn(
                name: "img_url",
                table: "Menus");

            migrationBuilder.DropColumn(
                name: "item_description",
                table: "Menus");

            migrationBuilder.DropColumn(
                name: "item_name",
                table: "Menus");

            migrationBuilder.DropColumn(
                name: "variant_name",
                table: "Menus");

            migrationBuilder.RenameColumn(
                name: "variant_price",
                table: "Menus",
                newName: "price");

            migrationBuilder.AddColumn<int>(
                name: "userId",
                table: "Menus",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
