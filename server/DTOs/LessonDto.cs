
namespace alg_dashboard_server.DTOs;

public class LessonResponseDto
{
    public required int Id { get; set; }
    public required DateOnly Date { get; set; }
    public required TimeOnly Time { get; set; }
    public required int GroupId { get; set; }
    public required List<AttendanceResponseDto> Attendances { get; set; }
}

public class LessonCreateDto
{
    public required DateOnly Date { get; set; }
    public required TimeOnly Time { get; set; }
    public required int GroupId { get; set; }
}

public class LessonUpdateDto
{
    public required DateOnly? Date { get; set; }
    public required TimeOnly? Time { get; set; }
    public required int? GroupId { get; set; }
}

