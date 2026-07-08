using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyProject2.Admin;

public sealed class Employee
{
    public Guid Id { get; set; }

    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    [Required]
    public string Position { get; set; } = string.Empty;

    public decimal Salary { get; set; }

    public bool IsActive { get; set; }

    [Required]
    public Guid RestaurantId { get; set; }

    // Navigation property
    [ForeignKey("RestaurantId")]
    public Restaurant? Restaurant { get; set; }

    public Employee()
    {
    }

    public Employee(Guid id, string firstName, string lastName, string position, decimal salary, bool isActive, Guid restaurantId)
    {
        Id = id;
        FirstName = firstName;
        LastName = lastName;
        Position = position;
        Salary = salary;
        IsActive = isActive;
        RestaurantId = restaurantId;
    }
}
