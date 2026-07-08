using System.Text.Json.Serialization;

namespace MyProject2.Admin;

public sealed class AdminUser
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string Role { get; set; } = string.Empty;

    [JsonIgnore]
    public string PasswordHash { get; set; } = string.Empty;

    [JsonIgnore]
    public string PasswordSalt { get; set; } = string.Empty;

    public AdminUser()
    {
    }

    public AdminUser(Guid id, string username, string email, bool isActive, string role)
    {
        Id = id;
        Username = username;
        Email = email;
        IsActive = isActive;
        Role = role;
    }
}
