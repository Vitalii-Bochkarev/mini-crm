using System.ComponentModel.DataAnnotations;
namespace MyProject2.Admin;

public sealed class AdminUserCreateRequest
{
    [Required]
    [MinLength(3)]
    public string Username { get; init; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; init; } = string.Empty;

    [Required]
    public string Role { get; init; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; init; } = string.Empty;
}

public sealed record AdminUserUpdateRequest(
    string Username,
    string Email,
    bool IsActive,
    string Role,
    string? Password = null
);

public sealed record AdminUserLoginRequest(
    string Username,
    string Password
);

public sealed record AdminUserResponse(
    Guid Id,
    string Username,
    string Email,
    bool IsActive,
    string Role
);

