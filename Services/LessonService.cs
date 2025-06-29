using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;
using alg_dashboard_server.Repositories;

namespace alg_dashboard_server.Services;

public class LessonService(LessonRepository repository, GroupRepository groupRepository, AttendanceRepository attendanceRepository)
    : BaseService<LessonRepository, Lesson, LessonResponseDto, LessonCreateDto, LessonUpdateDto>(repository)
{
    public override async Task<bool> Create(LessonCreateDto dto)
    {
        var lesson = await Repository.Create(dto);
        if (lesson == null) return false;
        var group = await groupRepository.Get(dto.GroupId);
        if (group == null) return false;


        foreach (var attendanceDto in group.GroupStudents.Select(gs => new AttendanceCreateDto
                 {
                     LessonId = lesson.Id,
                     StudentId = gs.StudentId,
                     Status = 0,
                     Comment = ""
                 }))
        {
            await attendanceRepository.Create(attendanceDto);
        }
        
        return true;
    }

    protected override LessonResponseDto MapEntityToResponseDto(Lesson entity)
    {
        return new LessonResponseDto
        {
            Id = entity.Id,
            Date = entity.Date,
            Time = entity.Time,
            GroupId = entity.GroupId,
            Attendances = []
        };
    }
}