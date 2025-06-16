namespace alg_dashboard_server.DTOs;

public class StudentDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Age { get; set; }
}

public class UpdateStudentDto
{
    public string? Name { get; set; }
    public int? Age { get; set; }
}