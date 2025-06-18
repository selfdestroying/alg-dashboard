using alg_dashboard_server.DTOs;
using alg_dashboard_server.Interfaces;
using alg_dashboard_server.Models;

namespace alg_dashboard_server.Services;

public class StudentService(IStudentRepository studentRepository)
{
    public async Task<List<StudentResponseDto>> GetAllAsync(int? groupId)
    {
        var students = await studentRepository.GetAllAsync(groupId);
        return students.Select(s => new StudentResponseDto
        {
            Id = s.Id,
            Name = s.Name,
            Age = s.Age
        }).ToList();
    }
    
    public async Task<StudentResponseDto> AddAsync(StudentRequestDto student)
    {
        var newStudent = await studentRepository.AddAsync(student);
        return new StudentResponseDto
        {
            Id = newStudent.Id,
            Name = newStudent.Name,
            Age = newStudent.Age
        };
    }
    
    public async Task<UpdateStudentResponseDto?> UpdateAsync(int id, UpdateStudentRequestDto student)
    {
        var updatedStudent = await studentRepository.UpdateAsync(id, student);
        if (updatedStudent == null) return null;
        return new UpdateStudentResponseDto
        {
            Id = updatedStudent.Id,
            Name = updatedStudent.Name,
            Age = updatedStudent.Age
        };
    }
    public async Task<bool> DeleteAsync(int id) => await studentRepository.DeleteAsync(id);
}