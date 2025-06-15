using alg_dashboard_server.DTOs;
using alg_dashboard_server.Interfaces;
using alg_dashboard_server.Models;
using alg_dashboard_server.Repositories;

namespace alg_dashboard_server.Services;

public class UserService(IUserRepository userRepository)
{
    public async Task<List<UserDto>> GetAllAsync()
    {
        var users = await userRepository.GetAllAsync();
        return users.Select(u => new UserDto
        {
            Id = u.Id,
            Username = u.Username,
            Role = u.Role?.Name ?? "N/A",
        }).ToList();
    }

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var user = await userRepository.GetByIdAsync(id);
        if (user == null) return null;
        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Role = user.Role?.Name ?? "N/A",
        };
    }
    
    
    
    public async Task AddAsync(User user) => await userRepository.AddAsync(user);
    
    public async Task SaveAsync() => await userRepository.SaveAsync();
    
}