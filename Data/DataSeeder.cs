
using alg_dashboard_server.Models;
using Microsoft.AspNetCore.Identity;

namespace alg_dashboard_server.Data;

public static class DataSeeder
{
    private static readonly PasswordHasher<Teacher> _passwordHasher = new();
    public static void SeedRoles(AppDbContext context)
    {
        if (context.Roles.Any()) return;
        context.Roles.AddRange(
            new Role { Name = "Admin" },
            new Role { Name = "User" }
        );
        context.SaveChanges();
    }

    public static void SeedCourses(AppDbContext context)
    {
        if (context.Courses.Any()) return;
        context.Courses.AddRange(
            new Course {Name = "Python Start 1"},
            new Course {Name = "Python Start 2"},
            new Course {Name = "Python Pro 1"},
            new Course {Name = "Python Pro 2"},
            new Course {Name = "Visual Programming 1"},
            new Course {Name = "Visual Programming 2"},
            new Course {Name = "Unity"}
        );
        context.SaveChanges();
    }

    public static void SeedTeachers(AppDbContext context)
    {
        if (context.Teachers.Any()) return;
        var admin = new Teacher
        {
            Name = "admin",
            RoleId = 1
        };
        admin.Password = _passwordHasher.HashPassword(admin, "admin");
        var teacher = new Teacher
        {
            Name = "teacher",
            RoleId = 2
        };
        teacher.Password = _passwordHasher.HashPassword(teacher, "teacher");
        
        context.Teachers.AddRange(admin, teacher);
        context.SaveChanges();
    }
}