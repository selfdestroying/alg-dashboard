using alg_dashboard_server.Data;
using alg_dashboard_server.Models;
using Microsoft.EntityFrameworkCore;

namespace alg_dashboard_server.Repositories;

public class StudentRepository(AppDbContext context): IStudentRepository
{
    public async Task<List<Student>> GetAllAsync()
    {
        return await context.Students.ToListAsync();
    }
}