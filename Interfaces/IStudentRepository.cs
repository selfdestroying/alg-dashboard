using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;

namespace alg_dashboard_server.Interfaces;

public interface IStudentRepository
{
    Task<List<Student>> GetAllAsync(int? groupId);
    Task<Student> AddAsync(StudentRequestDto studentResponse);
    Task<Student?> UpdateAsync(int id, UpdateStudentRequestDto student);
    Task<bool> DeleteAsync(int id);
}