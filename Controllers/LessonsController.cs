using alg_dashboard_server.DTOs;
using alg_dashboard_server.Services;
using Microsoft.AspNetCore.Mvc;

namespace alg_dashboard_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LessonsController(LessonService lessonService): ControllerBase
{
    [HttpPut("{id}/attendance")]
    public async Task<IActionResult> UpdateAttendance([FromRoute] int id,
        [FromBody] List<AttendanceResponseDto> attendance)
    {
        try
        {
            var ok = await lessonService.UpdateAttendance(id, attendance);
            if (ok)
            {
                return Ok(new SuccessResponse<object>("Successfully updated", new {}));
            }
            return BadRequest(new ErrorResponse<string>("Failed to update attendance"));

        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return StatusCode(500, new ErrorResponse<string>(e.Message));
        }
        
    }
    
}