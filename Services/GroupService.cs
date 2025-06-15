using alg_dashboard_server.DTOs;
using alg_dashboard_server.Interfaces;

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
}