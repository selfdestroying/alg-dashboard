namespace alg_dashboard_server.DTOs;

public class StudentRequestDto
{
    public required string Name { get; init; }
    public required int Age { get; init; }
}

public class StudentResponseDto
{
    public required int Id { get; set; }
    public required string Name { get; init; }
    public required int Age { get; init; }
}

public class UpdateStudentRequestDto
{
    public required string? Name { get; set; }
    public required int? Age { get; set; }
}

public class UpdateStudentResponseDto
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required int Age { get; set; }
}