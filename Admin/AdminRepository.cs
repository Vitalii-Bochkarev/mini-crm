using Microsoft.EntityFrameworkCore;

namespace MyProject2.Admin;

public sealed class AdminRepository
{
    private readonly AdminDbContext _dbContext;

    public AdminRepository(AdminDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public IReadOnlyCollection<AdminUser> GetAll()
    {
        return _dbContext.AdminUsers.AsNoTracking().ToArray();
    }

    public AdminUser? Get(Guid id)
    {
        return _dbContext.AdminUsers.Find(id);
    }

    public AdminUser? GetByUsername(string username)
    {
        return _dbContext.AdminUsers
            .AsNoTracking()
            .SingleOrDefault(user => user.Username == username.Trim());
    }

    public MyProject2.Admin.PagedResult<Restaurant> GetAllRestaurants(
        string? search = null,
        int page = 1,
        int pageSize = 20,
        string? sortBy = null,
        string? sortDirection = null)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _dbContext.Restaurants.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim();

            query = query.Where(restaurant =>
                restaurant.Name.Contains(normalizedSearch) ||
                restaurant.City.Contains(normalizedSearch));
        }

        var totalCount = query.Count();
        var normalizedSortBy = sortBy?.Trim().ToLowerInvariant();
        var descending = string.Equals(sortDirection?.Trim(), "desc", StringComparison.OrdinalIgnoreCase);

        var orderedQuery = normalizedSortBy switch
        {
            "name" => descending
                ? query.OrderByDescending(restaurant => restaurant.Name)
                : query.OrderBy(restaurant => restaurant.Name),
            "city" => descending
                ? query.OrderByDescending(restaurant => restaurant.City)
                : query.OrderBy(restaurant => restaurant.City),
            "createdat" => descending
                ? query.OrderByDescending(restaurant => restaurant.CreatedAt)
                : query.OrderBy(restaurant => restaurant.CreatedAt),
            _ => query.OrderBy(restaurant => restaurant.CreatedAt)
        };

        var items = orderedQuery
            .ThenBy(restaurant => restaurant.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToArray();

        return new PagedResult<Restaurant>(
            items,
            totalCount,
            page,
            pageSize);
    }

    public Restaurant? GetRestaurant(Guid id)
    {
        return _dbContext.Restaurants.Find(id);
    }

    public Restaurant CreateRestaurant(string name, string city, bool isActive)
    {
        var restaurant = new Restaurant(Guid.NewGuid(), name.Trim(), city.Trim(), isActive, DateTime.UtcNow);
        _dbContext.Restaurants.Add(restaurant);
        _dbContext.SaveChanges();
        return restaurant;
    }

    public bool UpdateRestaurant(Guid id, string name, string city, bool isActive)
    {
        var restaurant = _dbContext.Restaurants.Find(id);
        if (restaurant is null)
        {
            return false;
        }

        restaurant.Name = name.Trim();
        restaurant.City = city.Trim();
        restaurant.IsActive = isActive;

        _dbContext.SaveChanges();
        return true;
    }

    public bool DeleteRestaurant(Guid id)
    {
        var restaurant = _dbContext.Restaurants.Find(id);
        if (restaurant is null)
        {
            return false;
        }

        _dbContext.Restaurants.Remove(restaurant);
        _dbContext.SaveChanges();
        return true;
    }

    public PagedResult<Employee> GetAllEmployees(
        string? search = null,
        int page = 1,
        int pageSize = 20,
        string? sortBy = null,
        string? sortDirection = null)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _dbContext.Employees
            .AsNoTracking()
            .Include(e => e.Restaurant)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim();

