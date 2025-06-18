using alg_dashboard_server.Models;

namespace alg_dashboard_server.Interfaces;

public interface IUserRepository
{
    Task<List<Teacher>> GetAllAsync();
    Task<Teacher?> GetByIdAsync(int id);
    Task<Teacher?> GetByUsernameAsync(string username);
    Task AddAsync(Teacher teacher);
    Task SaveAsync();
}