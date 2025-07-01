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
            new Claim("id", teacher.Id.ToString()),
            new Claim("name", teacher.Name),
            new Claim("role", teacher.Role.Name),
        };
        
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expirationHours = config["Jwt:ExpirationHours"];
        
        var expires = DateTime.Now.AddHours(expirationHours != null ? int.Parse(expirationHours) : 1);
        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Issuer"],
            claims: claims,
            expires: expires,
            signingCredentials: credentials
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}