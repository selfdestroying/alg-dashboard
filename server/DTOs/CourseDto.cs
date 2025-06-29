namespace alg_dashboard_server.DTOs;

public class CourseResponseDto
{
    public required int Id { get; set; }
    public required string Name { get; set; }
}

public class CourseCreateDto
{
    public required string Name { get; set; }
}

public class CourseUpdateDto
{
    public required string? Name { get; set; }
}