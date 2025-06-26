namespace alg_dashboard_server.DTOs;

public class GroupResponseDto
{
    public required int Id { get; set; }
    public required string Name { get; init; }
    public required string Course { get; init; }
    public required string Teacher { get; init; }
    public required DateOnly StartDate { get; init; }
    public required DayOfWeek LessonDay { get; init; }
    public required TimeOnly LessonTime { get; init; }
    public required List<StudentResponseDto> Students { get; init; }
    public List<LessonResponseDto>? Lessons { get; set; }
}

public class GroupCreateDto
{
    public required string Name { get; init; }
    public required int CourseId { get; init; }
    public required int TeacherId { get; init; }
    public required DateOnly StartDate { get; init; }
    public required TimeOnly LessonTime { get; init; }
}

public class GroupUpdateDto
{
    public string? Name { get; set; }
    public int? CourseId { get; set; }
    public int? TeacherId { get; set; }
    public DateOnly? StartDate { get; set; }
    public TimeOnly? LessonTime { get; set; }
}

public class EditStudentInGroupRequestDto
{
    public int GroupId { get; set; }
    public int StudentId { get; set; }
}