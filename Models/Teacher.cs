using System.ComponentModel.DataAnnotations;

namespace alg_dashboard_server.Models;

public class Teacher
{
    public int Id { get; init; }
    [MaxLength(100), MinLength(2)] public required string Name { get; init; } = string.Empty;
    [MaxLength(100), MinLength(2)] public string Password { get; set; } = string.Empty;
    public int RoleId { get; init; }
    public Role? Role { get; init; }
}