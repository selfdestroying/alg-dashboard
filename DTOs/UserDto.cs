using System.ComponentModel.DataAnnotations;

namespace alg_dashboard_server.DTOs;

public class UserDto
{
    public int Id { get; set; }
    [MaxLength(100)] public string Username { get; init; } = string.Empty;
    [MaxLength(100)] public string Role { get; init; } = string.Empty;
}

public class RegisterDto
{
    [MaxLength(100)] public string Username { get; init; } = string.Empty;
    [MaxLength(100)] public string Email { get; init; } = string.Empty;
    [MaxLength(100)] public string Password { get; init; } = string.Empty;
}

public class LoginDto
{
    [MaxLength(100)] public required string Username { get; init; } = string.Empty;
    [MaxLength(100)] public required string Password { get; init; } = string.Empty;
}