using System.ComponentModel.DataAnnotations;

namespace MyProject2.Admin;

public sealed class EmployeeCreateRequest
{
    private string _firstName = string.Empty;
    private string _lastName = string.Empty;
    private string _position = string.Empty;

    [Required(ErrorMessage = "Имя сотрудника обязательно.")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Имя сотрудника должно содержать от 2 до 50 символов.")]
    public string FirstName
    {
        get => _firstName;
        init => _firstName = RequestText.Normalize(value);
    }

    [Required(ErrorMessage = "Фамилия сотрудника обязательна.")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Фамилия сотрудника должна содержать от 2 до 50 символов.")]
    public string LastName
    {
        get => _lastName;
        init => _lastName = RequestText.Normalize(value);
    }

    [Required(ErrorMessage = "Должность обязательна.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Должность должна содержать от 2 до 100 символов.")]
    public string Position
    {
        get => _position;
        init => _position = RequestText.Normalize(value);
    }

    [Range(0, 9999999.99, ErrorMessage = "Зарплата должна быть в диапазоне от 0 до 9 999 999,99.")]
    [DecimalScale(2)]
    public decimal Salary { get; init; }

    public bool IsActive { get; init; } = true;

    [Required(ErrorMessage = "Ресторан обязателен.")]
    [NotEmptyGuid]
    public Guid RestaurantId { get; init; }
}

public sealed class EmployeeUpdateRequest
{
    private string _firstName = string.Empty;
    private string _lastName = string.Empty;
    private string _position = string.Empty;

    [Required(ErrorMessage = "Имя сотрудника обязательно.")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Имя сотрудника должно содержать от 2 до 50 символов.")]
    public string FirstName
    {
        get => _firstName;
        init => _firstName = RequestText.Normalize(value);
    }

    [Required(ErrorMessage = "Фамилия сотрудника обязательна.")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Фамилия сотрудника должна содержать от 2 до 50 символов.")]
    public string LastName
    {
        get => _lastName;
        init => _lastName = RequestText.Normalize(value);
    }

    [Required(ErrorMessage = "Должность обязательна.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Должность должна содержать от 2 до 100 символов.")]
    public string Position
    {
        get => _position;
        init => _position = RequestText.Normalize(value);
    }

    [Range(0, 9999999.99, ErrorMessage = "Зарплата должна быть в диапазоне от 0 до 9 999 999,99.")]
    [DecimalScale(2)]
    public decimal Salary { get; init; }

    public bool IsActive { get; init; } = true;

    [Required(ErrorMessage = "Ресторан обязателен.")]
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
