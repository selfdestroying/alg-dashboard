using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;
using alg_dashboard_server.Repositories;

namespace alg_dashboard_server.Services;

public class UserService(UserRepository repository): BaseService<UserRepository, User, UserResponseDto, UserCreateDto, UserUpdateDto>(repository)
{
    protected override UserResponseDto MapEntityToResponseDto(User entity)
    {
        return new UserResponseDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Role = new Role
            {
                Id = entity.Role.Id,
                Name = entity.Role.Name,
                PasswordRequired = entity.Role.PasswordRequired
            },
        };
    }
}