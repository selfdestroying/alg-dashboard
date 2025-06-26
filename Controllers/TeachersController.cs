using alg_dashboard_server.DTOs;
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
        var users = await teacherService.GetAll();
        return Ok(users);
    }
    
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await teacherService.GetById(id);
        if (user == null) return NotFound();
        return Ok(user);
    }
    
    [HttpPost]
    public async Task<IActionResult> Create(TeacherCreateDto teacher)
    {
        await teacherService.Create(teacher);
        return Ok();
    }
}