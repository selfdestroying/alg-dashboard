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
    
}