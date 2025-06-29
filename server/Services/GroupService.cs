using alg_dashboard_server.DTOs;
using alg_dashboard_server.Helpers;
using alg_dashboard_server.Models;
using alg_dashboard_server.Repositories;
using Attendance = alg_dashboard_server.Models.Attendance;

namespace alg_dashboard_server.Services;

public class GroupService(GroupRepository repository, LessonRepository lessonRepository)
    : BaseService<GroupRepository, Group, GroupResponseDto, GroupCreateDto, GroupUpdateDto>(repository)
{
    public override async Task<bool> Create(GroupCreateDto group)
    {
        var newGroup = await Repository.Create(group);
        if (newGroup == null) return false;

        var lessonDates = LessonsHelper.GenerateLessonDates(group.StartDate, group.StartDate.DayOfWeek);
        var lessons = lessonDates.Select(date => new Lesson
        {
            GroupId = newGroup.Id,
            Date = date,
            Time = newGroup.LessonTime,
            Attendances = newGroup.GroupStudents.Select(sg => new Attendance
            {
                StudentId = sg.Student.Id,
                Status = AttendanceStatus.Unspecified,
                Comment = ""
            }).ToList()
        }).ToList();

        await lessonRepository.Create(lessons);

        return true;
    }


    protected override GroupResponseDto MapEntityToResponseDto(Group entity)
    {
        return new GroupResponseDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Course = entity.Course.Name,
            Teacher = entity.Teacher.Name,
            StartDate = entity.StartDate,
            LessonDay = entity.LessonDay,
            LessonTime = entity.LessonTime,
            BackOfficeUrl = entity.BackOfficeUrl,
            Students = entity.GroupStudents.Select(sg => new StudentResponseDto
            {
                Id = sg.StudentId,
                Name = sg.Student.Name,
                Age = sg.Student.Age
            }).ToList(),
            Lessons = entity.Lessons.OrderBy(l => l.Date).ThenBy(l => l.Time).Select(l => new LessonResponseDto
            {
                Id = l.Id,
                Date = l.Date,
                Time = l.Time,
                GroupId = l.GroupId,
                Attendances = l.Attendances.Select(a => new AttendanceResponseDto
                {
                    StudentId = a.Student.Id,
                    LessonId = a.Lesson.Id,
                    Student = a.Student.Name,
                    Status = a.Status,
                    Comment = a.Comment
                }).ToList()
            }).ToList()
        };
    }

    public async Task<bool> AddStudent(EditStudentInGroupRequestDto requestDto) =>
        await Repository.AddStudent(requestDto);

    public async Task<bool> RemoveStudent(EditStudentInGroupRequestDto requestDto) =>
        await Repository.RemoveStudent(requestDto);
}