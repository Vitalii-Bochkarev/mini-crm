using System.ComponentModel.DataAnnotations;

namespace MyProject2.Admin;

internal static class RequestText
{
    public static string Normalize(string? value) => value?.Trim() ?? string.Empty;
}

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class AllowedRoleAttribute : ValidationAttribute
{
    private static readonly HashSet<string> AllowedRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "Administrator",
        "Editor",
        "Viewer"
    };

    public AllowedRoleAttribute()
        : base("Недопустимая роль. Допустимые значения: Administrator, Editor, Viewer.")
    {
    }

    public override bool IsValid(object? value)
        => value is null || value is string role && AllowedRoles.Contains(role);
}

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class DecimalScaleAttribute : ValidationAttribute
{
    private readonly int _maximumScale;

    public DecimalScaleAttribute(int maximumScale)
        : base("Числовое значение должно содержать не более {1} знаков после запятой.")
    {
        _maximumScale = maximumScale;
    }

    public override bool IsValid(object? value)
    {
        if (value is null)
        {
            return true;
        }

        if (value is not decimal decimalValue)
        {
            return false;
        }

        var scale = (decimal.GetBits(decimalValue)[3] >> 16) & 0x7F;
        return scale <= _maximumScale;
    }

    public override string FormatErrorMessage(string name)
        => string.Format(ErrorMessageString, name, _maximumScale);
}

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class NotEmptyGuidAttribute : ValidationAttribute
{
    public NotEmptyGuidAttribute()
        : base("Идентификатор ресторана не должен содержать пустой GUID.")
    {
    }

    public override bool IsValid(object? value)
        => value is null || value is Guid guid && guid != Guid.Empty;
}

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class OptionalPasswordLengthAttribute : ValidationAttribute
{
    private readonly int _minimumLength;
    private readonly int _maximumLength;

    public OptionalPasswordLengthAttribute(int minimumLength, int maximumLength)
        : base("Если пароль указан, его длина должна составлять от {1} до {2} символов.")
    {
        _minimumLength = minimumLength;
        _maximumLength = maximumLength;
    }

    public override bool IsValid(object? value)
    {
        if (value is null || value is string { Length: 0 })
        {
            return true;
        }

        return value is string password
            && (string.IsNullOrWhiteSpace(password)
                || password.Length >= _minimumLength && password.Length <= _maximumLength);
    }

    public override string FormatErrorMessage(string name)
        => string.Format(ErrorMessageString, name, _minimumLength, _maximumLength);
}
