using System.Text.Json.Serialization;

namespace MyProject2.Admin;

public sealed class Restaurant
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation property
    [JsonIgnore]
    public ICollection<Employee> Employees { get; set; } = new List<Employee>();

    public Restaurant()
    {
    }

    public Restaurant(Guid id, string name, string city, bool isActive, DateTime createdAt)
    {
        Id = id;
        Name = name;
        City = city;
        IsActive = isActive;
        CreatedAt = createdAt;
    }
}
