using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using alg_dashboard_server.Models;
using Microsoft.IdentityModel.Tokens;

namespace alg_dashboard_server.Helpers;

public static class JwtTokenHelper
{
    public static string GenerateToken(Teacher teacher, IConfiguration config)
    {
        var claims = new[]
        {
            new Claim("username", teacher.Username),
            new Claim("role", teacher.Role!.Name),
        };
        
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Issuer"],
            claims: claims,
            expires: DateTime.Now.AddMinutes(120),
            signingCredentials: credentials
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}