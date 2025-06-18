using alg_dashboard_server.Data;
using alg_dashboard_server.DTOs;
using alg_dashboard_server.Interfaces;
using alg_dashboard_server.Models;
using Microsoft.EntityFrameworkCore;

namespace alg_dashboard_server.Repositories;

public class StudentRepository(AppDbContext context): IStudentRepository
{
    public async Task<List<Student>> GetAllAsync(int? groupId)
    {
        if (!groupId.HasValue) return await context.Students.ToListAsync();
        var studentIdsInGroup = await context.GroupStudents
            .Where(sg => sg.GroupId == groupId)
            .Select(sg => sg.StudentId)
            .ToListAsync();

        return await context.Students
            .Where(s => !studentIdsInGroup.Contains(s.Id))
            .ToListAsync();
    }

    public async Task<Student> AddAsync(StudentRequestDto student)
    {
        var newStudent = await context.Students.AddAsync(new Student
        {
            Name = student.Name,
            Age = student.Age,
        });
        await context.SaveChangesAsync();
        return newStudent.Entity;
    }

    public async Task<Student?> UpdateAsync(int id, UpdateStudentRequestDto student)
    {
        var studentFromDb = await context.Students.FindAsync(id);
        if (studentFromDb == null) return null;
        
        studentFromDb.Name = student.Name ?? studentFromDb.Name;
        studentFromDb.Age = student.Age ?? studentFromDb.Age;
        
        var updatedStudent = context.Students.Update(studentFromDb);
        await context.SaveChangesAsync();

        return updatedStudent.Entity;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var studentFromDb = await context.Students.FindAsync(id);
        if (studentFromDb == null) return false;
        context.Students.Remove(studentFromDb);
        await context.SaveChangesAsync();
        return true;
    }
}