            query = query.Where(employee =>
                employee.FirstName.Contains(normalizedSearch) ||
                employee.LastName.Contains(normalizedSearch) ||
                employee.Position.Contains(normalizedSearch) ||
                employee.Restaurant != null && employee.Restaurant.Name.Contains(normalizedSearch));
        }

        var totalCount = query.Count();

        var normalizedSortBy = sortBy?.Trim().ToLowerInvariant();
        var descending = string.Equals(sortDirection?.Trim(), "desc", StringComparison.OrdinalIgnoreCase);

        var orderedQuery = normalizedSortBy switch
        {
            "firstname" => descending
                ? query.OrderByDescending(employee => employee.FirstName)
                : query.OrderBy(employee => employee.FirstName),
            "lastname" => descending
                ? query.OrderByDescending(employee => employee.LastName).ThenBy(employee => employee.FirstName)
                : query.OrderBy(employee => employee.LastName).ThenBy(employee => employee.FirstName),
            "position" => descending
                ? query.OrderByDescending(employee => employee.Position)
                : query.OrderBy(employee => employee.Position),
            "salary" => descending
                ? query.OrderByDescending(employee => employee.Salary)
                : query.OrderBy(employee => employee.Salary),
            _ => query.OrderBy(employee => employee.LastName).ThenBy(employee => employee.FirstName)
        };

        var items = orderedQuery
            .ThenBy(employee => employee.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToArray();

        return new PagedResult<Employee>(
            items,
            totalCount,
            page,
            pageSize);
    }

    public Employee? GetEmployee(Guid id)
    {
        return _dbContext.Employees
            .Include(e => e.Restaurant)
            .FirstOrDefault(e => e.Id == id);
    }

    public IReadOnlyCollection<Employee> GetEmployeesByRestaurant(Guid restaurantId)
    {
        return _dbContext.Employees
            .AsNoTracking()
            .Where(e => e.RestaurantId == restaurantId)
            .Include(e => e.Restaurant)
            .ToArray();
    }

    public Employee CreateEmployee(string firstName, string lastName, string position, decimal salary, bool isActive, Guid restaurantId)
    {
        var employee = new Employee(Guid.NewGuid(), firstName.Trim(), lastName.Trim(), position.Trim(), salary, isActive, restaurantId);
        _dbContext.Employees.Add(employee);
        _dbContext.SaveChanges();
        return employee;
    }

    public bool UpdateEmployee(Guid id, string firstName, string lastName, string position, decimal salary, bool isActive, Guid restaurantId)
    {
        var employee = _dbContext.Employees.Find(id);
        if (employee is null)
        {
            return false;
        }

        employee.FirstName = firstName.Trim();
        employee.LastName = lastName.Trim();
        employee.Position = position.Trim();
        employee.Salary = salary;
        employee.IsActive = isActive;
        employee.RestaurantId = restaurantId;

        _dbContext.SaveChanges();
        return true;
    }

    public bool DeleteEmployee(Guid id)
    {
        var employee = _dbContext.Employees.Find(id);
        if (employee is null)
        {
            return false;
        }

        _dbContext.Employees.Remove(employee);
        _dbContext.SaveChanges();
        return true;
    }

    public AdminUser Create(string username, string email, string role, string password)
    {
        var (hash, salt) = PasswordHasher.HashPassword(password);
        var user = new AdminUser(Guid.NewGuid(), username.Trim(), email.Trim(), true, NormalizeRole(role))
        {
            PasswordHash = hash,
            PasswordSalt = salt
        };

        _dbContext.AdminUsers.Add(user);
        _dbContext.SaveChanges();
        return user;
    }

    public bool Update(Guid id, string username, string email, bool isActive, string role, string? password = null)
    {
        var user = _dbContext.AdminUsers.Find(id);
        if (user is null)
        {
            return false;
        }

        user.Username = username.Trim();
        user.Email = email.Trim();
        user.IsActive = isActive;
        user.Role = NormalizeRole(role);

        if (!string.IsNullOrWhiteSpace(password))
        {
            var (hash, salt) = PasswordHasher.HashPassword(password);
            user.PasswordHash = hash;
            user.PasswordSalt = salt;
        }

        _dbContext.SaveChanges();
        return true;
    }

    public bool Delete(Guid id)
    {
        var user = _dbContext.AdminUsers.Find(id);
        if (user is null)
        {
            return false;
        }

        _dbContext.AdminUsers.Remove(user);
        _dbContext.SaveChanges();
        return true;
    }

    public AdminUser? Authenticate(string username, string password)
    {
        var user = _dbContext.AdminUsers.SingleOrDefault(u => u.Username == username.Trim());
        if (user is null || !user.IsActive)
        {
            return null;
        }

        return PasswordHasher.VerifyPassword(password, user.PasswordHash, user.PasswordSalt)
            ? user
            : null;
    }

    private static string NormalizeRole(string role)
    {
        var normalizedRole = role.Trim();
        return normalizedRole.ToUpperInvariant() switch
        {
            "ADMINISTRATOR" => "Administrator",
            "EDITOR" => "Editor",
            "VIEWER" => "Viewer",
            _ => normalizedRole
        };
    }
}
