namespace alg_dashboard_server.DTOs;

public class AttendanceResponseDto
{
    public required int StudentId { get; set; }
    public required int LessonId { get; set; }
    public required string Student { get; set; }
    public required bool WasPresent { get; set; }
}

public class AttendanceCreateDto
{
    public required int LessonId { get; set; }
    public required int StudentId { get; set; }
    public required bool WasPresent { get; set; }
}

public class Attendance
{
    public required int StudentId { get; set; }
    public required bool WasPresent { get; set; }
}

public class AttendanceUpdateDto
{
    public required int LessonId { get; set; }
    public required List<Attendance> Attendances { get; set; }
}