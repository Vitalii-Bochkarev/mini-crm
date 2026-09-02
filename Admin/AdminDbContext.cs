using Microsoft.EntityFrameworkCore;

namespace MyProject2.Admin;

public sealed class AdminDbContext : DbContext
{
    public AdminDbContext(DbContextOptions<AdminDbContext> options)
        : base(options)
    {
    }

    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<Restaurant> Restaurants => Set<Restaurant>();
    public DbSet<Employee> Employees => Set<Employee>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("citext");

        modelBuilder.Entity<AdminUser>(builder =>
        {
            builder.HasKey(user => user.Id);
            builder.Property(user => user.Username).HasColumnType("citext").IsRequired();
            builder.Property(user => user.Email).HasColumnType("citext").IsRequired();
            builder.Property(user => user.Role).IsRequired();
            builder.Property(user => user.IsActive).HasDefaultValue(true);
            builder.Property(user => user.PasswordHash).IsRequired();
            builder.Property(user => user.PasswordSalt).IsRequired();
            builder.HasIndex(user => user.Username)
                .IsUnique()
                .HasDatabaseName("IX_AdminUsers_Username");
            builder.HasIndex(user => user.Email)
                .IsUnique()
                .HasDatabaseName("IX_AdminUsers_Email");
        });

        modelBuilder.Entity<Restaurant>(builder =>
        {
            builder.HasKey(restaurant => restaurant.Id);
            builder.Property(restaurant => restaurant.Name).IsRequired();
            builder.Property(restaurant => restaurant.City).IsRequired();
            builder.Property(restaurant => restaurant.IsActive).HasDefaultValue(true);
            builder.Property(restaurant => restaurant.CreatedAt).IsRequired();
            
            // Configure relationship: One Restaurant has many Employees
            builder.HasMany(r => r.Employees)
                .WithOne(e => e.Restaurant)
                .HasForeignKey(e => e.RestaurantId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Employee>(builder =>
        {
            builder.HasKey(employee => employee.Id);
            builder.Property(employee => employee.FirstName).IsRequired();
            builder.Property(employee => employee.LastName).IsRequired();
            builder.Property(employee => employee.Position).IsRequired();
            builder.Property(employee => employee.Salary).HasColumnType("numeric(10,2)");
            builder.Property(employee => employee.IsActive).HasDefaultValue(true);
            builder.Property(employee => employee.RestaurantId).IsRequired();
            
            // Foreign key configuration
            builder.HasOne(e => e.Restaurant)
                .WithMany(r => r.Employees)
                .HasForeignKey(e => e.RestaurantId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        base.OnModelCreating(modelBuilder);
    }
}
