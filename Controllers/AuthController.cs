using alg_dashboard_server.DTOs;
using alg_dashboard_server.Services;
using Microsoft.AspNetCore.Mvc;

namespace alg_dashboard_server.Controllers;

[ApiController]
[Route("/api/[controller]")]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var result = await authService.Register(dto);
        if (result == null) return BadRequest("Username already exists");
        return Ok("User created");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
       var token = await authService.Login(dto);
       if (token == null) return BadRequest("Invalid username or password");
       Response.Cookies.Append("token", token, new CookieOptions
       {
           HttpOnly = true,
           SameSite = SameSiteMode.Strict,
           Expires = DateTimeOffset.Now.AddDays(7)
       });
        return Ok(new { token });
    }


    
}