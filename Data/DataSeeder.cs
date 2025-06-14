
using alg_dashboard_server.Models;

namespace alg_dashboard_server.Data;

public static class DataSeeder
{
    public static void SeedRoles(AppDbContext context)
    {
        if (context.Roles.Any()) return;
        context.Roles.AddRange(
            new Role { Name = "Admin" },
            new Role { Name = "User" }
        );
        context.SaveChanges();
    }
}