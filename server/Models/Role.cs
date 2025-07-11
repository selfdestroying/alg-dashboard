using System.ComponentModel.DataAnnotations;

namespace alg_dashboard_server.Models;

public class Role
{
    public int Id { get; init; }
    [MaxLength(100)] public required string Name { get; init; }
    public required bool PasswordRequired { get; init; }
    
    public List<User> Users { get; init; } = [];
}