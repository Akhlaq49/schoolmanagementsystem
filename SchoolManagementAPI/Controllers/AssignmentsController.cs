using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;
using System.Security.Claims;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssignmentsController : ControllerBase
{
    private readonly IAssignmentService _assignmentService;

    public AssignmentsController(IAssignmentService assignmentService)
    {
        _assignmentService = assignmentService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Assignment>>> GetAllAssignments()
    {
        var assignments = await _assignmentService.GetAllAssignmentsAsync();
        return Ok(assignments);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Assignment>> GetAssignment(int id)
    {
        var assignment = await _assignmentService.GetAssignmentByIdAsync(id);
        if (assignment == null) return NotFound();
        return Ok(assignment);
    }

    [HttpGet("class/{classId}")]
    public async Task<ActionResult<List<Assignment>>> GetAssignmentsByClass(int classId)
    {
        var assignments = await _assignmentService.GetAssignmentsByClassIdAsync(classId);
        return Ok(assignments);
    }

    [HttpGet("student/{studentId}")]
    public async Task<ActionResult<List<Assignment>>> GetAssignmentsByStudent(int studentId)
    {
        var loginType = User.FindFirstValue("login_type");
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Students can only see their own assignments
        if (loginType == "student" && userId != studentId)
        {
            return Forbid();
        }

        var assignments = await _assignmentService.GetAssignmentsByStudentIdAsync(studentId);
        return Ok(assignments);
    }

    [HttpPost]
    [Authorize(Roles = "admin,teacher")]
    public async Task<ActionResult<Assignment>> CreateAssignment([FromBody] Assignment assignment)
    {
        var created = await _assignmentService.CreateAssignmentAsync(assignment);
        return CreatedAtAction(nameof(GetAssignment), new { id = created.AssignmentId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> UpdateAssignment(int id, [FromBody] Assignment assignment)
    {
        var updated = await _assignmentService.UpdateAssignmentAsync(id, assignment);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<IActionResult> DeleteAssignment(int id)
    {
        var result = await _assignmentService.DeleteAssignmentAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}

