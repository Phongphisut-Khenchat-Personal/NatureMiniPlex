using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using NatureMiniPlex.Web.Data;

#nullable disable

namespace NatureMiniPlex.Web.Data.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20261112053000_MoviePoster")]
    public class MoviePoster : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PosterFileName",
                table: "Movies",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PosterFileName",
                table: "Movies");
        }
    }
}
