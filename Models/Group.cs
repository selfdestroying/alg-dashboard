using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices.JavaScript;

namespace alg_dashboard_server.Models;

public class Group
{
    public int Id { get; init; }
    [MaxLength(100)] public required string Name { get; set; }
    public required DateOnly StartDate { get; set; }
    public required DayOfWeek LessonDay { get; set; }
    public required TimeOnly LessonTime { get; set; }
    public required string BackOfficeUrl { get; set; }
    public required int CourseId { get; set; }
    public Course Course { get; init; } = null!;
    
    public required int TeacherId { get; set; }
    public Teacher Teacher { get; init; } = null!;
    
    public List<GroupStudent> GroupStudents { get; init; } = [];
    public List<Lesson> Lessons { get; set; } = [];
}