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
            var students = await studentService.GetAllAsync(groupId);
            return Ok(new SuccessResponse<List<StudentResponseDto>>("", students));
        }
        catch (Exception)
        {
            return StatusCode(500, new ErrorResponse<string>("Internal server error"));
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] StudentRequestDto studentRequest)
    {
        try
        {
            var newStudent = await studentService.AddAsync(studentRequest);
            return Ok(new SuccessResponse<StudentResponseDto>("Student has been successfully added", newStudent));
        }
        catch (Exception)
        {
            return StatusCode(500, new ErrorResponse<string>("Internal server error"));
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateStudentRequestDto studentRequest)
    {
        try
        {
            var updatedStudent = await studentService.UpdateAsync(id, studentRequest);
            if (updatedStudent == null) return NotFound(new ErrorResponse<string>("Student not found"));
            return Ok(new SuccessResponse<UpdateStudentResponseDto>("Student has been updated successfully",
                updatedStudent));
        }
        catch (Exception)
        {
            return StatusCode(500, new ErrorResponse<string>("Internal server error"));
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        try
        {
            var ok = await studentService.DeleteAsync(id);
            if (!ok) return NotFound(new ErrorResponse<string>("Student not found"));
            return Ok(new SuccessResponse<object>("User has been deleted successfully", new { }));
        }
        catch (Exception)
        {
            return StatusCode(500, new ErrorResponse<string>("Internal server error"));
        }
    }
}