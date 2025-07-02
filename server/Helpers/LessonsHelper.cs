using alg_dashboard_server.Models;

namespace alg_dashboard_server.Helpers;

public static class LessonsHelper
{
    public static List<DateOnly> GenerateLessonDates(int lessonsAmount, DateOnly date, DayOfWeek lessonDay)
    {
        var dates = new List<DateOnly>();

        var start = date;
        // TODO: remove number
        

        while (start.DayOfWeek != lessonDay)
        {
            start = start.AddDays(1);
        }

        var i = 0;
        while (i < lessonsAmount)
        {
            dates.Add(start);
            start = start.AddDays(7);
            i++;
        }

        return dates;
    }
}