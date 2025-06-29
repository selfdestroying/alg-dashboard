using alg_dashboard_server.Repositories;

namespace alg_dashboard_server.Services;

public abstract class BaseService<TRepository, TEntity, TResponseDto, TCreateDto, TUpdateDto>(TRepository repository)
    where TEntity : class
    where TResponseDto : class
    where TRepository : BaseRepository<TEntity, TCreateDto, TUpdateDto>
{
    protected readonly TRepository Repository = repository;


    public virtual async Task<List<TResponseDto>> Get() {
        var entities = await Repository.Get();
        return entities.Select(MapEntityToResponseDto).ToList();
    }

    public virtual async Task<TResponseDto?> Get(int id)
    {
        var entity = await Repository.Get(id);
        return entity == null ? null : MapEntityToResponseDto(entity);
    }

    public virtual async Task<bool> Create(TCreateDto dto)
    {
        var entity = await Repository.Create(dto);
        return entity != null;
    }

    public virtual async Task<bool> Update(int id, TUpdateDto dto) => await Repository.Update(id, dto);
    public virtual async Task<bool> Delete(int id) => await Repository.Delete(id);
    protected abstract TResponseDto MapEntityToResponseDto(TEntity entity);
    
}