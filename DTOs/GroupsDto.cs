namespace alg_dashboard_server.DTOs;

public class GroupRequestDto
{
    public required string Name { get; init; }
    public required int CourseId { get; init; }
}

public class GroupResponseDto
{
    public required int Id { get; set; }
    public required string Name { get; init; }
    public required string Course { get; init; }
    public required List<StudentResponseDto> Students { get; init; }
}


public class UpdateGroupRequestDto
{
    public string? Name { get; set; }
    public int? CourseId { get; set; }
}

public class EditStudentInGroupRequestDto
{
    public int GroupId { get; set; }
    public int StudentId { get; set; }
}