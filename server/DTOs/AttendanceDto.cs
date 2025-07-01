using alg_dashboard_server.Models;

namespace alg_dashboard_server.DTOs;


public class AttendanceResponseDto
{
    public required int StudentId { get; set; }
    public required int LessonId { get; set; }
    public required string Student { get; set; }
    public required AttendanceStatus Status { get; set; }
    public string Comment { get; set; }
}

public class AttendanceCreateDto
{
    public required int LessonId { get; set; }
    public required int StudentId { get; set; }
    public required AttendanceStatus Status { get; set; }
    public string Comment { get; set; }
}

public class AttendanceDto
{
    public required int StudentId { get; set; }
    public required AttendanceStatus Status { get; set; }
    public string Comment { get; set; }
}

public class AttendanceUpdateDto
{
    public required int LessonId { get; set; }
    public required List<AttendanceDto> Attendances { get; set; }
}