using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace MyProject2.Tests;

[Collection(PostgreSqlIntegrationCollection.Name)]
public sealed class AuthenticationAndErrorIntegrationTests(PostgreSqlIntegrationFixture fixture)
{
    [Fact]
    public async Task Login_WithValidCredentials_ReturnsJwtAndSafeProfile()
    {
        var username = UniqueUsername("login_success");
        var password = fixture.CreatePassword();
        var expectedUser = await fixture.CreateUserAsync(username, "Viewer", password);

        using var response = await fixture.Client.PostAsJsonAsync(
            "/auth/login",
            new { username, password });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        using var document = JsonDocument.Parse(await response.Content.ReadAsStreamAsync());
        var root = document.RootElement;
        Assert.Equal(["token", "user"], PropertyNames(root));
        Assert.False(string.IsNullOrWhiteSpace(root.GetProperty("token").GetString()));

        var profile = root.GetProperty("user");
        Assert.Equal(["email", "id", "isActive", "role", "username"], PropertyNames(profile));
        Assert.Equal(expectedUser.Id, profile.GetProperty("id").GetGuid());
        Assert.Equal(expectedUser.Username, profile.GetProperty("username").GetString());
        Assert.Equal(expectedUser.Email, profile.GetProperty("email").GetString());
        Assert.Equal(expectedUser.IsActive, profile.GetProperty("isActive").GetBoolean());
        Assert.Equal(expectedUser.Role, profile.GetProperty("role").GetString());
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ReturnsUnauthorizedWithSafeError()
    {
        var username = UniqueUsername("login_invalid");
        var password = fixture.CreatePassword();
        await fixture.CreateUserAsync(username, "Viewer", password);

        using var response = await fixture.Client.PostAsJsonAsync(
            "/auth/login",
            new { username, password = fixture.CreatePassword() });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await AssertSafeErrorAsync(response);
    }

    [Fact]
    public async Task Login_ForDisabledUser_ReturnsUnauthorized()
    {
        var username = UniqueUsername("login_disabled");
        var password = fixture.CreatePassword();
        var user = await fixture.CreateUserAsync(username, "Viewer", password);
        using var updateRequest = fixture.CreateAuthorizedRequest(
            HttpMethod.Put,
            $"/admin/users/{user.Id}",
            fixture.Administrator.Token,
            new
            {
                user.Username,
                user.Email,
                isActive = false,
                user.Role,
                password = ""
            });
        using var updateResponse = await fixture.Client.SendAsync(updateRequest);
        Assert.Equal(HttpStatusCode.NoContent, updateResponse.StatusCode);

        using var response = await fixture.Client.PostAsJsonAsync(
            "/auth/login",
            new { username, password });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await AssertSafeErrorAsync(response);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithoutJwt_ReturnsUnauthorized()
    {
        using var response = await fixture.Client.GetAsync("/admin/users");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await AssertSafeErrorAsync(response);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithMalformedJwt_ReturnsUnauthorized()
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, "/admin/users");
        request.Headers.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            "not-a-valid-jwt");

        using var response = await fixture.Client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await AssertSafeErrorAsync(response);
    }

    [Fact]
    public async Task MalformedJson_ReturnsBadRequestWithoutInternalDetails()
    {
        using var content = new StringContent(
            "{\"username\":",
            Encoding.UTF8,
            "application/json");

        using var response = await fixture.Client.PostAsync("/auth/login", content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        AssertSafeError(body, response.Content.Headers.ContentType?.MediaType);
        Assert.DoesNotContain("stack", body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("exception", body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("npgsql", body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("select ", body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain(".cs:", body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("D:\\", body, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task UnknownRoute_ReturnsNotFoundWithSafeError()
    {
        using var response = await fixture.Client.GetAsync(
            $"/route-that-does-not-exist/{Guid.NewGuid():N}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await AssertSafeErrorAsync(response);
    }

    private static async Task AssertSafeErrorAsync(HttpResponseMessage response)
    {
        var body = await response.Content.ReadAsStringAsync();
        AssertSafeError(body, response.Content.Headers.ContentType?.MediaType);
    }

    private static void AssertSafeError(string body, string? mediaType)
    {
        Assert.Equal("application/json", mediaType);
        using var document = JsonDocument.Parse(body);
        Assert.Equal(JsonValueKind.Object, document.RootElement.ValueKind);
        var property = Assert.Single(document.RootElement.EnumerateObject());
        Assert.Equal("error", property.Name);
        Assert.Equal(JsonValueKind.String, property.Value.ValueKind);
        Assert.False(string.IsNullOrWhiteSpace(property.Value.GetString()));
    }

    private static string[] PropertyNames(JsonElement element) =>
        element.EnumerateObject()
            .Select(property => property.Name)
            .Order(StringComparer.Ordinal)
            .ToArray();

    private static string UniqueUsername(string prefix) =>
        $"{prefix}_{Guid.NewGuid():N}";
}
