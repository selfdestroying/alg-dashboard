namespace alg_dashboard_server.Models;

public class Attendance
{
    public int StudentId { get; set; }
    public Student Student { get; set; }
    
    public int LessonId { get; set; }
    public Lesson Lesson { get; set; }
    
    public bool WasPresent { get; set; }
}