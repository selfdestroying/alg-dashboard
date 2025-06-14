using System.ComponentModel.DataAnnotations;

namespace alg_dashboard_server.Models;

public class Student
{
    public int Id { get; init; }
    [MaxLength(100)] public required string Name { get; init; } = string.Empty;
    public required int Age { get; init; } = 0;

}