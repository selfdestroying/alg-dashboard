using alg_dashboard_server.Data;
using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;
using Microsoft.EntityFrameworkCore;

namespace alg_dashboard_server.Repositories;

public class UserRepository(AppDbContext context) : BaseRepository<User, UserCreateDto, UserUpdateDto>(context)
{
    public override async Task<List<User>> Get()
    {
        return await DbSet.Include(u => u.Role).ToListAsync();
    }

    protected override User MapCreateDtoToEntity(UserCreateDto entity)
    {
        return new User
        {
            Name = entity.Name,
            RoleId = entity.RoleId,
            Password = entity.Password
        };
    }

    protected override void MapUpdateDtoToEntity(User entity, UserUpdateDto dto)
    {
        entity.Name = dto.Name ?? entity.Name;
        entity.RoleId = dto.RoleId ?? entity.RoleId;
        entity.Password = dto.Password ?? entity.Password;
    }
}