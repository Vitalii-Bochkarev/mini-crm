using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MyProject2.Admin;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// Swagger
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' followed by your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowAnyOrigin();
        });
});

// JWT settings
var jwtSettings = new JwtSettings(
    Issuer: builder.Configuration["Jwt:Issuer"] ?? "MyProject2",
    Audience: builder.Configuration["Jwt:Audience"] ?? "MyProject2",
    SecretKey: builder.Configuration["Jwt:SecretKey"] ?? "SuperSecretJwtKey_ChangeThis_AtLeast32Chars!",
    ExpireMinutes: int.TryParse(builder.Configuration["Jwt:ExpireMinutes"], out var expireMinutes) ? expireMinutes : 60);

builder.Services.AddSingleton(jwtSettings);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
            ClockSkew = TimeSpan.FromMinutes(2)
        };
    });

builder.Services.AddAuthorization();

// Database
builder.Services.AddDbContext<AdminDbContext>(options =>
    options.UseNpgsql(
        "Host=localhost;Port=5432;Database=adminpanel;Username=postgres;Password=postgres123"));

// Services
builder.Services.AddScoped<AdminRepository>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AdminDbContext>();
    dbContext.Database.Migrate();

    if (!dbContext.AdminUsers.Any())
    {
        var (superHash, superSalt) = PasswordHasher.HashPassword("SuperAdmin123!");
        var (jdoeHash, jdoeSalt) = PasswordHasher.HashPassword("Editor123!");
        var (asmithHash, asmithSalt) = PasswordHasher.HashPassword("Viewer123!");

        dbContext.AdminUsers.AddRange(
            new AdminUser(Guid.NewGuid(), "superadmin", "superadmin@example.com", true, "Administrator")
            {
                PasswordHash = superHash,
                PasswordSalt = superSalt
            },
            new AdminUser(Guid.NewGuid(), "jdoe", "jdoe@example.com", true, "Editor")
            {
                PasswordHash = jdoeHash,
                PasswordSalt = jdoeSalt
            },
            new AdminUser(Guid.NewGuid(), "asmith", "asmith@example.com", false, "Viewer")
            {
                PasswordHash = asmithHash,
                PasswordSalt = asmithSalt
            }
        );
        dbContext.SaveChanges();
    }
}

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowFrontend");

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool",
    "Mild", "Warm", "Balmy", "Hot",
    "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();

    return forecast;
})
.WithName("GetWeatherForecast");

// Authentication routes
app.MapPost("/auth/login", (AdminUserLoginRequest request, AdminRepository repository) =>
{
    var validationErrors = GetValidationErrors(request);
    if (validationErrors is not null)
    {
        return Results.ValidationProblem(validationErrors);
    }

    var user = repository.Authenticate(request.Username, request.Password);
    if (user is null)
    {
        return Results.Json(
            new { error = "Неверное имя пользователя или пароль." },
            statusCode: StatusCodes.Status401Unauthorized);
    }

    var token = GenerateJwtToken(user, jwtSettings);
    var response = new
    {
        Token = token,
        User = new AdminUserResponse(user.Id, user.Username, user.Email, user.IsActive, user.Role)
    };

    return Results.Ok(response);
});

// Admin routes
var admin = app.MapGroup("/admin");
admin.RequireAuthorization();

admin.MapGet("/users", GetUsers)
    .RequireAuthorization(policy =>
        policy.RequireRole("Administrator", "Editor", "Viewer"));

static IResult GetEmployees(
    string? search,
    int? page,
    int? pageSize,
    string? sortBy,
    string? sortDirection,
    AdminRepository repository)
{
    var pagedEmployees = repository.GetAllEmployees(search, page ?? 1, pageSize ?? 20, sortBy, sortDirection);
    var response = new PagedResult<EmployeeResponse>(
        pagedEmployees.Items.Select(ToEmployeeResponse).ToArray(),
        pagedEmployees.TotalCount,
        pagedEmployees.Page,
        pagedEmployees.PageSize);

    return Results.Ok(response);
}

