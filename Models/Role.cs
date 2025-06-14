using System.ComponentModel.DataAnnotations;

namespace alg_dashboard_server.Models;

public class Role
{
    public int Id { get; init; }
    [MaxLength(100)] public string Name { get; init; } = string.Empty;

    public List<User> Users { get; init; } = [];
}