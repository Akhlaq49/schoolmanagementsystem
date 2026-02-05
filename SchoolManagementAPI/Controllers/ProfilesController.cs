using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.Models;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfilesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProfilesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.UserId == userId);
        
        if (user == null) return NotFound();
        
        return Ok(user);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _context.Users.FindAsync(userId);
        
        if (user == null) return NotFound();

        user.Name = request.Name ?? user.Name;
        user.Email = request.Email ?? user.Email;
        user.Phone = request.Phone ?? user.Phone;
        user.Address = request.Address ?? user.Address;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Profile updated successfully" });
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (request.NewPassword != request.ConfirmPassword)
        {
            return BadRequest(new { message = "Passwords do not match" });
        }

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _context.Users.FindAsync(userId);
        
        if (user == null) return NotFound();

        using var sha1 = SHA1.Create();
        var hashBytes = sha1.ComputeHash(Encoding.UTF8.GetBytes(request.NewPassword));
        var hashedPassword = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

        user.Password = hashedPassword;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Password changed successfully" });
    }
}

public class UpdateProfileRequest
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
}

public class ChangePasswordRequest
{
    public string NewPassword { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}

