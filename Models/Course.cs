using System.ComponentModel.DataAnnotations;

namespace alg_dashboard_server.Models;

public class Course
{
    public int Id { get; init; }
    [MaxLength(100)] public required string Name { get; init; } = string.Empty;

    public List<Group> Groups { get; init; } = [];
}