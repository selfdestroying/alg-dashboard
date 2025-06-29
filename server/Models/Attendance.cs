namespace alg_dashboard_server.Models;

public enum AttendanceStatus
{
    Unspecified = 0,
    Present = 1,
    Absent = 2
}

public class Attendance
{
    public required int StudentId { get; set; }
    public int LessonId { get; set; }
    public required AttendanceStatus Status { get; set; }
    public required string Comment { get; set; }
    
    public Student Student { get; set; }
    public Lesson Lesson { get; set; }
}