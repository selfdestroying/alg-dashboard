using alg_dashboard_server.DTOs;
using alg_dashboard_server.Repositories;
using alg_dashboard_server.Services;
using Microsoft.AspNetCore.Mvc;

namespace alg_dashboard_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BaseController<TService, TRepository, TEntity, TResponseDto, TCreateDto, TUpdateDto>(
    TService service)
    : ControllerBase
    where TEntity : class
    where TResponseDto : class
    where TRepository : BaseRepository<TEntity, TCreateDto, TUpdateDto>
    where TService : BaseService<TRepository, TEntity, TResponseDto, TCreateDto, TUpdateDto>
{
    protected readonly TService Service = service;

    [HttpGet]
    public virtual async Task<ActionResult<List<TResponseDto>>> Get()
    {
        try
        {
            var items = await Service.Get();
            return Ok(new SuccessResponse<List<TResponseDto>>("", items));
        }
        catch (Exception e)
        {
            return StatusCode(500, new ErrorResponse(e.Message));
        }
    }

    [HttpGet("{id}")]
    public virtual async Task<IActionResult> GetById([FromRoute] int id)
    {
        try
        {
            var item = await Service.Get(id);
            if (item == null) return NotFound(new ErrorResponse("Not found"));
            return Ok(new SuccessResponse<TResponseDto>("", item));
        }
        catch (Exception e)
        {
            return StatusCode(500, new ErrorResponse(e.Message));
        }
    }

    [HttpPost]
    public virtual async Task<IActionResult> Create([FromBody] TCreateDto item)
    {
        try
        {
            var ok = await Service.Create(item);
            if (!ok) return NotFound(new ErrorResponse("Not found"));
            return Ok(new SuccessResponse<object>("Successfully added", new { }));
        }
        catch (Exception)
        {
            return StatusCode(500, new ErrorResponse("Internal server error"));
        }
    }

    [HttpPut("{id}")]
    public virtual async Task<IActionResult> Update([FromRoute] int id, [FromBody] TUpdateDto item)
    {
        try
        {
            var ok = await Service.Update(id, item);
            if (!ok) return NotFound(new ErrorResponse("Not found"));
            return Ok(new SuccessResponse<object>("Successfully updated", new { }));
        }
        catch (Exception)
        {
            return StatusCode(500, new ErrorResponse("Internal server error"));
        }
    }
    
    [HttpDelete("{id}")]
    public virtual async Task<IActionResult> Delete([FromRoute] int id)
    {
        try
        {
            var ok = await Service.Delete(id);
            if (!ok) return NotFound(new ErrorResponse("Not found"));
            return Ok(new SuccessResponse<object>("Successfully deleted", new { }));
        }
        catch (Exception)
        {
            return StatusCode(500, new ErrorResponse("Internal server error"));
        }
    }
}