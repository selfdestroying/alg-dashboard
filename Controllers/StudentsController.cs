using alg_dashboard_server.Models;
using alg_dashboard_server.Services;
using Microsoft.AspNetCore.Mvc;

namespace alg_dashboard_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController(StudentService studentService): ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var students = await studentService.GetAllAsync();
        
        return Ok(students);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Student student)
    {
        await studentService.AddAsync(student);
        await studentService.SaveAsync();
        
        return CreatedAtAction(nameof(GetAll), new { id = student.Id }, student);
    }
}