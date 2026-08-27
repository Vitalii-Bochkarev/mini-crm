using System.ComponentModel.DataAnnotations;

namespace MyProject2.Admin;

public sealed class EmployeeCreateRequest
{
    private string _firstName = string.Empty;
    private string _lastName = string.Empty;
    private string _position = string.Empty;

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string FirstName
    {
        get => _firstName;
        init => _firstName = RequestText.Normalize(value);
    }

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string LastName
    {
        get => _lastName;
        init => _lastName = RequestText.Normalize(value);
    }

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Position
    {
        get => _position;
        init => _position = RequestText.Normalize(value);
    }

    [Range(0, 9999999.99)]
    [DecimalScale(2)]
    public decimal Salary { get; init; }

    public bool IsActive { get; init; } = true;

    [Required]
    [NotEmptyGuid]
    public Guid RestaurantId { get; init; }
}

public sealed class EmployeeUpdateRequest
{
    private string _firstName = string.Empty;
    private string _lastName = string.Empty;
    private string _position = string.Empty;

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string FirstName
    {
        get => _firstName;
        init => _firstName = RequestText.Normalize(value);
    }

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string LastName
    {
        get => _lastName;
        init => _lastName = RequestText.Normalize(value);
    }

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Position
    {
        get => _position;
        init => _position = RequestText.Normalize(value);
    }

    [Range(0, 9999999.99)]
    [DecimalScale(2)]
    public decimal Salary { get; init; }

    public bool IsActive { get; init; } = true;

    [Required]
    [NotEmptyGuid]
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
