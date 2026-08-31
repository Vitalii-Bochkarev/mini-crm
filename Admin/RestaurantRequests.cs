using System.ComponentModel.DataAnnotations;

namespace MyProject2.Admin;

public sealed class RestaurantCreateRequest
{
    private string _name = string.Empty;
    private string _city = string.Empty;

    [Required(ErrorMessage = "Название ресторана обязательно.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Название ресторана должно содержать от 2 до 100 символов.")]
    public string Name
    {
        get => _name;
        init => _name = RequestText.Normalize(value);
    }

    [Required(ErrorMessage = "Город обязателен.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Название города должно содержать от 2 до 100 символов.")]
    public string City
    {
        get => _city;
        init => _city = RequestText.Normalize(value);
    }

    public bool IsActive { get; init; } = true;
}

public sealed class RestaurantUpdateRequest
{
    private string _name = string.Empty;
    private string _city = string.Empty;

    [Required(ErrorMessage = "Название ресторана обязательно.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Название ресторана должно содержать от 2 до 100 символов.")]
    public string Name
    {
        get => _name;
        init => _name = RequestText.Normalize(value);
    }

    [Required(ErrorMessage = "Город обязателен.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Название города должно содержать от 2 до 100 символов.")]
    public string City
    {
        get => _city;
        init => _city = RequestText.Normalize(value);
    }

    public bool IsActive { get; init; } = true;
}

public sealed record RestaurantResponse(
    Guid Id,
    string Name,
    string City,
    bool IsActive,
    DateTime CreatedAt
);
