using System.ComponentModel.DataAnnotations;

namespace alg_dashboard_server.Models;

public class Teacher
{
    public int Id { get; set; }
    [MaxLength(100), MinLength(2)] public required string Name { get; set; } = string.Empty;
    [MaxLength(100), MinLength(2)] public string Password { get; set; } = string.Empty;
    public int RoleId { get; set; }
    public Role Role { get; set; }
}