static IResult GetEmployeeById(Guid id, AdminRepository repository)
{
    var employee = repository.GetEmployee(id);
    return employee is null
        ? Results.NotFound(new { error = "Сотрудник не найден." })
        : Results.Ok(ToEmployeeResponse(employee));
}

static IResult GetRestaurantEmployees(Guid restaurantId, AdminRepository repository)
{
    var employees = repository.GetEmployeesByRestaurant(restaurantId)
        .Select(ToEmployeeResponse);

    return Results.Ok(employees);
}

static IResult CreateEmployee(EmployeeCreateRequest request, AdminRepository repository)
{
    var validationErrors = GetValidationErrors(request);
    if (validationErrors is not null)
    {
        return Results.ValidationProblem(validationErrors);
    }

    // Verify restaurant exists
    var restaurant = repository.GetRestaurant(request.RestaurantId);
    if (restaurant is null)
    {
        return Results.BadRequest(new { error = "Ресторан для сотрудника не найден." });
    }

    var employee = repository.CreateEmployee(
        request.FirstName,
        request.LastName,
        request.Position,
        request.Salary,
        request.IsActive,
        request.RestaurantId);

    return Results.Created($"/employees/{employee.Id}", ToEmployeeResponse(employee));
}

static IResult UpdateEmployee(Guid id, EmployeeUpdateRequest request, AdminRepository repository)
{
    var validationErrors = GetValidationErrors(request);
    if (validationErrors is not null)
    {
        return Results.ValidationProblem(validationErrors);
    }

    // Verify restaurant exists
    var restaurant = repository.GetRestaurant(request.RestaurantId);
    if (restaurant is null)
    {
        return Results.BadRequest(new { error = "Ресторан для сотрудника не найден." });
    }

    var updated = repository.UpdateEmployee(
        id,
        request.FirstName,
        request.LastName,
        request.Position,
        request.Salary,
        request.IsActive,
        request.RestaurantId);

    return updated
        ? Results.NoContent()
        : Results.NotFound(new { error = "Сотрудник не найден." });
}

static IResult DeleteEmployee(Guid id, AdminRepository repository)
{
    var deleted = repository.DeleteEmployee(id);
    return deleted
        ? Results.NoContent()
        : Results.NotFound(new { error = "Сотрудник не найден." });
}

static IResult GetUsers(AdminRepository repository)
{
    var users = repository.GetAll()
        .Select(ToAdminUserResponse);

    return Results.Ok(users);
}
admin.MapGet("/users/{id:guid}", GetUserById);
admin.MapPost("/users", CreateUser)
    .RequireAuthorization(policy =>
        policy.RequireRole("Administrator", "Editor"));
admin.MapPut("/users/{id:guid}", UpdateUser);
admin.MapDelete("/users/{id:guid}", DeleteUser)
    .RequireAuthorization(policy =>
        policy.RequireRole("Administrator"));
admin.MapGet("/overview", GetOverview);

app.MapGet("/restaurants", GetRestaurants)
    .RequireAuthorization(policy => policy.RequireRole("Administrator", "Editor", "Viewer"));

app.MapGet("/restaurants/{id:guid}", GetRestaurantById)
    .RequireAuthorization(policy => policy.RequireRole("Administrator", "Editor", "Viewer"));

app.MapPost("/restaurants", CreateRestaurant)
    .RequireAuthorization(policy => policy.RequireRole("Administrator", "Editor"));

app.MapPut("/restaurants/{id:guid}", UpdateRestaurant)
    .RequireAuthorization(policy => policy.RequireRole("Administrator", "Editor"));

app.MapDelete("/restaurants/{id:guid}", DeleteRestaurant)
    .RequireAuthorization(policy => policy.RequireRole("Administrator"));

