using alg_dashboard_server.Data;
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
}