using System.ComponentModel.DataAnnotations;

namespace alg_dashboard_server.Models;

public class User
{
    public int Id { get; init; }
    [MaxLength(100)] public required string Username { get; init; }
    [MaxLength(100)] public required string Email { get; init; }
    [MaxLength(100)] public string Password { get; set; } = string.Empty;
    public int Age { get; init; }
    public int RoleId { get; init; }
    public Role? Role { get; init; }
}