using System.ComponentModel.DataAnnotations;
namespace MyProject2.Admin;

public sealed class AdminUserCreateRequest
{
    private string _username = string.Empty;
    private string _email = string.Empty;
    private string _role = string.Empty;

    [Required(ErrorMessage = "Имя пользователя обязательно.")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Имя пользователя должно содержать от 3 до 50 символов.")]
    public string Username
    {
        get => _username;
        init => _username = RequestText.Normalize(value);
    }

    [Required(ErrorMessage = "Электронная почта обязательна.")]
    [EmailAddress(ErrorMessage = "Укажите корректный адрес электронной почты.")]
    [MaxLength(254, ErrorMessage = "Электронная почта должна содержать не более 254 символов.")]
    public string Email
    {
        get => _email;
        init => _email = RequestText.Normalize(value);
    }

    [Required(ErrorMessage = "Роль обязательна.")]
    [AllowedRole]
    public string Role
    {
        get => _role;
        init => _role = RequestText.Normalize(value);
    }

    [Required(ErrorMessage = "Пароль обязателен.")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Пароль должен содержать от 8 до 100 символов.")]
    public string Password { get; init; } = string.Empty;
}

public sealed class AdminUserUpdateRequest
{
    private string _username = string.Empty;
    private string _email = string.Empty;
    private string _role = string.Empty;

    [Required(ErrorMessage = "Имя пользователя обязательно.")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Имя пользователя должно содержать от 3 до 50 символов.")]
    public string Username
    {
        get => _username;
        init => _username = RequestText.Normalize(value);
    }

    [Required(ErrorMessage = "Электронная почта обязательна.")]
    [EmailAddress(ErrorMessage = "Укажите корректный адрес электронной почты.")]
    [MaxLength(254, ErrorMessage = "Электронная почта должна содержать не более 254 символов.")]
    public string Email
    {
        get => _email;
        init => _email = RequestText.Normalize(value);
    }

    public bool IsActive { get; init; }

    [Required(ErrorMessage = "Роль обязательна.")]
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

    [Required(ErrorMessage = "Имя пользователя обязательно.")]
    public string Username
    {
        get => _username;
        init => _username = RequestText.Normalize(value);
    }

    [Required(ErrorMessage = "Пароль обязателен.")]
    public string Password { get; init; } = string.Empty;
}

public sealed record AdminUserResponse(
    Guid Id,
    string Username,
    string Email,
    bool IsActive,
    string Role
);

