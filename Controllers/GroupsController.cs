using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;
using alg_dashboard_server.Services;
using Microsoft.AspNetCore.Mvc;

namespace alg_dashboard_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GroupsController(GroupService groupService): ControllerBase
{

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var groups = await groupService.GetAllAsync();
        return Ok(groups);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var group = await groupService.GetByIdAsync(id);
        return Ok(group);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Group group)
    {
        await groupService.AddAsync(group);
        return CreatedAtAction(nameof(GetAll), new { id = group.Id }, group);
    }

    [HttpPost("add-to-group")]
    public async Task<IActionResult> AddToGroup(AddToGroupDto addToGroupDto)
    {
        await groupService.AddToGroupAsync(addToGroupDto.GroupId, addToGroupDto.StudentId);
        return Ok();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateGroupDto group)
    {
        await groupService.UpdateAsync(id, group);
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await groupService.DeleteAsync(id);
        return Ok();
    }
    
}