using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using NatureMiniPlex.Web.Data;

#nullable disable

namespace NatureMiniPlex.Web.Data.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20261112054500_MovieRecommendation")]
    public class MovieRecommendation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsRecommended",
                table: "Movies",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql("""
                UPDATE Movies SET IsRecommended = 1
                WHERE Status = 0 AND MovieId IN (
                    SELECT TOP 2 MovieId FROM Movies WHERE Status = 0 ORDER BY MovieId
                )
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsRecommended",
                table: "Movies");
        }
    }
}
