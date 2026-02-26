using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services.Family;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FamiliesController : ControllerBase
{
    private readonly IFamilyService _familyService;

    public FamiliesController(IFamilyService familyService)
    {
        _familyService = familyService;
    }

    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<List<Family>>> GetAllFamilies()
    {
        var families = await _familyService.GetAllFamiliesAsync();
        return Ok(families);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<Family>> GetFamily(int id)
    {
        var family = await _familyService.GetFamilyByIdAsync(id);
        if (family == null)
        {
            return NotFound();
        }

        return Ok(family);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<Family>> CreateFamily([FromBody] Family family)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var created = await _familyService.CreateFamilyAsync(family);
        return CreatedAtAction(nameof(GetFamily), new { id = created.FamilyId }, created);
    }
}

