using alg_dashboard_server.Data;
using alg_dashboard_server.Interfaces;
using alg_dashboard_server.Models;
using Microsoft.EntityFrameworkCore;

namespace alg_dashboard_server.Repositories;

public class CourseRepository(AppDbContext context): ICourseRepository
{
    public async Task<List<Course>> GetAllAsync()
    {
        return await context.Courses.ToListAsync();
    }
}