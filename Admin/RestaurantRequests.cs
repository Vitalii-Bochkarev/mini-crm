using System.ComponentModel.DataAnnotations;

namespace MyProject2.Admin;

public sealed class RestaurantCreateRequest
{
    [Required]
    [MinLength(2)]
    public string Name { get; init; } = string.Empty;

    [Required]
    [MinLength(2)]
    public string City { get; init; } = string.Empty;

    public bool IsActive { get; init; } = true;
}

public sealed class RestaurantUpdateRequest
{
    [Required]
    [MinLength(2)]
    public string Name { get; init; } = string.Empty;

    [Required]
    [MinLength(2)]
    public string City { get; init; } = string.Empty;

    public bool IsActive { get; init; } = true;
}

public sealed record RestaurantResponse(
    Guid Id,
    string Name,
    string City,
    bool IsActive,
    DateTime CreatedAt
);
