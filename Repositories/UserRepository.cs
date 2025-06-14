using alg_dashboard_server.Data;
using alg_dashboard_server.Models;
using Microsoft.EntityFrameworkCore;

namespace alg_dashboard_server.Repositories;

public class UserRepository(AppDbContext context) : IUserRepository
{
    public async Task<List<User>> GetAllAsync()
    {
        return await context.Users.Include(r => r.Role).ToListAsync();
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await context.Users.Include(r => r.Role).FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await context.Users.Include(r => r.Role).FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task AddAsync(User user)
    {
        await context.Users.AddAsync(user);
    }

    public async Task SaveAsync()
    {
        await context.SaveChangesAsync();
    }
}