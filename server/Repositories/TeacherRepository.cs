using alg_dashboard_server.Data;
using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;

namespace alg_dashboard_server.Repositories;

public class TeacherRepository(AppDbContext context) : BaseRepository<Teacher, TeacherCreateDto, TeacherUpdateDto>(context)
{
    protected override Teacher MapCreateDtoToEntity(TeacherCreateDto entity)
    {
        return new Teacher
        {
            Name = entity.Name,
            RoleId = entity.RoleId,
            Password = entity.Password
        };
    }

    protected override void MapUpdateDtoToEntity(Teacher entity, TeacherUpdateDto dto)
    {
        entity.Name = dto.Name ?? entity.Name;
        entity.RoleId = dto.RoleId ?? entity.RoleId;
        entity.Password = dto.Password ?? entity.Password;
    }
}