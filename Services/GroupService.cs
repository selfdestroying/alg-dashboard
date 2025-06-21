using System.Runtime.InteropServices.JavaScript;
using alg_dashboard_server.DTOs;
using alg_dashboard_server.Helpers;
using alg_dashboard_server.Interfaces;
using alg_dashboard_server.Models;

namespace alg_dashboard_server.Services;

public class GroupService(IGroupRepository groupRepository, ILessonRepository lessonRepository)
{
    public async Task<List<GroupResponseDto>> GetAllAsync()
    {
        var groups = await groupRepository.GetAllAsync();
        return groups.Select(g => new GroupResponseDto
        {
            Id = g.Id,
            Name = g.Name,
            Course = g.Course.Name,
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
            Lessons = g.Lessons.Select(l => new LessonResponseDto
            {
                Id = l.Id,
                Date = l.Date,
                Time = l.Time,
                Attendances = l.Attendances.Select(a => new AttendanceResponseDto
                {
                    Student = a.Student.Name,
                    WasPresent = a.WasPresent,
                }).ToList()
            }).ToList()
        }).ToList();
    }

    public async Task<GroupResponseDto?> GetByIdAsync(int id)
    {
        var group = await groupRepository.GetByIdAsync(id);
        if (group == null) return null;
        return new GroupResponseDto
        {
            Id = group.Id,
            Name = group.Name,
            Course = group.Course.Name,
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
                Attendances = l.Attendances.Select(a => new AttendanceResponseDto
                {
                    Student = a.Student.Name,
                    WasPresent = a.WasPresent,
                }).ToList()
            }).ToList()
        };
    }

    public async Task<GroupResponseDto?> AddAsync(GroupRequestDto group) {
        var newGroup = await groupRepository.AddAsync(group);
        if (newGroup == null) return null;
        
        var lessonDates = LessonsHelper.GenerateLessonDates(newGroup);
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
        
        await lessonRepository.AddRangeAsync(lessons);
        
        return new GroupResponseDto
        {
            Id = newGroup.Id,
            Name = newGroup.Name,
            Course = "",
            Teacher = "",
            StartDate = DateOnly.FromDateTime(DateTime.Now),
            LessonDay = DayOfWeek.Monday,
            LessonTime = TimeOnly.FromDateTime(DateTime.Now),
            Students = [],
            Lessons = []
        };
    }
    public async Task<GroupResponseDto?> UpdateAsync(int id, UpdateGroupRequestDto groupRequest) {
        var updatedGroup = await groupRepository.UpdateAsync(id, groupRequest);
        if (updatedGroup == null) return null;

        return new GroupResponseDto
        {
            Id = updatedGroup.Id,
            Name = updatedGroup.Name,
            Course = "",
            Teacher = "",
            StartDate = DateOnly.FromDateTime(DateTime.Now),
            LessonDay = DayOfWeek.Monday,
            LessonTime = TimeOnly.FromDateTime(DateTime.Now),
            Students = [],
            Lessons = []
        };
    }
    public async Task<bool> DeleteAsync(int id) => await groupRepository.DeleteAsync(id);

    public async Task<bool> AddToGroupAsync(EditStudentInGroupRequestDto requestDto) =>
        await groupRepository.AddStudentAsync(requestDto);
    public async Task<bool> RemoveStudentAsync(EditStudentInGroupRequestDto requestDto) => await groupRepository.RemoveStudentAsync(requestDto);
}