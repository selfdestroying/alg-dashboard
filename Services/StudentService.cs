using alg_dashboard_server.DTOs;
using alg_dashboard_server.Interfaces;
using alg_dashboard_server.Models;
using alg_dashboard_server.Repositories;

namespace alg_dashboard_server.Services;

public class StudentService(IStudentRepository studentRepository)
{
    public async Task<List<StudentDto>> GetAllAsync()
    {
        var students = await studentRepository.GetAllAsync();
        return students.Select(s => new StudentDto
        {
            Id = s.Id,
            Name = s.Name,
            Age = s.Age
        }).ToList();
    }


    public async Task AddAsync(Student student) => await studentRepository.AddAsync(student);
    public async Task UpdateAsync(int id, UpdateStudentDto student) => await studentRepository.UpdateAsync(id, student);
    public async Task DeleteAsync(int id) => await studentRepository.DeleteAsync(id);
    public async Task SaveAsync() => await studentRepository.SaveAsync();
}