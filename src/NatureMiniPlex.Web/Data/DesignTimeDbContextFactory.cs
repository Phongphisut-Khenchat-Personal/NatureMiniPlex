using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace NatureMiniPlex.Web.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        return AppDbContextFactory.Create(
            "Server=localhost,1433;Database=NatureMiniPlex;User Id=sa;Password=NatureMiniPlex!2026;TrustServerCertificate=True");
    }
}
