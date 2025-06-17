using alg_dashboard_server.DTOs;
using alg_dashboard_server.Interfaces;
using alg_dashboard_server.Models;

namespace alg_dashboard_server.Services;

public class GroupService(IGroupRepository groupRepository)
{
    public async Task<List<GroupsDto>> GetAllAsync()
    {
        var groups = await groupRepository.GetAllAsync();
        return groups.Select(g => new GroupsDto
        {
            Id = g.Id,
            Name = g.Name,
            Course = g.Course?.Name ?? "N/A",
            Students = g.GroupStudents.Count,
        }).ToList();
    }

    public async Task<GroupDto?> GetByIdAsync(int id)
    {
        var group = await groupRepository.GetByIdAsync(id);
        if (group == null) return null;
        return new GroupDto
        {
            Id = group.Id,
            Name = group.Name,
            Course = group.Course?.Name ?? "N/A",
            Students = group.GroupStudents.Select(sg => new StudentDto
            {
                Id = sg.StudentId,
                Name = sg.Student?.Name ?? "N/A",
                Age = sg.Student?.Age ?? 0
            }).ToList(),
        };
    }

    public async Task AddAsync(Group group) => await groupRepository.AddAsync(group);
    public async Task UpdateAsync(int id, UpdateGroupDto group) => await groupRepository.UpdateAsync(id, group);
    public async Task DeleteAsync(int id) => await groupRepository.DeleteAsync(id);
    public async Task SaveAsync() => await groupRepository.SaveAsync();

    public async Task AddToGroupAsync(int groupId, int studentId) =>
        await groupRepository.AddToGroupAsync(groupId, studentId);
}