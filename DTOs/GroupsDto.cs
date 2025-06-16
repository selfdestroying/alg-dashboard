namespace alg_dashboard_server.DTOs;

public class GroupsDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Course { get; set; } = string.Empty;
    public int Students { get; set; } = 0;
}

public class GroupDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Course { get; set; } = string.Empty;
    public List<StudentDto> Students { get; set; } = [];
}

public class UpdateGroupDto
{
    public string? Name { get; set; }
    public int? CourseId { get; set; }
}