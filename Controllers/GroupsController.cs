using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;
using alg_dashboard_server.Services;
using Microsoft.AspNetCore.Mvc;

namespace alg_dashboard_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GroupsController(GroupService groupService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var groups = await groupService.GetAllAsync();
            return Ok(new SuccessResponse<List<GroupResponseDto>>("", groups));
        }
        catch (Exception e)
        {
            return StatusCode(500, new ErrorResponse<string>(e.Message));
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        try
        {
            var group = await groupService.GetByIdAsync(id);
            if (group == null) return NotFound(new ErrorResponse<string>("Group not found"));
            return Ok(new SuccessResponse<GroupResponseDto>("", group));
        }
        catch (Exception e)
        {
            return StatusCode(500, new ErrorResponse<string>(e.Message));
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] GroupRequestDto group)
    {
        try
        {
            var newGroup = await groupService.AddAsync(group);
            if (newGroup == null) return NotFound(new ErrorResponse<string>("Course not found"));
            return Ok(new SuccessResponse<GroupResponseDto>("Group has been successfully added", newGroup));
        }
        catch (Exception)
        {
            return StatusCode(500, new ErrorResponse<string>("Internal server error"));
        }
    }

    [HttpPost("add-student")]
    public async Task<IActionResult> AddStudent([FromBody] EditStudentInGroupRequestDto requestDto)
    {
        try
        {
            var ok = await groupService.AddToGroupAsync(requestDto);
            if (!ok)
                return NotFound(new ErrorResponse<string>("Group or student not found or student already in group"));
            return Ok(new SuccessResponse<object>("Student has been added to the group", new { }));
        }
        catch (Exception)
        {
            return StatusCode(500, new ErrorResponse<string>("Internal server error"));
        }
    }

    [HttpDelete("remove-student")]
    public async Task<IActionResult> RemoveStudent([FromBody] EditStudentInGroupRequestDto requestDto)
    {
        // try
        // {
        var ok = await groupService.RemoveStudentAsync(requestDto);
        if (!ok) return NotFound(new ErrorResponse<string>("Student has not been added to the group"));
        return Ok(new SuccessResponse<object>("Student has been removed from the group", new { }));
        // }
        // catch (Exception)
        // {
        //     return StatusCode(500, new ErrorResponse<string>("Internal server error"));
        // }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateGroupRequestDto group)
    {
        try
        {
            var updatedGroup = await groupService.UpdateAsync(id, group);
            if (updatedGroup == null) return NotFound(new ErrorResponse<string>("Group or course not found"));
            return Ok(new SuccessResponse<GroupResponseDto>("Group has been updated successfully", updatedGroup));
        }
        catch (Exception)
        {
            return StatusCode(500, new ErrorResponse<string>("Internal server error"));
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        try
        {
            var ok = await groupService.DeleteAsync(id);
            if (!ok) return NotFound(new ErrorResponse<string>("Group not found"));
            return Ok(new SuccessResponse<object>("Group has been deleted successfully", new { }));
        }
        catch (Exception)
        {
            return StatusCode(500, new ErrorResponse<string>("Internal server error"));
        }
    }
}