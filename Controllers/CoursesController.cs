using alg_dashboard_server.Data;
using alg_dashboard_server.Models;
using alg_dashboard_server.Services;
using Microsoft.AspNetCore.Mvc;

namespace alg_dashboard_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController(CourseService courseService): ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAllAsync()
    {
        var courses = await courseService.GetAllAsync();
        return Ok(courses);
    }
}