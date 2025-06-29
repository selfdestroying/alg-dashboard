using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;
using alg_dashboard_server.Repositories;

namespace alg_dashboard_server.Services;

public class StudentService(StudentRepository repository)
    : BaseService<StudentRepository, Student, StudentResponseDto, StudentCreateDto, StudentUpdateDto>(repository)
{
    protected override StudentResponseDto MapEntityToResponseDto(Student entity)
    {
        return new StudentResponseDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Age = entity.Age,
        };
    }
}