using alg_dashboard_server.Data;
using alg_dashboard_server.DTOs;
using alg_dashboard_server.Interfaces;
using alg_dashboard_server.Models;
using Microsoft.EntityFrameworkCore;

namespace alg_dashboard_server.Repositories;

public class LessonRepository(AppDbContext context): ILessonRepository
{
    public async Task<List<Lesson>> GetAllLessons()
    {
        return await context.Lessons.ToListAsync();
    }

    public async Task<Lesson?> AddAsync(Lesson lesson)
    {
        var newLesson = await context.Lessons.AddAsync(lesson);
        await context.SaveChangesAsync();
        return newLesson.Entity;
    }

    public async Task AddRangeAsync(List<Lesson> lessons)
    {
        await context.AddRangeAsync(lessons);
        await context.SaveChangesAsync();
    }

    public async Task<bool> UpdateAttendance(int id, List<AttendanceResponseDto> attendance)
    {
        var attendancesFromDb = await context.Attendances.Where(a => a.LessonId == id).ToListAsync();
        var newAttendances = attendancesFromDb.Select(a =>
        {
            var attendanceExists = attendance.Find(at => at.StudentId == a.StudentId);
            if (attendanceExists != null)
            {
                a.WasPresent = attendanceExists.WasPresent;
            }
            return a;
        });
        context.Attendances.UpdateRange(newAttendances);
        await context.SaveChangesAsync();
        
        return true;

    }
}