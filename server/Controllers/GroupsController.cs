using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;
using alg_dashboard_server.Repositories;
using alg_dashboard_server.Services;
using Microsoft.AspNetCore.Mvc;

namespace alg_dashboard_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GroupsController(GroupService service) : BaseController<GroupService, GroupRepository, Group, GroupResponseDto, GroupCreateDto, GroupUpdateDto>(service)
{
    [HttpPost("add-student")]
    public async Task<IActionResult> AddStudent([FromBody] EditStudentInGroupRequestDto requestDto)
    {
        try
        {
            var ok = await Service.AddStudent(requestDto);
            if (!ok)
                return NotFound(new ErrorResponse("Group or student not found or student already in group"));
            return Ok(new SuccessResponse<object>("Student has been added to the group", new { }));
        }
        catch (Exception)
        {
            return StatusCode(500, new ErrorResponse("Internal server error"));
        }
    }

    [HttpDelete("remove-student")]
    public async Task<IActionResult> RemoveStudent([FromBody] EditStudentInGroupRequestDto requestDto)
    {
        try
        {
            var ok = await Service.RemoveStudent(requestDto);
            if (!ok) return NotFound(new ErrorResponse("Student has not been added to the group"));
            return Ok(new SuccessResponse<object>("Student has been removed from the group", new { }));
        }
        catch (Exception)
        {
            return StatusCode(500, new ErrorResponse("Internal server error"));
        }
    }
}