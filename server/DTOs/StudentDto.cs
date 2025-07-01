namespace alg_dashboard_server.DTOs;

public class StudentDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int Age { get; set; }
}

public class StudentResponseDto
{
    public required int Id { get; set; }
    public required string Name { get; init; }
    public required int Age { get; init; }
}

public class StudentCreateDto
{
    public required string Name { get; init; }
    public required int Age { get; init; }
}

public class StudentUpdateDto
{
    public string? Name { get; set; }
    public int? Age { get; set; }
}