app.MapGet("/employees", GetEmployees)
    .RequireAuthorization(policy => policy.RequireRole("Administrator", "Editor", "Viewer"));

app.MapGet("/employees/{id:guid}", GetEmployeeById)
    .RequireAuthorization(policy => policy.RequireRole("Administrator", "Editor", "Viewer"));

app.MapGet("/restaurants/{restaurantId:guid}/employees", GetRestaurantEmployees)
    .RequireAuthorization(policy => policy.RequireRole("Administrator", "Editor", "Viewer"));

app.MapPost("/employees", CreateEmployee)
    .RequireAuthorization(policy => policy.RequireRole("Administrator", "Editor"));

app.MapPut("/employees/{id:guid}", UpdateEmployee)
    .RequireAuthorization(policy => policy.RequireRole("Administrator", "Editor"));

app.MapDelete("/employees/{id:guid}", DeleteEmployee)
    .RequireAuthorization(policy => policy.RequireRole("Administrator"));

app.Run();





static IResult GetUserById(Guid id, AdminRepository repository)
{
    var user = repository.Get(id);
    return user is null
        ? Results.NotFound(new { error = "Пользователь не найден." })
        : Results.Ok(ToAdminUserResponse(user));
}


static Dictionary<string, string[]>? GetCreateUserValidationErrors(AdminUserCreateRequest request)
{
    var errors = new Dictionary<string, List<string>>(StringComparer.Ordinal);

    ValidateProperty(nameof(AdminUserCreateRequest.Username), request.Username, request, errors);
    ValidateProperty(nameof(AdminUserCreateRequest.Email), request.Email, request, errors);
    ValidateProperty(nameof(AdminUserCreateRequest.Role), request.Role, request, errors);
    ValidateProperty(nameof(AdminUserCreateRequest.Password), request.Password, request, errors);

    return errors.Count == 0
        ? null
        : errors.ToDictionary(
            pair => pair.Key,
            pair => pair.Value.Distinct(StringComparer.Ordinal).ToArray(),
            StringComparer.Ordinal);
}


static void ValidateProperty<T>(
    string memberName,
    T value,
    AdminUserCreateRequest request,
    Dictionary<string, List<string>> errors)
{
    var validationResults = new List<ValidationResult>();
    var validationContext = new ValidationContext(request)
    {
        MemberName = memberName
    };

    if (Validator.TryValidateProperty(value, validationContext, validationResults))
    {
        return;
    }

    foreach (var validationResult in validationResults)
    {
        if (!errors.TryGetValue(memberName, out var memberErrors))
        {
            memberErrors = new List<string>();
            errors[memberName] = memberErrors;
        }

        memberErrors.Add(validationResult.ErrorMessage ?? "Недопустимое значение.");
    }
}


static IResult CreateUser(AdminUserCreateRequest request, AdminRepository repository)
{
    var validationErrors = GetCreateUserValidationErrors(request);
    if (validationErrors is not null)
    {
        return Results.ValidationProblem(validationErrors);
    }

    if (repository.UsernameExists(request.Username))
    {
        return UserUsernameConflict();
    }

    if (repository.EmailExists(request.Email))
    {
        return UserEmailConflict();
    }

    AdminUser user;
    try
    {
        user = repository.Create(
            request.Username,
            request.Email,
            request.Role,
            request.Password);
    }
    catch (DbUpdateException exception) when (IsConstraintViolation(
        exception,
        PostgresErrorCodes.UniqueViolation,
        "IX_AdminUsers_Username"))
    {
        return UserUsernameConflict();
    }
    catch (DbUpdateException exception) when (IsConstraintViolation(
        exception,
        PostgresErrorCodes.UniqueViolation,
        "IX_AdminUsers_Email"))
    {
        return UserEmailConflict();
    }

    return Results.Created($"/admin/users/{user.Id}", ToAdminUserResponse(user));
}


