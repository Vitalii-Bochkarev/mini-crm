using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace MyProject2.Tests;

[Collection(PostgreSqlIntegrationCollection.Name)]
public sealed class BusinessRulesIntegrationTests(PostgreSqlIntegrationFixture fixture)
{
    [Fact]
    public async Task UpdateUser_WithCaseInsensitiveDuplicateUsername_ReturnsConflictWithoutChanges()
    {
        var suffix = UniqueSuffix();
        var existing = await fixture.CreateUserAsync(
            $"existing_{suffix}",
            "Viewer",
            fixture.CreatePassword());
        var target = await fixture.CreateUserAsync(
            $"target_{suffix}",
            "Viewer",
            fixture.CreatePassword());

        using var response = await UpdateUserAsync(
            target,
            existing.Username.ToUpperInvariant(),
            $"changed_{suffix}@example.test",
            isActive: false,
            role: "Editor");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await AssertSafeErrorAsync(response);
        Assert.Equal(existing, await fixture.GetUserAsync(existing.Id));
        Assert.Equal(target, await fixture.GetUserAsync(target.Id));
    }

    [Fact]
    public async Task UpdateUser_WithCaseInsensitiveDuplicateEmail_ReturnsConflictWithoutChanges()
    {
        var suffix = UniqueSuffix();
        var existing = await fixture.CreateUserAsync(
            $"email_owner_{suffix}",
            "Viewer",
            fixture.CreatePassword(),
            $"owner_{suffix}@example.test");
        var target = await fixture.CreateUserAsync(
            $"email_target_{suffix}",
            "Viewer",
            fixture.CreatePassword(),
            $"target_{suffix}@example.test");

        using var response = await UpdateUserAsync(
            target,
            $"renamed_{suffix}",
            existing.Email.ToUpperInvariant(),
            isActive: false,
            role: "Editor");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await AssertSafeErrorAsync(response);
        Assert.Equal(existing, await fixture.GetUserAsync(existing.Id));
        Assert.Equal(target, await fixture.GetUserAsync(target.Id));
    }

    [Fact]
    public async Task DeleteRestaurant_WithEmployee_ReturnsConflictAndPreservesEntities()
    {
        var suffix = UniqueSuffix();
        var restaurant = await CreateRestaurantAsync($"Restaurant {suffix}");
        var employee = await CreateEmployeeAsync(restaurant.Id, suffix);
        using var request = fixture.CreateAuthorizedRequest(
            HttpMethod.Delete,
            $"/restaurants/{restaurant.Id}",
            fixture.Administrator.Token);

        using var response = await fixture.Client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await AssertSafeErrorAsync(response);
        var persistedRestaurant = await GetAsync<TestRestaurant>($"/restaurants/{restaurant.Id}");
        Assert.Equal(restaurant.Id, persistedRestaurant.Id);
        Assert.Equal(restaurant.Name, persistedRestaurant.Name);
        Assert.Equal(restaurant.City, persistedRestaurant.City);
        Assert.Equal(restaurant.IsActive, persistedRestaurant.IsActive);
        Assert.InRange(
            persistedRestaurant.CreatedAt,
            restaurant.CreatedAt.AddMilliseconds(-1),
            restaurant.CreatedAt.AddMilliseconds(1));
        Assert.Equal(employee, await GetAsync<TestEmployee>($"/employees/{employee.Id}"));
    }

    [Fact]
    public async Task CreateUser_WithInvalidData_ReturnsValidationProblemWithExpectedErrors()
    {
        using var request = fixture.CreateAuthorizedRequest(
            HttpMethod.Post,
            "/admin/users",
            fixture.Administrator.Token,
            new
            {
                username = " ",
                email = "not-an-email",
                role = "Owner",
                password = "short"
            });

        using var response = await fixture.Client.SendAsync(request);

        await AssertValidationProblemAsync(
            response,
            "Username",
            "Email",
            "Role",
            "Password");
    }

    [Fact]
    public async Task CreateRestaurant_WithInvalidData_ReturnsValidationProblemWithExpectedErrors()
    {
        using var request = fixture.CreateAuthorizedRequest(
            HttpMethod.Post,
            "/restaurants",
            fixture.Administrator.Token,
            new { name = " ", city = "x", isActive = true });

        using var response = await fixture.Client.SendAsync(request);

        await AssertValidationProblemAsync(response, "Name", "City");
    }

