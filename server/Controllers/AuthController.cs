using alg_dashboard_server.Data;
using alg_dashboard_server.DTOs;
using alg_dashboard_server.Helpers;
using alg_dashboard_server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace alg_dashboard_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext context, IConfiguration config) : ControllerBase
{
    private readonly PasswordHasher<Teacher> _passwordHasher = new();

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AuthRequestDto requestDto)
    {
        try
        {
            var user = await context.Teachers.Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Name == requestDto.Name);
            if (user == null) return BadRequest(new ErrorResponse("Invalid username"));

            var result = _passwordHasher.VerifyHashedPassword(user, user.Password, requestDto.Password);
            return result == PasswordVerificationResult.Failed
                ? BadRequest(new ErrorResponse("Invalid password"))
                : Ok(new SuccessResponse<AuthResponseDto>("Logged in",
                    new AuthResponseDto(JwtTokenHelper.GenerateToken(user, config))));
        }
        catch (Exception)
        {
            return StatusCode(500, new ErrorResponse("Internal server error"));
        }
    }
}