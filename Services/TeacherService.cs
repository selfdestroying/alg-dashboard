using alg_dashboard_server.DTOs;
using alg_dashboard_server.Repositories;

namespace alg_dashboard_server.Services;

public class TeacherService(TeacherRepository teacherRepository)
{
    public async Task<List<TeacherResponseDto>> GetAll()
    {
        var users = await teacherRepository.Get();
        return users.Select(u => new TeacherResponseDto
        {
            Id = u.Id,
            Name = u.Name,
            Role = u.Role?.Name ?? "N/A",
        }).ToList();
    }

    public async Task<TeacherResponseDto?> GetById(int id)
    {
        var user = await teacherRepository.Get(id);
        if (user == null) return null;
        return new TeacherResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Role = user.Role?.Name ?? "N/A",
        };
    }


    public async Task Create(TeacherCreateDto teacher) => await teacherRepository.Create(teacher);
}