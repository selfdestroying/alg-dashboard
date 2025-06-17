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

    public async Task AddAsync(Student student)
    {
        await context.Students.AddAsync(student);
    }

    public async Task UpdateAsync(int id, UpdateStudentDto student)
    {
        var studentFromDb = await context.Students.FindAsync(id);
        if (studentFromDb == null) return;
        
        studentFromDb.Name = student.Name ?? studentFromDb.Name;
        studentFromDb.Age = student.Age ?? studentFromDb.Age;
        
        context.Students.Update(studentFromDb);

        await context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var studentFromDb = await context.Students.FindAsync(id);
        if (studentFromDb == null) return;
        context.Students.Remove(studentFromDb);
        await context.SaveChangesAsync();
    }

    public async Task SaveAsync()
    {
        await context.SaveChangesAsync();
    }
}