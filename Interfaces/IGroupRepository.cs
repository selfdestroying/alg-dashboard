using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;

namespace alg_dashboard_server.Interfaces;

public interface IGroupRepository
{
    Task<List<Group>> GetAllAsync();
    Task<Group?> GetByIdAsync(int id);
    Task AddAsync(Group group);
    Task DeleteAsync(int id);
    Task UpdateAsync(int id, UpdateGroupDto group);
    Task SaveAsync();
}