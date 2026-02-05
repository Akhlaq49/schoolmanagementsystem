using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClubsController : ControllerBase
{
    private readonly IClubService _clubService;

    public ClubsController(IClubService clubService)
    {
        _clubService = clubService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Club>>> GetAllClubs()
    {
        var clubs = await _clubService.GetAllClubsAsync();
        return Ok(clubs);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Club>> GetClub(int id)
    {
        var club = await _clubService.GetClubByIdAsync(id);
        if (club == null) return NotFound();
        return Ok(club);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<Club>> CreateClub([FromBody] Club club)
    {
        var created = await _clubService.CreateClubAsync(club);
        return CreatedAtAction(nameof(GetClub), new { id = created.ClubId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateClub(int id, [FromBody] Club club)
    {
        var updated = await _clubService.UpdateClubAsync(id, club);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteClub(int id)
    {
        var result = await _clubService.DeleteClubAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}

