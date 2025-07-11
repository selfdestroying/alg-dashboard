using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;
using alg_dashboard_server.Repositories;
using alg_dashboard_server.Services;
using Microsoft.AspNetCore.Mvc;

namespace alg_dashboard_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(UserService service)
    : BaseController<UserService, UserRepository, User, UserResponseDto, UserCreateDto,
        UserUpdateDto>(service)
{
}