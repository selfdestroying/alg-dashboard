using alg_dashboard_server.DTOs;
using alg_dashboard_server.Interfaces;
using alg_dashboard_server.Models;

namespace alg_dashboard_server.Services;

public class CourseService(ICourseRepository courseRepository)
{
    public async Task<List<CourseDto>> GetAllAsync()
    {
        var courses= await courseRepository.GetAllAsync();
        return courses.Select(c => new CourseDto
        {
            Id = c.Id,
            Name = c.Name,
        }).ToList();
    }
    
}