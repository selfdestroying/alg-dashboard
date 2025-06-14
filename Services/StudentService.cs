using alg_dashboard_server.Models;
using alg_dashboard_server.Repositories;

namespace alg_dashboard_server.Services;

public class StudentService(IStudentRepository studentRepository)
{
    public async Task<List<Student>> GetAllAsync()
    {
        var students = await studentRepository.GetAllAsync();
        return students;
    }
    
    
}