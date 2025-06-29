using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;
using alg_dashboard_server.Repositories;
using alg_dashboard_server.Services;
using Microsoft.AspNetCore.Mvc;

namespace alg_dashboard_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LessonsController(LessonService service)
    : BaseController<LessonService, LessonRepository, Lesson, LessonResponseDto, LessonCreateDto, LessonUpdateDto>(
        service)
{
}