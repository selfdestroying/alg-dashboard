using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;

namespace alg_dashboard_server.Interfaces;

public interface IGroupRepository
{
    Task<List<Group>> GetAllAsync();
    Task<Group?> GetByIdAsync(int id);
    Task<Group?> AddAsync(GroupRequestDto group);
    Task<Group?> UpdateAsync(int id, UpdateGroupRequestDto groupRequest);
    Task<bool> DeleteAsync(int id);
    
    Task<bool> AddStudentAsync(EditStudentInGroupRequestDto requestDto);
    Task<bool> RemoveStudentAsync(EditStudentInGroupRequestDto requestDto);
}