using alg_dashboard_server.Data;
using alg_dashboard_server.Interfaces;
using alg_dashboard_server.Models;
using Microsoft.EntityFrameworkCore;

namespace alg_dashboard_server.Repositories;

public class GroupRepository(AppDbContext context): IGroupRepository
{
    public async Task<List<Group>> GetAllAsync()
    {
        return await context.Groups.Include(c => c.Course).Include(g => g.GroupStudents).ThenInclude(sg => sg.Student).ToListAsync();
    }

    public async Task<Group?> GetByIdAsync(int id)
    {
        return await context.Groups.Include(c => c.Course).Include(g => g.GroupStudents).ThenInclude(sg => sg.Student)
            .FirstAsync(g => g.Id == id);
    }
}