    [Fact]
    public async Task CreateEmployee_WithInvalidData_ReturnsValidationProblemWithExpectedErrors()
    {
        using var request = fixture.CreateAuthorizedRequest(
            HttpMethod.Post,
            "/employees",
            fixture.Administrator.Token,
            new
            {
                firstName = " ",
                lastName = "x",
                position = " ",
                salary = -1,
                isActive = true,
                restaurantId = Guid.Empty
            });

        using var response = await fixture.Client.SendAsync(request);

        await AssertValidationProblemAsync(
            response,
            "FirstName",
            "LastName",
            "Position",
            "Salary",
            "RestaurantId");
    }

    [Theory]
    [InlineData("/admin/users/")]
    [InlineData("/restaurants/")]
    [InlineData("/employees/")]
    public async Task GetMissingEntity_ReturnsNotFoundInSafeFormat(string pathPrefix)
    {
        using var request = fixture.CreateAuthorizedRequest(
            HttpMethod.Get,
            $"{pathPrefix}{Guid.NewGuid()}",
            fixture.Administrator.Token);

        using var response = await fixture.Client.SendAsync(request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await AssertSafeErrorAsync(response);
    }

    private async Task<HttpResponseMessage> UpdateUserAsync(
        TestUser user,
        string username,
        string email,
        bool isActive,
        string role)
    {
        using var request = fixture.CreateAuthorizedRequest(
            HttpMethod.Put,
            $"/admin/users/{user.Id}",
            fixture.Administrator.Token,
            new
            {
                username,
                email,
                isActive,
                role,
                password = ""
            });
        return await fixture.Client.SendAsync(request);
    }

    private async Task<TestRestaurant> CreateRestaurantAsync(string name)
    {
        using var request = fixture.CreateAuthorizedRequest(
            HttpMethod.Post,
            "/restaurants",
            fixture.Administrator.Token,
            new { name, city = "Test City", isActive = true });
        using var response = await fixture.Client.SendAsync(request);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var restaurant = await response.Content.ReadFromJsonAsync<TestRestaurant>();
        return Assert.IsType<TestRestaurant>(restaurant);
    }

    private async Task<TestEmployee> CreateEmployeeAsync(Guid restaurantId, string suffix)
    {
        using var request = fixture.CreateAuthorizedRequest(
            HttpMethod.Post,
            "/employees",
            fixture.Administrator.Token,
            new
            {
                firstName = "Test",
                lastName = $"Employee{suffix}",
                position = "Tester",
                salary = 1000.25m,
                isActive = true,
                restaurantId
            });
        using var response = await fixture.Client.SendAsync(request);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var employee = await response.Content.ReadFromJsonAsync<TestEmployee>();
        return Assert.IsType<TestEmployee>(employee);
    }

    private async Task<T> GetAsync<T>(string path)
    {
        using var request = fixture.CreateAuthorizedRequest(
            HttpMethod.Get,
            path,
            fixture.Administrator.Token);
        using var response = await fixture.Client.SendAsync(request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var entity = await response.Content.ReadFromJsonAsync<T>();
        return Assert.IsType<T>(entity);
    }

    private static async Task AssertValidationProblemAsync(
        HttpResponseMessage response,
        params string[] expectedErrorKeys)
    {
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var problem = await response.Content.ReadFromJsonAsync<TestValidationProblem>();
        var actual = Assert.IsType<TestValidationProblem>(problem);
        Assert.Equal(
            expectedErrorKeys.Order(StringComparer.Ordinal),
            actual.Errors.Keys.Order(StringComparer.Ordinal));
        Assert.All(actual.Errors.Values, messages => Assert.NotEmpty(messages));
    }

    private static async Task AssertSafeErrorAsync(HttpResponseMessage response)
    {
        using var document = JsonDocument.Parse(await response.Content.ReadAsStreamAsync());
        Assert.Equal(JsonValueKind.Object, document.RootElement.ValueKind);
        var property = Assert.Single(document.RootElement.EnumerateObject());
        Assert.Equal("error", property.Name);
        Assert.False(string.IsNullOrWhiteSpace(property.Value.GetString()));
    }

    private static string UniqueSuffix() => Guid.NewGuid().ToString("N")[..12];
}

public sealed record TestValidationProblem(Dictionary<string, string[]> Errors);

public sealed record TestRestaurant(
    Guid Id,
    string Name,
    string City,
    bool IsActive,
    DateTime CreatedAt);

public sealed record TestEmployee(
    Guid Id,
    string FirstName,
    string LastName,
    string Position,
    decimal Salary,
    bool IsActive,
    Guid RestaurantId,
    string RestaurantName);