static IResult UpdateUser(Guid id, AdminUserUpdateRequest request, AdminRepository repository)
{
    var validationErrors = GetValidationErrors(request);
    if (validationErrors is not null)
    {
        return Results.ValidationProblem(validationErrors);
    }

    if (repository.Get(id) is null)
    {
        return Results.NotFound(new { error = "Пользователь не найден." });
    }

    if (repository.UsernameExists(request.Username, id))
    {
        return UserUsernameConflict();
    }

    if (repository.EmailExists(request.Email, id))
    {
        return UserEmailConflict();
    }

    bool updated;
    try
    {
        updated = repository.Update(
            id,
            request.Username,
            request.Email,
            request.IsActive,
            string.IsNullOrWhiteSpace(request.Role) ? "Viewer" : request.Role,
            request.Password);
    }
    catch (DbUpdateException exception) when (IsConstraintViolation(
        exception,
        PostgresErrorCodes.UniqueViolation,
        "IX_AdminUsers_Username"))
    {
        return UserUsernameConflict();
    }
    catch (DbUpdateException exception) when (IsConstraintViolation(
        exception,
        PostgresErrorCodes.UniqueViolation,
        "IX_AdminUsers_Email"))
    {
        return UserEmailConflict();
    }

    return updated
        ? Results.NoContent()
        : Results.NotFound(new { error = "Пользователь не найден." });
}


static IResult DeleteUser(Guid id, AdminRepository repository)
{
    var deleted = repository.Delete(id);
    return deleted
        ? Results.NoContent()
        : Results.NotFound(new { error = "Пользователь не найден." });
}


static IResult GetOverview(AdminRepository repository)
{
    var allUsers = repository.GetAll();

    var overview = new
    {
        TotalUsers = allUsers.Count,
        ActiveUsers = allUsers.Count(x => x.IsActive),
        Roles = allUsers
            .GroupBy(x => x.Role)
            .ToDictionary(
                g => g.Key,
                g => g.Count())
    };

    return Results.Ok(overview);
}

static IResult GetRestaurants(
    string? search,
    int? page,
    int? pageSize,
    string? sortBy,
    string? sortDirection,
    AdminRepository repository)
{
    var pagedRestaurants = repository.GetAllRestaurants(search, page ?? 1, pageSize ?? 20, sortBy, sortDirection);
    var response = new PagedResult<RestaurantResponse>(
        pagedRestaurants.Items.Select(ToRestaurantResponse).ToArray(),
        pagedRestaurants.TotalCount,
        pagedRestaurants.Page,
        pagedRestaurants.PageSize);

    return Results.Ok(response);
}

static IResult GetRestaurantById(Guid id, AdminRepository repository)
{
    var restaurant = repository.GetRestaurant(id);
    return restaurant is null
        ? Results.NotFound(new { error = "Ресторан не найден." })
        : Results.Ok(ToRestaurantResponse(restaurant));
}

static IResult CreateRestaurant(RestaurantCreateRequest request, AdminRepository repository)
{
    var validationErrors = GetValidationErrors(request);
    if (validationErrors is not null)
    {
        return Results.ValidationProblem(validationErrors);
    }

    var restaurant = repository.CreateRestaurant(request.Name, request.City, request.IsActive);
    return Results.Created($"/restaurants/{restaurant.Id}", ToRestaurantResponse(restaurant));
}

static IResult UpdateRestaurant(Guid id, RestaurantUpdateRequest request, AdminRepository repository)
{
    var validationErrors = GetValidationErrors(request);
    if (validationErrors is not null)
    {
        return Results.ValidationProblem(validationErrors);
    }

    var updated = repository.UpdateRestaurant(id, request.Name, request.City, request.IsActive);
    return updated
        ? Results.NoContent()
        : Results.NotFound(new { error = "Ресторан не найден." });
}

