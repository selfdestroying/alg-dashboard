using alg_dashboard_server.Data;
using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;
using Microsoft.EntityFrameworkCore;

namespace alg_dashboard_server.Repositories;

public class LessonRepository(AppDbContext context): BaseRepository<Lesson, LessonCreateDto, LessonUpdateDto>(context)
{
    // public async Task<List<Lesson>> GetAllLessons()
    // {
    //     return await Context.Lessons.ToListAsync();
    // }
    //
    // public async Task<Lesson?> AddAsync(Lesson lesson)
    // {
    //     var newLesson = await Context.Lessons.AddAsync(lesson);
    //     await Context.SaveChangesAsync();
    //     return newLesson.Entity;
    // }
    //
    // public async Task AddRangeAsync(List<Lesson> lessons)
    // {
    //     await Context.AddRangeAsync(lessons);
    //     await Context.SaveChangesAsync();
    // }
    //

    public override async Task<List<Lesson>> Get()
    {
        return await DbSet.OrderBy(l => l.Date).ThenBy(l => l.Time).ToListAsync();
    }


    protected override Lesson MapCreateDtoToEntity(LessonCreateDto entity)
    {
        return new Lesson
        {
            Date = entity.Date,
            Time = entity.Time,
            GroupId = entity.GroupId,
        };
    }

    protected override void MapUpdateDtoToEntity(Lesson entity, LessonUpdateDto dto)
    {
        entity.Date = dto.Date ?? entity.Date;
        entity.Time = dto.Time ?? entity.Time;
    }
}