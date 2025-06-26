using alg_dashboard_server.Data;
using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;
using Microsoft.EntityFrameworkCore;
using Attendance = alg_dashboard_server.Models.Attendance;

namespace alg_dashboard_server.Repositories;

public class GroupRepository(AppDbContext context) : BaseRepository<Group, GroupCreateDto, GroupUpdateDto> (context)
{
    public override async Task<List<Group>> Get()
    {
        return await DbSet.Include(g => g.GroupStudents).ThenInclude(gs => gs.Student).Include(g => g.Course).Include(g => g.Teacher).ToListAsync();
    }

    public override async Task<Group?> Get(int id)
    {
        return await context.Groups.Include(c => c.Course).Include(t => t.Teacher).Include(l => l.Lessons)
            .ThenInclude(a => a.Attendances)
            .Include(g => g.GroupStudents)
            .ThenInclude(sg => sg.Student)
            .FirstOrDefaultAsync(g => g.Id == id);
    }

    protected override Group MapCreateDtoToEntity(GroupCreateDto entity)
    {
        return new Group
        {
            Name = entity.Name,
            CourseId = entity.CourseId,
            TeacherId = entity.TeacherId,
            StartDate = entity.StartDate,
            LessonTime = entity.LessonTime,
            LessonDay = entity.StartDate.DayOfWeek
        };
    }

    public async Task<bool> AddStudent(EditStudentInGroupRequestDto requestDto)
    {
        var groupExists = await Context.Groups.AnyAsync(g => g.Id == requestDto.GroupId);
        var studentExists = await Context.Students.AnyAsync(s => s.Id == requestDto.StudentId);
        var groupStudentsExist = await Context.GroupStudents.AnyAsync(gs =>
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
        await Context.GroupStudents.AddAsync(studentGroup);

        var lessons = await Context.Lessons.Where(l => l.GroupId == requestDto.GroupId).ToListAsync();
        var attendances = lessons.Select(l => new Attendance
        {
            StudentId = requestDto.StudentId,
            LessonId = l.Id,
            WasPresent = false
        }).ToList();
        await Context.Attendances.AddRangeAsync(attendances);
        await Context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveStudent(EditStudentInGroupRequestDto requestDto)
    {
        var groupStudentFromDb = await Context.GroupStudents.FindAsync(requestDto.GroupId, requestDto.StudentId);
        if (groupStudentFromDb == null) return false;
        var attendances = Context.Attendances.Where(a => a.StudentId == requestDto.StudentId).ToList();
        Context.Attendances.RemoveRange(attendances);
        Context.GroupStudents.Remove(groupStudentFromDb);
        await Context.SaveChangesAsync();
        return true;
    }
    protected override void MapUpdateDtoToEntity(Group entity, GroupUpdateDto dto)
    {
        entity.Name = dto.Name ?? entity.Name;
        entity.CourseId = dto.CourseId ?? entity.CourseId;
        entity.TeacherId = dto.TeacherId ?? entity.TeacherId;
        entity.StartDate = dto.StartDate ?? entity.StartDate;
        entity.LessonTime = dto.LessonTime ?? entity.LessonTime;
        
    }
}