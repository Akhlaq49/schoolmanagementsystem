using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NoticeboardsController : ControllerBase
{
    private readonly INoticeboardService _noticeboardService;

    public NoticeboardsController(INoticeboardService noticeboardService)
    {
        _noticeboardService = noticeboardService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Noticeboard>>> GetAllNotices()
    {
        var notices = await _noticeboardService.GetAllNoticesAsync();
        return Ok(notices);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Noticeboard>> GetNotice(int id)
    {
        var notice = await _noticeboardService.GetNoticeByIdAsync(id);
        if (notice == null) return NotFound();
        return Ok(notice);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<Noticeboard>> CreateNotice([FromBody] Noticeboard notice)
    {
        var created = await _noticeboardService.CreateNoticeAsync(notice);
        return CreatedAtAction(nameof(GetNotice), new { id = created.NoticeId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateNotice(int id, [FromBody] Noticeboard notice)
    {
        var updated = await _noticeboardService.UpdateNoticeAsync(id, notice);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteNotice(int id)
    {
        var result = await _noticeboardService.DeleteNoticeAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}

