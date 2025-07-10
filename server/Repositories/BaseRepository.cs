using alg_dashboard_server.Data;
using Microsoft.EntityFrameworkCore;

namespace alg_dashboard_server.Repositories;

public abstract class BaseRepository<TEntity, TCreateDto, TUpdateDto>(AppDbContext context) where TEntity : class
{
    protected readonly AppDbContext Context = context;
    protected readonly DbSet<TEntity> DbSet = context.Set<TEntity>();

    public virtual async Task<List<TEntity>> Get()
    {
        var entities = await DbSet.ToListAsync();
        return entities;
    }

    public virtual async Task<TEntity?> Get(params object?[] keyValues)
    {
        var entity = await DbSet.FindAsync(keyValues);
        return entity;
    }

    public virtual async Task<TEntity?> Create(TCreateDto dto)
    {
        try
        {
            var entity = MapCreateDtoToEntity(dto);
            var result = await DbSet.AddAsync(entity);
            await Context.SaveChangesAsync();
            return result.Entity;
        }
        catch (Exception e)
        {
            await Context.DisposeAsync();
            return null;
        }
    }

    public virtual async Task<bool> Create(List<TEntity> dto)
    {
        await DbSet.AddRangeAsync(dto);
        await Context.SaveChangesAsync();
        return true;
    }

    public virtual async Task<bool> Create(List<TCreateDto> dto)
    {
        await DbSet.AddRangeAsync(dto.Select(MapCreateDtoToEntity));
        await Context.SaveChangesAsync();
        return true;
    }

    public virtual async Task<bool> Update(int id, TUpdateDto dto)
    {
        var entity = await DbSet.FindAsync(id);
        if (entity == null) return false;
        MapUpdateDtoToEntity(entity, dto);
        DbSet.Update(entity);
        await Context.SaveChangesAsync();
        return true;
    }
    
    public virtual async Task<bool> Delete(int id)
    {
        var entity = await DbSet.FindAsync(id);
        if (entity == null) return false;

        DbSet.Remove(entity);
        await Context.SaveChangesAsync();
        return true;
    }

    protected abstract TEntity MapCreateDtoToEntity(TCreateDto entity);
    protected abstract void MapUpdateDtoToEntity(TEntity entity, TUpdateDto dto);
}