static IResult DeleteRestaurant(Guid id, AdminRepository repository)
{
    if (repository.GetRestaurant(id) is null)
    {
        return Results.NotFound(new { error = "Ресторан не найден." });
    }

    if (repository.RestaurantHasEmployees(id))
    {
        return RestaurantHasEmployeesConflict();
    }

    bool deleted;
    try
    {
        deleted = repository.DeleteRestaurant(id);
    }
    catch (DbUpdateException exception) when (IsConstraintViolation(
        exception,
        PostgresErrorCodes.ForeignKeyViolation,
        "FK_Employees_Restaurants_RestaurantId"))
    {
        return RestaurantHasEmployeesConflict();
    }

    return deleted
        ? Results.NoContent()
        : Results.NotFound(new { error = "Ресторан не найден." });
}

static IResult UserUsernameConflict()
{
    return Results.Conflict(new { error = "Пользователь с таким именем уже существует." });
}

static IResult UserEmailConflict()
{
    return Results.Conflict(new { error = "Пользователь с такой электронной почтой уже существует." });
}

static IResult RestaurantHasEmployeesConflict()
{
    return Results.Conflict(new { error = "Нельзя удалить ресторан, в котором есть сотрудники." });
}

static bool IsConstraintViolation(
    DbUpdateException exception,
    string sqlState,
    string constraintName)
{
    return exception.InnerException is PostgresException postgresException &&
           postgresException.SqlState == sqlState &&
           postgresException.ConstraintName == constraintName;
}

static Dictionary<string, string[]>? GetValidationErrors<T>(T request)
    where T : notnull
{
    var validationResults = new List<ValidationResult>();
    var validationContext = new ValidationContext(request);

    if (Validator.TryValidateObject(request, validationContext, validationResults, true))
    {
        return null;
    }

    var errors = new Dictionary<string, List<string>>(StringComparer.Ordinal);
    foreach (var validationResult in validationResults)
    {
        var memberNames = validationResult.MemberNames.Any()
            ? validationResult.MemberNames
            : new[] { string.Empty };

        foreach (var memberName in memberNames)
        {
            if (!errors.TryGetValue(memberName, out var memberErrors))
            {
                memberErrors = new List<string>();
                errors[memberName] = memberErrors;
            }

            memberErrors.Add(validationResult.ErrorMessage ?? "Недопустимое значение.");
        }
    }

    return errors.ToDictionary(
        pair => pair.Key,
        pair => pair.Value.Distinct(StringComparer.Ordinal).ToArray(),
        StringComparer.Ordinal);
}

static EmployeeResponse ToEmployeeResponse(Employee employee)
    => new(employee.Id, employee.FirstName, employee.LastName, employee.Position, employee.Salary, employee.IsActive, employee.RestaurantId, employee.Restaurant?.Name ?? string.Empty);

static RestaurantResponse ToRestaurantResponse(Restaurant restaurant)
    => new(restaurant.Id, restaurant.Name, restaurant.City, restaurant.IsActive, restaurant.CreatedAt);

static AdminUserResponse ToAdminUserResponse(AdminUser user)
    => new(user.Id, user.Username, user.Email, user.IsActive, user.Role);

static string GenerateJwtToken(AdminUser user, JwtSettings settings)
{
    var claims = new[]
    {
        new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
        new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
        new Claim(JwtRegisteredClaimNames.Email, user.Email),
        new Claim(ClaimTypes.Role, user.Role)
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.SecretKey));
    var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var token = new JwtSecurityToken(
        issuer: settings.Issuer,
        audience: settings.Audience,
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(settings.ExpireMinutes),
        signingCredentials: credentials);

    return new JwtSecurityTokenHandler().WriteToken(token);
}

internal sealed record JwtSettings(string Issuer, string Audience, string SecretKey, int ExpireMinutes);

record WeatherForecast(
    DateOnly Date,
    int TemperatureC,
    string? Summary)
{
    public int TemperatureF =>
        32 + (int)(TemperatureC / 0.5556);
}

