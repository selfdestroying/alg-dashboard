using alg_dashboard_server.DTOs;
using alg_dashboard_server.Repositories;

namespace alg_dashboard_server.Services;

public class AttendanceService(AttendanceRepository repository)
{
    public async Task<bool> Update(AttendanceUpdateDto dto)
    {
        return await repository.Update(dto);
    }
}