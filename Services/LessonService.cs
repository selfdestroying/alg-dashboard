using alg_dashboard_server.DTOs;
using alg_dashboard_server.Interfaces;

namespace alg_dashboard_server.Services;

public class LessonService(ILessonRepository lessonRepository)
{
    public async Task<bool> UpdateAttendance(int id, List<AttendanceResponseDto> attendance)
    {
        return await lessonRepository.UpdateAttendance(id, attendance);
    }
}