using alg_dashboard_server.Data;
using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;

namespace alg_dashboard_server.Repositories;

public class CourseRepository(AppDbContext context): BaseRepository<Course, CourseCreateDto, CourseUpdateDto>(context)
{
    protected override Course MapCreateDtoToEntity(CourseCreateDto entity)
    {
        return new Course
        {
            Name = entity.Name,
        };
    }

    protected override void MapUpdateDtoToEntity(Course entity, CourseUpdateDto dto)
    {
        entity.Name = dto.Name ?? entity.Name;
    }
}