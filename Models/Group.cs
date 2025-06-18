using System.ComponentModel.DataAnnotations;

namespace alg_dashboard_server.Models;

public class Group
{
    public int Id { get; init; }
    [MaxLength(100)] public required string Name { get; set; } = string.Empty;
    public required int CourseId { get; set; }
    public Course Course { get; init; } = null!;
    public List<GroupStudent> GroupStudents { get; init; } = [];
}