using alg_dashboard_server.Models;

namespace alg_dashboard_server.Interfaces;

public interface ILessonRepository
{
    Task<List<Lesson>> GetAllLessons();
    Task<Lesson?> AddAsync(Lesson lesson);
    Task AddRangeAsync(List<Lesson> lessons);
    
}