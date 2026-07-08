using System.ComponentModel.DataAnnotations;

namespace MyProject2.Admin;

public sealed class EmployeeCreateRequest
{
    [Required]
    [MinLength(2)]
    public string FirstName { get; init; } = string.Empty;

    [Required]
    [MinLength(2)]
    public string LastName { get; init; } = string.Empty;

    [Required]
    [MinLength(2)]
    public string Position { get; init; } = string.Empty;

    [Range(0, 9999999.99)]
    public decimal Salary { get; init; }

    public bool IsActive { get; init; } = true;

    [Required]
    public Guid RestaurantId { get; init; }
}

public sealed class EmployeeUpdateRequest
{
    [Required]
    [MinLength(2)]
    public string FirstName { get; init; } = string.Empty;

    [Required]
    [MinLength(2)]
    public string LastName { get; init; } = string.Empty;

    [Required]
    [MinLength(2)]
    public string Position { get; init; } = string.Empty;

    [Range(0, 9999999.99)]
    public decimal Salary { get; init; }

    public bool IsActive { get; init; } = true;

    [Required]
    public Guid RestaurantId { get; init; }
}

public sealed record EmployeeResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string Position,
    decimal Salary,
    bool IsActive,
    Guid RestaurantId,
    string RestaurantName
);
