using System.ComponentModel.DataAnnotations;
namespace MyProject2.Admin;

public sealed class AdminUserCreateRequest
{
    private string _username = string.Empty;
    private string _email = string.Empty;
    private string _role = string.Empty;

    [Required]
    [StringLength(50, MinimumLength = 3)]
    public string Username
    {
        get => _username;
        init => _username = RequestText.Normalize(value);
    }

    [Required]
    [EmailAddress]
    [MaxLength(254)]
    public string Email
    {
        get => _email;
        init => _email = RequestText.Normalize(value);
    }

    [Required]
    [AllowedRole]
    public string Role
    {
        get => _role;
        init => _role = RequestText.Normalize(value);
    }

    [Required]
    [StringLength(100, MinimumLength = 8)]
    public string Password { get; init; } = string.Empty;
}

public sealed class AdminUserUpdateRequest
{
    private string _username = string.Empty;
    private string _email = string.Empty;
    private string _role = string.Empty;

    [Required]
    [StringLength(50, MinimumLength = 3)]
    public string Username
    {
        get => _username;
        init => _username = RequestText.Normalize(value);
    }

    [Required]
    [EmailAddress]
    [MaxLength(254)]
    public string Email
    {
        get => _email;
        init => _email = RequestText.Normalize(value);
    }

    public bool IsActive { get; init; }

    [Required]
    [AllowedRole]
    public string Role
    {
        get => _role;
        init => _role = RequestText.Normalize(value);
    }

    [OptionalPasswordLength(8, 100)]
    public string? Password { get; init; }
}

public sealed class AdminUserLoginRequest
{
    private string _username = string.Empty;

    [Required]
    public string Username
    {
        get => _username;
        init => _username = RequestText.Normalize(value);
    }

    [Required]
    public string Password { get; init; } = string.Empty;
}

public sealed record AdminUserResponse(
    Guid Id,
    string Username,
    string Email,
    bool IsActive,
    string Role
);

