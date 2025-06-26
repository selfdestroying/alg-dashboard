using alg_dashboard_server.DTOs;
using alg_dashboard_server.Services;
using Microsoft.AspNetCore.Mvc;

namespace alg_dashboard_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LessonsController(LessonService lessonService): ControllerBase
{
    
    
}