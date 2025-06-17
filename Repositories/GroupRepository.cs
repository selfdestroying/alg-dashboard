using alg_dashboard_server.Data;
using alg_dashboard_server.DTOs;
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

    public async Task AddAsync(Group group)
    {
        await context.Groups.AddAsync(group);
        await context.SaveChangesAsync();
    }

    public async Task UpdateAsync(int id, UpdateGroupDto group)
    {
        var groupFromDb = await context.Groups.FindAsync(id);
        if (groupFromDb == null) return;
        
        groupFromDb.Name = group.Name ?? groupFromDb.Name;
        groupFromDb.CourseId = group.CourseId ?? groupFromDb.CourseId;
        
        context.Groups.Update(groupFromDb);
        await context.SaveChangesAsync();
    }
    
    public async Task DeleteAsync(int id)
    {
        var groupFromDb = await context.Groups.FindAsync(id);
        if (groupFromDb == null) return;
        
        context.Groups.Remove(groupFromDb);
        await context.SaveChangesAsync();
    }

    public async Task SaveAsync()
    {
        await context.SaveChangesAsync();
    }

    public async Task AddToGroupAsync(int groupId, int studentId)
    {
        var studentGroup = new GroupStudent
        {
            GroupId = groupId,
            StudentId = studentId
        };
        context.GroupStudents.Add(studentGroup);
        await context.SaveChangesAsync();
    }
}