using alg_dashboard_server.Data;
using alg_dashboard_server.DTOs;
using alg_dashboard_server.Helpers;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Teacher = alg_dashboard_server.Models.Teacher;

namespace alg_dashboard_server.Controllers;

[ApiController]
[Route("/api/[controller]")]
public class AuthController(AppDbContext context, IConfiguration config) : ControllerBase
{
    private readonly PasswordHasher<Teacher> _passwordHasher = new();

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto requestDto)
    {
        try
        {
            var user = await context.Teachers.Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Username == requestDto.Username);
            if (user == null) return BadRequest(new ErrorResponse<string>("Invalid username"));

            var result = _passwordHasher.VerifyHashedPassword(user, user.Password, requestDto.Password);
            return result == PasswordVerificationResult.Failed
                ? BadRequest(new ErrorResponse<string>("Invalid password"))
                : Ok(new SuccessResponse<LoginResponseDto>("Logged in",
                    new LoginResponseDto(JwtTokenHelper.GenerateToken(user, config))));
        }
        catch (Exception)
        {
            return StatusCode(500, new ErrorResponse<string>("Internal server error"));
        }
    }
}