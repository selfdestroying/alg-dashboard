using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;

namespace alg_dashboard_server.Interfaces;

public interface IStudentRepository
{
    Task<List<Student>> GetAllAsync(int? groupId);
    Task AddAsync(Student student);
    Task UpdateAsync(int id, UpdateStudentDto student);
    Task DeleteAsync(int id);
    Task SaveAsync();
}