using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;
using alg_dashboard_server.Repositories;

namespace alg_dashboard_server.Services;

public class PaymentService(PaymentRepository repository, GroupRepository groupRepository) : BaseService<PaymentRepository, Payment, PaymentResponseDto, PaymentCreateDto, PaymentUpdateDto>(repository)
{
    public override async Task<bool> Create(PaymentCreateDto dto)
    {
        var payment = await base.Get(dto.StudentId, dto.GroupId);
        if (payment == null)
        {
            await base.Create(dto);
        }
        else
        {
            return await base.Update(0, new PaymentUpdateDto
            {
                StudentId = dto.StudentId,
                GroupId = dto.GroupId,
                clasesAmount = dto.classesAmount
            });
        }
         
        return await groupRepository.AddStudent(new EditStudentInGroupRequestDto
        {
            StudentId = dto.StudentId,
            GroupId = dto.GroupId
        });
    }

    protected override PaymentResponseDto MapEntityToResponseDto(Payment entity)
    {
        return new PaymentResponseDto
        {
            Group = entity.Group,
            Student = entity.Student,
            ClassesLeft = entity.ClassesLeft,
            TotalPaidClasses = entity.TotalPaidClasses,
        };
    }
}