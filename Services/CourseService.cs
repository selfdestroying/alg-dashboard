using alg_dashboard_server.DTOs;
using alg_dashboard_server.Repositories;

namespace alg_dashboard_server.Services;

public class CourseService(CourseRepository courseRepository)
{
    public async Task<List<CourseResponseDto>> GetAll()
    {
        var courses = await courseRepository.Get();
        return courses.Select(c => new CourseResponseDto
        {
            Id = c.Id,
            Name = c.Name,
        }).ToList();
    }
}