using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;
using alg_dashboard_server.Repositories;

namespace alg_dashboard_server.Services;

public class CourseService(CourseRepository repository)
    : BaseService<CourseRepository, Course, CourseResponseDto, CourseCreateDto, CourseUpdateDto>(repository)
{
    protected override CourseResponseDto MapEntityToResponseDto(Course entity)
    {
        return new CourseResponseDto
        {
            Id = entity.Id,
            Name = entity.Name,
        };
    }
}