using alg_dashboard_server.Models;
using Microsoft.EntityFrameworkCore;

namespace alg_dashboard_server.Data;

public class AppDbContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<Teacher> Teachers { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Student> Students { get; set; }
    public DbSet<Course> Courses { get; set; }
    public DbSet<Group> Groups { get; set; }
    public DbSet<Lesson> Lessons { get; set; }
    public DbSet<Attendance> Attendances { get; set; }
    public DbSet<GroupStudent> GroupStudents { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<GroupStudent>().HasKey(sg => new { sg.GroupId, sg.StudentId });
        modelBuilder.Entity<GroupStudent>().HasOne(sg => sg.Student).WithMany(s => s.GroupStudents)
            .HasForeignKey(sg => sg.StudentId);
        modelBuilder.Entity<GroupStudent>().HasOne(sg => sg.Group).WithMany(g => g.GroupStudents)
            .HasForeignKey(sg => sg.GroupId);

        modelBuilder.Entity<Attendance>().HasKey(a => new { a.LessonId, a.StudentId });
        modelBuilder.Entity<Attendance>()
            .HasOne(a => a.Lesson)
            .WithMany(l => l.Attendances)
            .HasForeignKey(a => a.LessonId);
        modelBuilder.Entity<Attendance>().HasOne(a => a.Student).WithMany().HasForeignKey(a => a.StudentId);
    }
}