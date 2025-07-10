namespace alg_dashboard_server.Models;

public class Payment
{
    public required int StudentId { get; set; }
    public required int GroupId { get; set; }
    public required int TotalPaidClasses { get; set; }
    public required int ClassesLeft { get; set; }
    
    public Student Student { get; set; }
    public Group Group { get; set; }
}