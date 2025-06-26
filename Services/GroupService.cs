using alg_dashboard_server.DTOs;
using alg_dashboard_server.Helpers;
using alg_dashboard_server.Models;
using alg_dashboard_server.Repositories;
using Attendance = alg_dashboard_server.Models.Attendance;

namespace alg_dashboard_server.Services;

public class GroupService(GroupRepository groupRepository, LessonRepository lessonRepository)
{
    public async Task<List<GroupResponseDto>> GetAll()
    {
        var groups = await groupRepository.Get();
        return groups.Select(g => new GroupResponseDto
        {
            Id = g.Id,
            Name = g.Name,
            Course = g.Course.Name ,
            Teacher = g.Teacher.Name,
            StartDate = g.StartDate,
            LessonDay = g.LessonDay,
            LessonTime = g.LessonTime,
            Students = g.GroupStudents.Select(gs => new StudentResponseDto
            {
                Id = gs.Student.Id,
                Name = gs.Student.Name,
                Age = gs.Student.Age,
            }).ToList(),
        }).ToList();
    }

    public async Task<GroupResponseDto?> GetById(int id)
    {
        var group = await groupRepository.Get(id);
        if (group == null) return null;
        return new GroupResponseDto
        {
            Id = group.Id,
            Name = group.Name,
            Course = group.Course.Name ,
            Teacher = group.Teacher.Name,
            StartDate = group.StartDate,
            LessonDay = group.LessonDay,
            LessonTime = group.LessonTime,
            Students = group.GroupStudents.Select(sg => new StudentResponseDto
            {
                Id = sg.StudentId,
                Name = sg.Student.Name,
                Age = sg.Student.Age
            }).ToList(),
            Lessons = group.Lessons.Select(l => new LessonResponseDto
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
                    WasPresent = a.WasPresent,
                }).ToList()
            }).ToList()
        };
    }

    public async Task<bool> Create(GroupCreateDto group)
    {
        var newGroup = await groupRepository.Create(group);
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
                WasPresent = false
            }).ToList()
        }).ToList();

        await lessonRepository.Create(lessons);

        return true;
    }

    public async Task<bool> Update(int id, GroupUpdateDto groupRequest) =>
        await groupRepository.Update(id, groupRequest);

    public async Task<bool> Delete(int id) => await groupRepository.Delete(id);

    public async Task<bool> AddStudent(EditStudentInGroupRequestDto requestDto) =>
        await groupRepository.AddStudent(requestDto);

    public async Task<bool> RemoveStudent(EditStudentInGroupRequestDto requestDto) =>
        await groupRepository.RemoveStudent(requestDto);
}