using alg_dashboard_server.Data;
using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;
using Microsoft.EntityFrameworkCore;

namespace alg_dashboard_server.Repositories;

public class StudentRepository(AppDbContext context)
    : BaseRepository<Student, StudentCreateDto, StudentUpdateDto>(context)
{
    protected override Student MapCreateDtoToEntity(StudentCreateDto entity)
    {
        return new Student { Name = entity.Name, Age = entity.Age };
    }
    protected override void MapUpdateDtoToEntity(Student entity, StudentUpdateDto dto)
    {
        entity.Name = dto.Name ?? entity.Name;
        entity.Age = dto.Age ?? entity.Age;
    }
}