using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;
using System.Security.Claims;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WhatsAppController : ControllerBase
{
    private readonly IWhatsAppService _whatsAppService;
    private readonly ApplicationDbContext _context;

    public WhatsAppController(IWhatsAppService whatsAppService, ApplicationDbContext context)
    {
        _whatsAppService = whatsAppService;
        _context = context;
    }

    [HttpPost("send")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<ActionResult<WhatsAppMessageResponse>> SendMessage([FromBody] WhatsAppMessageRequest request)
    {
        if (request == null || request.PhoneNumbers == null || !request.PhoneNumbers.Any())
        {
            return BadRequest(new WhatsAppMessageResponse
            {
                Success = false,
                Message = "Phone numbers are required"
            });
        }

        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new WhatsAppMessageResponse
            {
                Success = false,
                Message = "Message content is required"
            });
        }

        var result = await _whatsAppService.SendMessageAsync(request);
        
        if (result.Success)
        {
            return Ok(result);
        }
        
        return StatusCode(500, result);
    }

    [HttpGet("parents")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<ActionResult<List<ParentInfoDto>>> GetParents()
    {
        var parents = await _context.Parents
            .Select(p => new ParentInfoDto
            {
                ParentId = p.ParentId,
                Name = p.Name,
                Phone = p.Phone ?? string.Empty,
                Email = p.Email
            })
            .ToListAsync();

        return Ok(parents);
    }

    [HttpGet("parents/by-class/{classId}")]
    [Authorize(Roles = "admin,teacher")]
    public async Task<ActionResult<List<ParentInfoDto>>> GetParentsByClass(int classId)
    {
        var parents = await _context.Users
            .Where(u => u.ClassId == classId && u.ParentId != null)
            .Join(_context.Parents,
                student => student.ParentId,
                parent => parent.ParentId,
                (student, parent) => new ParentInfoDto
                {
                    ParentId = parent.ParentId,
                    Name = parent.Name,
                    Phone = parent.Phone ?? string.Empty,
                    Email = parent.Email
                })
            .Distinct()
            .ToListAsync();

        return Ok(parents);
    }
}

public class ParentInfoDto
{
    public int ParentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
}
