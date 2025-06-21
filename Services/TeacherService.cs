using alg_dashboard_server.DTOs;
using alg_dashboard_server.Interfaces;
using alg_dashboard_server.Models;

namespace alg_dashboard_server.Services;

public class TeacherService(IUserRepository userRepository)
{
    public async Task<List<TeacherDto>> GetAllAsync()
    {
        var users = await userRepository.GetAllAsync();
        return users.Select(u => new TeacherDto
        {
            Id = u.Id,
            Name = u.Name,
            Role = u.Role?.Name ?? "N/A",
        }).ToList();
    }

    public async Task<TeacherDto?> GetByIdAsync(int id)
    {
        var user = await userRepository.GetByIdAsync(id);
        if (user == null) return null;
        return new TeacherDto
        {
            Id = user.Id,
            Name = user.Name,
            Role = user.Role?.Name ?? "N/A",
        };
    }
    
    
    
    public async Task AddAsync(Teacher teacher) => await userRepository.AddAsync(teacher);
    
    public async Task SaveAsync() => await userRepository.SaveAsync();
    
}