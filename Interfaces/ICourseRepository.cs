using alg_dashboard_server.Models;

namespace alg_dashboard_server.Interfaces;

public interface ICourseRepository
{
    Task<List<Course>> GetAllAsync();
}