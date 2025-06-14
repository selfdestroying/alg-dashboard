using alg_dashboard_server.Models;

namespace alg_dashboard_server.Repositories;

public interface IStudentRepository
{
    Task<List<Student>> GetAllAsync();
}