using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Services;
using System.Security.Claims;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new { message = "Email and password are required" });
        }

        var response = await _authService.LoginAsync(request);
        if (response == null)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        return Ok(response);
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.CurrentPassword) || string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            return BadRequest(new { message = "Current password and new password are required" });
        }
        if (dto.NewPassword.Length < 6)
        {
            return BadRequest(new { message = "New password must be at least 6 characters" });
        }

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var (success, error) = await _authService.ChangePasswordAsync(userId, dto);
        if (!success)
        {
            return BadRequest(new { message = error ?? "Failed to change password" });
        }

        return Ok(new { message = "Password changed successfully" });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var loginType = User.FindFirstValue("login_type")!;

        var result = await _authService.LogoutAsync(userId, loginType);
        if (result)
        {
            return Ok(new { message = "Logged out successfully" });
        }

        return BadRequest(new { message = "Logout failed" });
    }
}

