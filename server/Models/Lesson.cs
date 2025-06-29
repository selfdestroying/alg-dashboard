namespace alg_dashboard_server.Models;

public class Lesson
{
    public int Id { get; set; }
    public required DateOnly Date { get; set; }
    public required TimeOnly Time { get; set; }
    public required int GroupId { get; set; }
    public Group Group { get; set; }

    public List<Attendance> Attendances { get; set; } = [];
}