using alg_dashboard_server.Data;
using alg_dashboard_server.DTOs;
using alg_dashboard_server.Interfaces;
using alg_dashboard_server.Models;
using Microsoft.EntityFrameworkCore;

namespace alg_dashboard_server.Repositories;

public class GroupRepository(AppDbContext context) : IGroupRepository
{
    public async Task<List<Group>> GetAllAsync()
    {
        return await context.Groups.Include(c => c.Course).Include(t => t.Teacher).Include(l => l.Lessons)
            .ThenInclude(a => a.Attendances)
            .Include(g => g.GroupStudents)
            .ThenInclude(gs => gs.Student).ToListAsync();
    }

    public async Task<Group?> GetByIdAsync(int id)
    {
        return await context.Groups.Include(c => c.Course).Include(t => t.Teacher).Include(l => l.Lessons)
            .ThenInclude(a => a.Attendances)
            .Include(g => g.GroupStudents)
            .ThenInclude(sg => sg.Student)
            .FirstOrDefaultAsync(g => g.Id == id);
    }

    public async Task<Group?> AddAsync(GroupRequestDto group)
    {
        var courseExists = await context.Courses.AnyAsync(c => c.Id == group.CourseId);
        if (!courseExists)
        {
            return null;
        }

        var lessonDay = group.StartDate.DayOfWeek;
        var newGroup = await context.Groups.AddAsync(new Group
        {
            Name = group.Name,
            CourseId = group.CourseId,
            TeacherId = group.TeacherId,
            StartDate = group.StartDate,
            LessonDay = lessonDay,
            LessonTime = group.LessonTime,
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
        groupFromDb.TeacherId = group.TeacherId ?? groupFromDb.TeacherId;
        groupFromDb.LessonTime = group.LessonTime ?? groupFromDb.LessonTime;
        if (group.StartDate != null)
        {
            groupFromDb.StartDate = group.StartDate ?? groupFromDb.StartDate;
            groupFromDb.LessonDay = group.StartDate!.Value.DayOfWeek;
        }


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
        var groupStudentsExist = await context.GroupStudents.AnyAsync(gs =>
            gs.GroupId == requestDto.GroupId && gs.StudentId == requestDto.StudentId);
        if (!groupExists || !studentExists || groupStudentsExist)
        {
            return false;
        }
        var studentGroup = new GroupStudent
        {
            GroupId = requestDto.GroupId,
            StudentId = requestDto.StudentId
        };
        await context.GroupStudents.AddAsync(studentGroup);

        var lessons = await context.Lessons.Where(l => l.GroupId == requestDto.GroupId).ToListAsync();
        var attendances = lessons.Select(l => new Attendance
        {
            StudentId = requestDto.StudentId,
            LessonId = l.Id,
            WasPresent = false
        }).ToList();
        await context.Attendances.AddRangeAsync(attendances);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveStudentAsync(EditStudentInGroupRequestDto requestDto)
    {
        var groupStudentFromDb = await context.GroupStudents.FindAsync(requestDto.GroupId, requestDto.StudentId);
        if (groupStudentFromDb == null) return false;
        var attendances = context.Attendances.Where(a => a.StudentId == requestDto.StudentId).ToList();
        context.Attendances.RemoveRange(attendances);
        context.GroupStudents.Remove(groupStudentFromDb);
        await context.SaveChangesAsync();
        return true;
    }
}