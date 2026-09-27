using System.Net;
using System.Net.Http.Json;

namespace MyProject2.Tests;

[Collection(PostgreSqlIntegrationCollection.Name)]
public sealed class AdminUsersAuthorizationTests(PostgreSqlIntegrationFixture fixture)
{
    [Fact]
    public async Task Viewer_CannotUpdateUsers()
    {
        var targetBefore = await fixture.GetUserAsync(fixture.TargetUser.Id);
        using var request = fixture.CreateAuthorizedRequest(
            HttpMethod.Put,
            $"/admin/users/{targetBefore.Id}",
            fixture.Viewer.Token,
            new
            {
                username = $"{targetBefore.Username}_changed",
                targetBefore.Email,
                targetBefore.IsActive,
                targetBefore.Role,
                password = ""
            });

        using var response = await fixture.Client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Equal(targetBefore, await fixture.GetUserAsync(targetBefore.Id));
    }

    [Fact]
    public async Task Editor_CannotCreateAdministrator()
    {
        var username = $"blocked_admin_{Guid.NewGuid():N}";
        using var request = fixture.CreateAuthorizedRequest(
            HttpMethod.Post,
            "/admin/users",
            fixture.Editor.Token,
            new
            {
                username,
                email = $"{username}@example.test",
                role = "Administrator",
                password = fixture.CreatePassword()
            });

        using var response = await fixture.Client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        using var usersRequest = fixture.CreateAuthorizedRequest(
            HttpMethod.Get,
            "/admin/users",
            fixture.Administrator.Token);
        using var usersResponse = await fixture.Client.SendAsync(usersRequest);
        Assert.Equal(HttpStatusCode.OK, usersResponse.StatusCode);
        var users = await usersResponse.Content.ReadFromJsonAsync<TestUser[]>();
        Assert.DoesNotContain(users ?? [], user => user.Username == username);
    }

    [Fact]
    public async Task Editor_CannotChangeAnotherUsersPassword()
    {
        var targetBefore = await fixture.GetUserAsync(fixture.TargetUser.Id);
        var rejectedPassword = fixture.CreatePassword();
        using var request = fixture.CreateAuthorizedRequest(
            HttpMethod.Put,
            $"/admin/users/{targetBefore.Id}",
            fixture.Editor.Token,
            new
            {
                targetBefore.Username,
                targetBefore.Email,
                targetBefore.IsActive,
                targetBefore.Role,
                password = rejectedPassword
            });

        using var response = await fixture.Client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        var currentLogin = await fixture.LoginAsync(
            targetBefore.Username,
            fixture.TargetUserPassword);
        Assert.Equal(targetBefore.Id, currentLogin.User.Id);
        using var rejectedLogin = await fixture.Client.PostAsJsonAsync(
            "/auth/login",
            new { username = targetBefore.Username, password = rejectedPassword });
        Assert.Equal(HttpStatusCode.Unauthorized, rejectedLogin.StatusCode);
    }

    [Fact]
    public async Task Editor_CannotChangeAnotherUsersRole()
    {
        var targetBefore = await fixture.GetUserAsync(fixture.TargetUser.Id);
        using var request = fixture.CreateAuthorizedRequest(
            HttpMethod.Put,
            $"/admin/users/{targetBefore.Id}",
            fixture.Editor.Token,
            new
            {
                targetBefore.Username,
                targetBefore.Email,
                targetBefore.IsActive,
                role = "Editor",
                password = ""
            });

        using var response = await fixture.Client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        var targetAfter = await fixture.GetUserAsync(targetBefore.Id);
        Assert.Equal("Viewer", targetAfter.Role);
    }

    [Fact]
    public async Task Administrator_CannotDeleteSelf()
    {
        using var request = fixture.CreateAuthorizedRequest(
            HttpMethod.Delete,
            $"/admin/users/{fixture.Administrator.User.Id}",
            fixture.Administrator.Token);

        using var response = await fixture.Client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        var administrator = await fixture.GetUserAsync(fixture.Administrator.User.Id);
        Assert.Equal("Administrator", administrator.Role);
    }
}
