namespace alg_dashboard_server.DTOs;


public class TeacherResponseDto
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required string Role { get; set; }
}


public class TeacherCreateDto
{
    public required string Name { get; set; }
    public required string Password { get; set; }
    public required int RoleId { get; set; }
}

public class TeacherUpdateDto
{
    public required string? Name { get; set; }
    public required string? Password { get; set; }
    public required int? RoleId { get; set; }
}