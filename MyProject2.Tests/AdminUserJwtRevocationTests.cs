using System.Net;
using System.Net.Http.Json;

namespace MyProject2.Tests;

[Collection(PostgreSqlIntegrationCollection.Name)]
public sealed class AdminUserJwtRevocationTests(PostgreSqlIntegrationFixture fixture)
{
    [Fact]
    public async Task PreviouslyIssuedJwt_ReturnsUnauthorized_AfterRoleChange()
    {
        var session = await CreateUserSessionAsync("role");
        await AssertTokenAcceptedAsync(session);

        await UpdateUserAsync(session.User with { Role = "Editor" });

        await AssertTokenRejectedAsync(session);
    }

    [Fact]
    public async Task PreviouslyIssuedJwt_ReturnsUnauthorized_AfterUserIsDisabled()
    {
        var session = await CreateUserSessionAsync("disabled");
        await AssertTokenAcceptedAsync(session);

        await UpdateUserAsync(session.User with { IsActive = false });

        await AssertTokenRejectedAsync(session);
    }

    [Fact]
    public async Task PreviouslyIssuedJwt_ReturnsUnauthorized_AfterPasswordChange()
    {
        var session = await CreateUserSessionAsync("password");
        await AssertTokenAcceptedAsync(session);

        await UpdateUserAsync(session.User, fixture.CreatePassword());

        await AssertTokenRejectedAsync(session);
    }

    [Fact]
    public async Task PreviouslyIssuedJwt_RemainsValid_AfterUsernameAndEmailChange()
    {
        var session = await CreateUserSessionAsync("profile");
        await AssertTokenAcceptedAsync(session);
        var suffix = Guid.NewGuid().ToString("N")[..12];
        var updatedUser = session.User with
        {
            Username = $"jwt_renamed_{suffix}",
            Email = $"jwt_renamed_{suffix}@example.test"
        };

        await UpdateUserAsync(updatedUser);

        using var response = await SendAuthenticatedGetAsync(session);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var actualUser = await response.Content.ReadFromJsonAsync<TestUser>();
        Assert.Equal(updatedUser, actualUser);
    }

    private async Task<TestSession> CreateUserSessionAsync(string scenario)
    {
        var username = $"jwt_{scenario}_{Guid.NewGuid():N}";
        var password = fixture.CreatePassword();
        var user = await fixture.CreateUserAsync(username, "Viewer", password);
        return await fixture.LoginAsync(user.Username, password);
    }

    private async Task UpdateUserAsync(TestUser user, string password = "")
    {
        using var request = fixture.CreateAuthorizedRequest(
            HttpMethod.Put,
            $"/admin/users/{user.Id}",
            fixture.Administrator.Token,
            new
            {
                user.Username,
                user.Email,
                user.IsActive,
                user.Role,
                password
            });
        using var response = await fixture.Client.SendAsync(request);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    private async Task AssertTokenAcceptedAsync(TestSession session)
    {
        using var response = await SendAuthenticatedGetAsync(session);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    private async Task AssertTokenRejectedAsync(TestSession session)
    {
        using var response = await SendAuthenticatedGetAsync(session);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private async Task<HttpResponseMessage> SendAuthenticatedGetAsync(TestSession session)
    {
        using var request = fixture.CreateAuthorizedRequest(
            HttpMethod.Get,
            $"/admin/users/{session.User.Id}",
            session.Token);
        return await fixture.Client.SendAsync(request);
    }
}
