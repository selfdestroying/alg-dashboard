﻿using alg_dashboard_server.Data;
using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;
using Microsoft.EntityFrameworkCore;
using Attendance = alg_dashboard_server.Models.Attendance;

namespace alg_dashboard_server.Repositories;

public class AttendanceRepository(AppDbContext context)
    : BaseRepository<Attendance, AttendanceCreateDto, AttendanceUpdateDto>(context)
{
    public async Task<bool> Update(AttendanceUpdateDto attendance)
    {
        var attendancesFromDb = await Context.Attendances.Where(a => a.LessonId == attendance.LessonId).Include(a => a.Lesson).ToListAsync();
        var newAttendances = attendancesFromDb.Select(a =>
        {
            var attendanceExists = attendance.Attendances.Find(at => at.StudentId == a.StudentId);
            if (attendanceExists == null) return a;
            if (a.Status is AttendanceStatus.Unspecified or AttendanceStatus.Absent && attendanceExists.Status == AttendanceStatus.Present)
            {
                var payment = Context.Payments.Find(a.StudentId, a.Lesson.GroupId);
                if (payment != null)
                {
                    payment.ClassesLeft -= 1;
                    Context.Payments.Update(payment);
                }

                
            }
            a.Status = attendanceExists.Status;
            a.Comment = attendanceExists.Comment;

            return a;
        });
        Context.Attendances.UpdateRange(newAttendances);
        await Context.SaveChangesAsync();

        return true;
    }

    protected override Attendance MapCreateDtoToEntity(AttendanceCreateDto entity)
    {
        return new Attendance
        {
            LessonId = entity.LessonId,
            StudentId = entity.StudentId,
            Status = entity.Status,
            Comment = entity.Comment,
        };
    }

    protected override void MapUpdateDtoToEntity(Attendance entity, AttendanceUpdateDto dto)
    {
    }
}