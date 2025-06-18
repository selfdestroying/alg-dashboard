using alg_dashboard_server.Data;
using alg_dashboard_server.Interfaces;
using alg_dashboard_server.Models;
using Microsoft.EntityFrameworkCore;

namespace alg_dashboard_server.Repositories;

public class UserRepository(AppDbContext context) : IUserRepository
{
    public async Task<List<Teacher>> GetAllAsync()
    {
        return await context.Teachers.Include(r => r.Role).ToListAsync();
    }

    public async Task<Teacher?> GetByIdAsync(int id)
    {
        return await context.Teachers.Include(r => r.Role).FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<Teacher?> GetByUsernameAsync(string username)
    {
        return await context.Teachers.Include(r => r.Role).FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task AddAsync(Teacher teacher)
    {
        await context.Teachers.AddAsync(teacher);
    }

    public async Task SaveAsync()
    {
        await context.SaveChangesAsync();
    }
}