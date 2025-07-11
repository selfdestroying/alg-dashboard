using alg_dashboard_server.Models;

namespace alg_dashboard_server.DTOs;


public class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Password { get; set; }
    public string Role { get; set; }
}

public class UserResponseDto
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required Role Role { get; set; }
}


public class UserCreateDto
{
    public required string Name { get; set; }
    public required string Password { get; set; }
    public required int RoleId { get; set; }
}

public class UserUpdateDto
{
    public required string? Name { get; set; }
    public required string? Password { get; set; }
    public required int? RoleId { get; set; }
}