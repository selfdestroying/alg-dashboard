using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;
using alg_dashboard_server.Repositories;

namespace alg_dashboard_server.Services;

public class TeacherService(TeacherRepository repository): BaseService<TeacherRepository, Teacher, TeacherResponseDto, TeacherCreateDto, TeacherUpdateDto>(repository)
{
    protected override TeacherResponseDto MapEntityToResponseDto(Teacher entity)
    {
        return new TeacherResponseDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Role = entity.Role?.Name ?? "N/A",
        };
    }
}