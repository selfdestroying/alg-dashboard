using alg_dashboard_server.Data;
using alg_dashboard_server.Interfaces;
using alg_dashboard_server.Models;
using Microsoft.EntityFrameworkCore;

namespace alg_dashboard_server.Repositories;

public class StudentRepository(AppDbContext context): IStudentRepository
{
    public async Task<List<Student>> GetAllAsync()
    {
        return await context.Students.ToListAsync();
    }

    public async Task AddAsync(Student student)
    {
        await context.Students.AddAsync(student);
    }

    public async Task SaveAsync()
    {
        await context.SaveChangesAsync();
    }
}