using alg_dashboard_server.Models;

namespace alg_dashboard_server.Interfaces;

public interface IGroupRepository
{
    Task<List<Group>> GetAllAsync();
    Task<Group?> GetByIdAsync(int id);
}