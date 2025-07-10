using System.ComponentModel.DataAnnotations;

namespace alg_dashboard_server.Models;

public class Student
{
    public int Id { get; init; }
    [MaxLength(100)] public required string Name { get; set; }
    public required int Age { get; set; }
    public List<GroupStudent> GroupStudents { get; init; } = [];

}