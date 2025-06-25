using alg_dashboard_server.Models;

namespace alg_dashboard_server.DTOs;

public class LessonResponseDto
{
    public required int Id { get; set; }
    public required DateOnly Date { get; set; }
    public required TimeOnly Time { get; set; }
    public required List<AttendanceResponseDto> Attendances { get; set; }
}

public class AttendanceResponseDto
{
    public required int StudentId { get; set; }
    public required int LessonId { get; set; }
    public required string Student { get; set; }
    public required bool WasPresent { get; set; }
}