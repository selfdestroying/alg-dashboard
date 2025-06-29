using System.ComponentModel.DataAnnotations;

namespace alg_dashboard_server.Models;

public class Student
{
    public int Id { get; init; }
    [MaxLength(100)] public required string Name { get; set; } = string.Empty;
    public required int Age { get; set; } = 0;
    public List<GroupStudent> GroupStudents { get; init; } = [];

}