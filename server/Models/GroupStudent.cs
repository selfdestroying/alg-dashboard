namespace alg_dashboard_server.Models;

public class GroupStudent
{
    public int StudentId { get; init; }
    public int GroupId { get; init; }
    
    public Student Student { get; init; } = null!;
    public Group Group { get; init; } = null!;
}