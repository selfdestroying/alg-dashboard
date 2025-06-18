using alg_dashboard_server.DTOs;
using alg_dashboard_server.Interfaces;
using alg_dashboard_server.Models;

namespace alg_dashboard_server.Services;

public class GroupService(IGroupRepository groupRepository)
{
    public async Task<List<GroupResponseDto>> GetAllAsync()
    {
        var groups = await groupRepository.GetAllAsync();
        return groups.Select(g => new GroupResponseDto
        {
            Id = g.Id,
            Name = g.Name,
            Course = g.Course.Name,
            Students = g.GroupStudents.Select(gs => new StudentResponseDto
            {
                Id = gs.Student.Id,
                Name = gs.Student.Name,
                Age = gs.Student.Age,
            }).ToList(),
        }).ToList();
    }

    public async Task<GroupResponseDto?> GetByIdAsync(int id)
    {
        var group = await groupRepository.GetByIdAsync(id);
        if (group == null) return null;
        return new GroupResponseDto
        {
            Id = group.Id,
            Name = group.Name,
            Course = group.Course.Name,
            Students = group.GroupStudents.Select(sg => new StudentResponseDto
            {
                Id = sg.StudentId,
                Name = sg.Student.Name,
                Age = sg.Student.Age
            }).ToList(),
        };
    }

    public async Task<GroupResponseDto?> AddAsync(GroupRequestDto group) {
        var newGroup = await groupRepository.AddAsync(group);
        if (newGroup == null) return null;
        
        return new GroupResponseDto
        {
            Id = newGroup.Id,
            Name = newGroup.Name,
            Course = "",
            Students = []
        };
    }
    public async Task<GroupResponseDto?> UpdateAsync(int id, UpdateGroupRequestDto groupRequest) {
        var updatedGroup = await groupRepository.UpdateAsync(id, groupRequest);
        if (updatedGroup == null) return null;

        return new GroupResponseDto
        {
            Id = updatedGroup.Id,
            Name = updatedGroup.Name,
            Course = "",
            Students = []
        };
    }
    public async Task<bool> DeleteAsync(int id) => await groupRepository.DeleteAsync(id);

    public async Task<bool> AddToGroupAsync(EditStudentInGroupRequestDto requestDto) =>
        await groupRepository.AddStudentAsync(requestDto);
    public async Task<bool> RemoveStudentAsync(EditStudentInGroupRequestDto requestDto) => await groupRepository.RemoveStudentAsync(requestDto);
}