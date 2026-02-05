using SchoolManagementAPI.DTOs;

namespace SchoolManagementAPI.Services;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    Task<bool> LogoutAsync(int userId, string loginType);
}

