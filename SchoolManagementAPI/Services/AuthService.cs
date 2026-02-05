using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

namespace SchoolManagementAPI.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        // Check unified Users table with roles
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Email == request.Email);
        
        if (user != null && VerifyPassword(request.Password, user.Password))
        {
            user.LoginStatus = "1";
            await _context.SaveChangesAsync();
            
            // Get all roles for the user
            var roles = user.UserRoles.Select(ur => ur.Role.ToString().ToLower()).ToList();
            var primaryRole = roles.FirstOrDefault() ?? "user";
            var rolesString = string.Join(",", roles);
            
            return new LoginResponse
            {
                Token = GenerateJwtToken(user.UserId, roles),
                LoginType = primaryRole, // Primary role for backward compatibility
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
                Roles = roles // Include all roles in response
            };
        }

        return null;
    }

    public async Task<bool> LogoutAsync(int userId, string loginType)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.LoginStatus = "0";
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }
        catch
        {
            return false;
        }
    }

    private bool VerifyPassword(string password, string hash)
    {
        // The original PHP code uses SHA1, but we should migrate to BCrypt
        // For now, we'll check both SHA1 and BCrypt
        try
        {
            // Try BCrypt first (for new passwords)
            if (BCrypt.Net.BCrypt.Verify(password, hash))
                return true;
        }
        catch { }

        // Fallback to SHA1 (for existing passwords)
        using var sha1 = System.Security.Cryptography.SHA1.Create();
        var hashBytes = sha1.ComputeHash(Encoding.UTF8.GetBytes(password));
        var sha1Hash = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
        return sha1Hash == hash.ToLower();
    }

    private string GenerateJwtToken(int userId, List<string> roles)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"];
        var issuer = jwtSettings["Issuer"];
        var audience = jwtSettings["Audience"];

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim("login_type", roles.FirstOrDefault() ?? "user") // Primary role for backward compatibility
        };

        // Add all roles as claims
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        // Also add a comma-separated roles claim for easy access
        claims.Add(new Claim("roles", string.Join(",", roles)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings["ExpirationInMinutes"])),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

