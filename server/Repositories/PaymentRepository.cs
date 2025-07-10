using alg_dashboard_server.Data;
using alg_dashboard_server.DTOs;
using alg_dashboard_server.Models;
using Microsoft.EntityFrameworkCore;

namespace alg_dashboard_server.Repositories;

public class PaymentRepository(AppDbContext context) : BaseRepository<Payment, PaymentCreateDto, PaymentUpdateDto>(context)
{
    public override async Task<List<Payment>> Get()
    {
        return await DbSet.Include(p => p.Student).Include(p => p.Group).ToListAsync();
    }

    public override async Task<bool> Update(int id, PaymentUpdateDto dto)
    {
        var paymentFromDb = await DbSet.FindAsync(dto.StudentId, dto.GroupId);
        
        if (paymentFromDb == null) return false;
        MapUpdateDtoToEntity(paymentFromDb, dto);
        DbSet.Update(paymentFromDb);
        await Context.SaveChangesAsync();
        return true;
    }

    protected override Payment MapCreateDtoToEntity(PaymentCreateDto entity)
    {
        return new Payment
        {
            StudentId = entity.StudentId,
            GroupId = entity.GroupId,
            TotalPaidClasses = entity.classesAmount,
            ClassesLeft = entity.classesAmount,
        };
    }

    protected override void MapUpdateDtoToEntity(Payment entity, PaymentUpdateDto dto)
    {
        Console.Error.WriteLine($"DTO: {dto.clasesAmount}");
        Console.Error.WriteLine($"Entity: {entity.TotalPaidClasses}");
        entity.TotalPaidClasses += dto.clasesAmount;
        entity.ClassesLeft += dto.clasesAmount;
    }
}