using alg_dashboard_server.Models;
using alg_dashboard_server.Services;
using Microsoft.AspNetCore.Mvc;

namespace alg_dashboard_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeachersController(TeacherService teacherService): ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await teacherService.GetAllAsync();
        return Ok(users);
    }
    
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await teacherService.GetByIdAsync(id);
        if (user == null) return NotFound();
        return Ok(user);
    }
    
    [HttpPost]
    public async Task<IActionResult> Create(Teacher teacher)
    {
        await teacherService.AddAsync(teacher);
        await teacherService.SaveAsync();
        return CreatedAtAction(nameof(GetAll), new { id = teacher.Id }, teacher);
    }
}