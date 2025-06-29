using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;
using alg_dashboard_server.Repositories;

namespace alg_dashboard_server.Services;

public class AttendanceService(AttendanceRepository repository)
    : BaseService<AttendanceRepository, Attendance, AttendanceResponseDto, AttendanceCreateDto, AttendanceUpdateDto>(repository)
{
    public override async Task<bool> Update(int id, AttendanceUpdateDto dto)
    {
        return await Repository.Update(dto);
    }

    protected override AttendanceResponseDto MapEntityToResponseDto(Attendance entity)
    {
        return new AttendanceResponseDto
        {
            StudentId = entity.StudentId,
            Status = entity.Status,
            Comment = entity.Comment,
            LessonId = entity.LessonId,
            Student = "",
        };
    }
}