using alg_dashboard_server.DTOs;
using alg_dashboard_server.Services;
using Microsoft.AspNetCore.Mvc;

namespace alg_dashboard_server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController(StudentService studentService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? groupId)
    {
        try
        {
            var students = await studentService.GetAll(groupId);
            return Ok(new SuccessResponse<List<StudentResponseDto>>("", students));
        }
        catch (Exception)
        {
            return StatusCode(500, new ErrorResponse("Internal server error"));
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] StudentCreateDto studentCreate)
    {
        try
        {
            var newStudent = await studentService.Create(studentCreate);
            if (!newStudent) return BadRequest(new ErrorResponse("Student not created"));
            return Ok(new SuccessResponse<object>("Student has been successfully added", new { }));
        }
        catch (Exception)
        {
            return StatusCode(500, new ErrorResponse("Internal server error"));
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] StudentUpdateDto studentRequest)
    {
        try
        {
            var updatedStudent = await studentService.Update(id, studentRequest);
            if (!updatedStudent) return NotFound(new ErrorResponse("Student not found"));
            return Ok(new SuccessResponse<object>("Student has been updated successfully",
                new { }));
        }
        catch (Exception)
        {
            return StatusCode(500, new ErrorResponse("Internal server error"));
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        try
        {
            var ok = await studentService.Delete(id);
            if (!ok) return NotFound(new ErrorResponse("Student not found"));
            return Ok(new SuccessResponse<object>("User has been deleted successfully", new { }));
        }
        catch (Exception)
        {
            return StatusCode(500, new ErrorResponse("Internal server error"));
        }
    }
}