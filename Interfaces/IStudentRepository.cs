using alg_dashboard_server.Models;

namespace alg_dashboard_server.Interfaces;

public interface IStudentRepository
{
    Task<List<Student>> GetAllAsync();
    Task AddAsync(Student student);
    Task SaveAsync();
}