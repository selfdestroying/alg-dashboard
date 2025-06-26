using alg_dashboard_server.DTOs;
using alg_dashboard_server.Repositories;

namespace alg_dashboard_server.Services;

public class StudentService(StudentRepository studentRepository)
{
    public async Task<List<StudentResponseDto>> GetAll(int? groupId)
    {
        var students = groupId.HasValue
            ? await studentRepository.GetExcludeGroup(groupId.Value)
            : await studentRepository.Get();
        return students.Select(s => new StudentResponseDto
        {
            Id = s.Id,
            Name = s.Name,
            Age = s.Age
        }).ToList();
    }

    public async Task<bool> Create(StudentCreateDto student)
    {
        var newStudent = await studentRepository.Create(student);
        return newStudent != null;
    }

    public async Task<bool> Update(int id, StudentUpdateDto student) =>
        await studentRepository.Update(id, student);

    public async Task<bool> Delete(int id) => await studentRepository.Delete(id);
}