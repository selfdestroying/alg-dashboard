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
        return await context.Groups.Include(c => c.Course).Include(g => g.GroupStudents).ThenInclude(gs => gs.Student).ToListAsync();
    }

    public async Task<Group?> GetByIdAsync(int id)
    {
        return await context.Groups.Include(c => c.Course).Include(g => g.GroupStudents).ThenInclude(sg => sg.Student)
            .FirstOrDefaultAsync(g => g.Id == id);
    }

    public async Task<Group?> AddAsync(GroupRequestDto group)
    {
        var courseExists = await context.Courses.AnyAsync(c => c.Id == group.CourseId);
        if (!courseExists)
        {
            return null;
        }

        var newGroup = await context.Groups.AddAsync(new Group
        {
            Name = group.Name,
            CourseId = group.CourseId,
        });
        
        await context.SaveChangesAsync();
        return newGroup.Entity;
    }

    public async Task<Group?> UpdateAsync(int id, UpdateGroupRequestDto group)
    {
        var courseExists = await context.Courses.AnyAsync(c => c.Id == group.CourseId);
        if (!courseExists)
        {
            return null;
        }
        
        var groupFromDb = await context.Groups.FindAsync(id);
        if (groupFromDb == null) return null;
        
        groupFromDb.Name = group.Name ?? groupFromDb.Name;
        groupFromDb.CourseId = group.CourseId ?? groupFromDb.CourseId;
        
        context.Groups.Update(groupFromDb);
        await context.SaveChangesAsync();
        return groupFromDb;
    }
    
    public async Task<bool> DeleteAsync(int id)
    {
        var groupFromDb = await context.Groups.FindAsync(id);
        if (groupFromDb == null) return false;
        
        context.Groups.Remove(groupFromDb);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AddStudentAsync(EditStudentInGroupRequestDto requestDto)
    {
        var groupExists = await context.Groups.AnyAsync(g => g.Id == requestDto.GroupId);
        var studentExists = await context.Students.AnyAsync(s => s.Id == requestDto.StudentId);
        var groupStudentsExist = await context.GroupStudents.AnyAsync(gs => gs.GroupId == requestDto.GroupId && gs.StudentId == requestDto.StudentId);
        if (!groupExists || !studentExists || groupStudentsExist)
        {
            return false;
        }
        var studentGroup = new GroupStudent
        {
            GroupId = requestDto.GroupId,
            StudentId = requestDto.StudentId
        };
        context.GroupStudents.Add(studentGroup);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveStudentAsync(EditStudentInGroupRequestDto requestDto)
    {
        var groupStudentFromDb = await context.GroupStudents.FindAsync(requestDto.GroupId, requestDto.StudentId);
        if (groupStudentFromDb == null) return false;
        
        context.GroupStudents.Remove(groupStudentFromDb);
        await context.SaveChangesAsync();
        return true;
    }
}