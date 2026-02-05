using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DepartmentsController : ControllerBase
{
    private readonly IDepartmentService _departmentService;

    public DepartmentsController(IDepartmentService departmentService)
    {
        _departmentService = departmentService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Department>>> GetAllDepartments()
    {
        var departments = await _departmentService.GetAllDepartmentsAsync();
        return Ok(departments);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Department>> GetDepartment(int id)
    {
        var department = await _departmentService.GetDepartmentByIdAsync(id);
        if (department == null) return NotFound();
        return Ok(department);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<Department>> CreateDepartment([FromBody] Department department)
    {
        var created = await _departmentService.CreateDepartmentAsync(department);
        return CreatedAtAction(nameof(GetDepartment), new { id = created.DepartmentId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateDepartment(int id, [FromBody] Department department)
    {
        var updated = await _departmentService.UpdateDepartmentAsync(id, department);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteDepartment(int id)
    {
        var result = await _departmentService.DeleteDepartmentAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}

