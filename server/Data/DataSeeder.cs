using alg_dashboard_server.Models;
using Microsoft.AspNetCore.Identity;

namespace alg_dashboard_server.Data;

public static class DataSeeder
{
    private static readonly PasswordHasher<User> PasswordHasher = new();

    public static void SeedRoles(AppDbContext context)
    {
        if (context.Roles.Any()) return;
        context.Roles.AddRange(
            new Role { Name = "Admin", PasswordRequired = true },
            new Role { Name = "Owner", PasswordRequired = true },
            new Role { Name = "Teacher", PasswordRequired = false },
            new Role { Name = "Manager", PasswordRequired = true }
        );
        context.SaveChanges();
    }

    public static void SeedCourses(AppDbContext context)
    {
        if (context.Courses.Any()) return;
        context.Courses.AddRange(
            new Course { Name = "Python Start 1" },
            new Course { Name = "Python Start 2" },
            new Course { Name = "Python Pro 1" },
            new Course { Name = "Python Pro 2" },
            new Course { Name = "Visual Programming 1" },
            new Course { Name = "Visual Programming 2" },
            new Course { Name = "Unity" }
        );
        context.SaveChanges();
    }

    public static void SeedUsers(AppDbContext context)
    {
        if (context.Users.Any()) return;
        var users = new
            List<User>
            {
                new User
                {
                    Name = "Максим",
                    Password = "admin",
                    RoleId = 1
                },
                new User
                {
                    Name = "Саша",
                    Password = "owner",
                    RoleId = 2
                },
                new User
                {
                    Name = "Настя",
                    Password = "owner",
                    RoleId = 2
                },
                new User
                {
                    Name = "Рита",
                    Password = "manager",
                    RoleId = 4
                },
                new User
                {
                    Name = "Наташа",
                    Password = "teacher",
                    RoleId = 3
                },
                new User
                {
                    Name = "Маша",
                    Password = "manager",
                    RoleId = 4
                },
                new User
                {
                    Name = "Федя",
                    Password = "teacher",
                    RoleId = 3
                }
            };
        foreach (var user in users)
        {
            user.Password = PasswordHasher.HashPassword(user, user.Password);
        }

        context.Users.AddRange(users);
        context.SaveChanges();
    }
}