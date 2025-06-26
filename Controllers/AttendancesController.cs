using alg_dashboard_server.DTOs;
using alg_dashboard_server.Services;
using Microsoft.AspNetCore.Mvc;

namespace alg_dashboard_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AttendancesController(AttendanceService service, IConfiguration config) : ControllerBase
{
    [HttpPut]
    public async Task<IActionResult> Update([FromBody] AttendanceUpdateDto attendance)
    {
        try
        {
            var ok = await service.Update(attendance);
            if (!ok)
            {
                return BadRequest(new ErrorResponse("Failed to update attendance"));
            }

            return Ok(new SuccessResponse<object>("Successfully updated", new { }));
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return StatusCode(500, new ErrorResponse(e.Message));
        }
    }
}