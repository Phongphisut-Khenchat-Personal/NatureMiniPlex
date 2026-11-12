using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using NatureMiniPlex.Web.Data;

#nullable disable

namespace NatureMiniPlex.Web.Data.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20261112060000_CinemaSeatControl")]
    public class CinemaSeatControl : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsClosed",
                table: "Seats",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsClosed",
                table: "Seats");
        }
    }
}
