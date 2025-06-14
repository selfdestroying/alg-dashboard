using alg_dashboard_server.Data;
using alg_dashboard_server.DTOs;
using alg_dashboard_server.Helpers;
using alg_dashboard_server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace alg_dashboard_server.Services;

public class AuthService(AppDbContext context, IConfiguration config)
{
    private readonly PasswordHasher<User> _passwordHasher = new();

    public async Task<string?> Register(RegisterDto dto)
    {
        if (await context.Users.AnyAsync(u => u.Username == dto.Username))
        {
            return null;
        }

        var userRole = await context.Roles.FirstAsync(r => r.Name == "User");

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            RoleId = userRole.Id
        };
        
        user.Password = _passwordHasher.HashPassword(user, dto.Password);

        context.Users.Add(user);
        await context.SaveChangesAsync();

        return "Registered";
    }

    public async Task<string?> Login(LoginDto dto)
    {
        var user = await context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Username == dto.Username);
        if (user == null) return null;
        
        var result = _passwordHasher.VerifyHashedPassword(user, user.Password, dto.Password);
        return result == PasswordVerificationResult.Failed ? null : JwtTokenHelper.GenerateToken(user, config);
    }
}