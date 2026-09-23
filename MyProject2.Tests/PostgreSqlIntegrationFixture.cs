using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace MyProject2.Tests;

[CollectionDefinition(Name, DisableParallelization = true)]
public sealed class PostgreSqlIntegrationCollection : ICollectionFixture<PostgreSqlIntegrationFixture>
{
    public const string Name = "PostgreSQL integration";
}

public sealed class PostgreSqlIntegrationFixture : IAsyncLifetime
{
    private const string ConnectionEnvironmentVariable = "MINICRM_TEST_POSTGRES_CONNECTION";
    private const string MaintenanceDatabase = "postgres";
    private const string ForbiddenDatabase = "adminpanel";
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private WebApplicationFactory<Program>? _factory;
    private NpgsqlConnectionStringBuilder? _maintenanceConnection;
    private string? _testDatabaseName;

    public HttpClient Client { get; private set; } = null!;
    public TestSession Administrator { get; private set; } = null!;
    public TestSession Editor { get; private set; } = null!;
    public TestSession Viewer { get; private set; } = null!;
    public TestUser TargetUser { get; private set; } = null!;
    public string TargetUserPassword { get; private set; } = string.Empty;

    public async Task InitializeAsync()
    {
        try
        {
            _maintenanceConnection = GetMaintenanceConnection();
            var uniqueSuffix = Guid.NewGuid().ToString("N")[..16];
            _testDatabaseName =
                $"mini_crm_auth_tests_{DateTime.UtcNow:yyyyMMdd_HHmmss}_{uniqueSuffix}";

            await CreateTestDatabaseAsync();

            var testConnection = new NpgsqlConnectionStringBuilder(_maintenanceConnection.ConnectionString)
            {
                Database = _testDatabaseName,
                IncludeErrorDetail = false
            };

            await AssertCurrentDatabaseAsync(testConnection.ConnectionString, _testDatabaseName);

            var administratorPassword = CreatePassword();
            var editorPassword = CreatePassword();
            var viewerSeedPassword = CreatePassword();
            var jwtSecret = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48));
            var settings = new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = testConnection.ConnectionString,
                ["Jwt:Issuer"] = "MyProject2.Tests",
                ["Jwt:Audience"] = "MyProject2.Tests",
                ["Jwt:SecretKey"] = jwtSecret,
                ["Jwt:ExpireMinutes"] = "15",
                ["SeedUsers:SuperAdminPassword"] = administratorPassword,
                ["SeedUsers:EditorPassword"] = editorPassword,
                ["SeedUsers:ViewerPassword"] = viewerSeedPassword
            };

            _factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Testing");
                foreach (var setting in settings)
                {
                    builder.UseSetting(setting.Key, setting.Value);
                }

                builder.ConfigureAppConfiguration((_, configuration) =>
                    configuration.AddInMemoryCollection(settings));
                builder.ConfigureLogging(logging => logging.ClearProviders());
            });

            Client = _factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false,
                BaseAddress = new Uri("https://localhost")
            });

            await AssertCurrentDatabaseAsync(testConnection.ConnectionString, _testDatabaseName);
            await AssertExpectedMigrationAsync(testConnection.ConnectionString);

            Administrator = await LoginAsync("superadmin", administratorPassword);
            Editor = await LoginAsync("jdoe", editorPassword);

            var viewerPassword = CreatePassword();
            var viewer = await CreateUserAsync("authorization_viewer", "Viewer", viewerPassword);
            Viewer = await LoginAsync(viewer.Username, viewerPassword);

            TargetUserPassword = CreatePassword();
            TargetUser = await CreateUserAsync(
                "authorization_target",
                "Viewer",
                TargetUserPassword);
        }
        catch
        {
            await DisposeApplicationAsync();
            await DropTestDatabaseAsync();
            throw;
        }
    }

    public async Task DisposeAsync()
    {
        await DisposeApplicationAsync();
        await DropTestDatabaseAsync();
    }

    public string CreatePassword() =>
        $"T!{Convert.ToBase64String(RandomNumberGenerator.GetBytes(24))}";

    public HttpRequestMessage CreateAuthorizedRequest(
        HttpMethod method,
        string path,
        string token,
        object? body = null)
    {
        var request = new HttpRequestMessage(method, path);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        if (body is not null)
        {
            request.Content = JsonContent.Create(body);
        }

        return request;
    }

    public async Task<TestSession> LoginAsync(string username, string password)
    {
        using var response = await Client.PostAsJsonAsync("/auth/login", new { username, password });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var login = await response.Content.ReadFromJsonAsync<LoginResponse>(JsonOptions);
        Assert.NotNull(login);
        Assert.False(string.IsNullOrWhiteSpace(login.Token));
        return new TestSession(login.Token, login.User);
    }

    public async Task<TestUser> GetUserAsync(Guid id)
    {
        using var request = CreateAuthorizedRequest(
            HttpMethod.Get,
            $"/admin/users/{id}",
            Administrator.Token);
        using var response = await Client.SendAsync(request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var user = await response.Content.ReadFromJsonAsync<TestUser>(JsonOptions);
        return Assert.IsType<TestUser>(user);
    }

    public async Task<TestUser> CreateUserAsync(string username, string role, string password)
    {
        using var request = CreateAuthorizedRequest(
            HttpMethod.Post,
            "/admin/users",
            Administrator.Token,
            new
            {
                username,
                email = $"{username}@example.test",
                role,
                password
            });
        using var response = await Client.SendAsync(request);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var user = await response.Content.ReadFromJsonAsync<TestUser>(JsonOptions);
        return Assert.IsType<TestUser>(user);
    }

    private static NpgsqlConnectionStringBuilder GetMaintenanceConnection()
    {
        var value = Environment.GetEnvironmentVariable(ConnectionEnvironmentVariable);
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new InvalidOperationException(
                $"Environment variable '{ConnectionEnvironmentVariable}' is required for integration tests.");
        }

        var builder = new NpgsqlConnectionStringBuilder(value)
        {
            IncludeErrorDetail = false,
            Pooling = false
        };

        if (!string.Equals(builder.Database, MaintenanceDatabase, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(builder.Database, ForbiddenDatabase, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                $"Integration tests require the maintenance database '{MaintenanceDatabase}'.");
        }

        return builder;
    }

    private async Task CreateTestDatabaseAsync()
    {
        Assert.NotNull(_maintenanceConnection);
        Assert.NotNull(_testDatabaseName);
        AssertSafeTestDatabaseName(_testDatabaseName);

        await AssertCurrentDatabaseAsync(
            _maintenanceConnection.ConnectionString,
            MaintenanceDatabase);

        await using var connection = new NpgsqlConnection(_maintenanceConnection.ConnectionString);
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = $"CREATE DATABASE \"{_testDatabaseName}\"";
        await command.ExecuteNonQueryAsync();
    }

    private async Task DropTestDatabaseAsync()
    {
        if (_maintenanceConnection is null || _testDatabaseName is null)
        {
            return;
        }

        AssertSafeTestDatabaseName(_testDatabaseName);
        NpgsqlConnection.ClearAllPools();
        await AssertCurrentDatabaseAsync(
            _maintenanceConnection.ConnectionString,
            MaintenanceDatabase);

        await using var connection = new NpgsqlConnection(_maintenanceConnection.ConnectionString);
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = $"DROP DATABASE IF EXISTS \"{_testDatabaseName}\" WITH (FORCE)";
        await command.ExecuteNonQueryAsync();
    }

    private static async Task AssertCurrentDatabaseAsync(
        string connectionString,
        string expectedDatabase)
    {
        if (string.Equals(expectedDatabase, ForbiddenDatabase, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("The working database is forbidden for integration tests.");
        }

        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand("SELECT current_database()", connection);
        var actualDatabase = (string?)await command.ExecuteScalarAsync();

        if (!string.Equals(actualDatabase, expectedDatabase, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("The PostgreSQL database safety check failed.");
        }
    }

    private static async Task AssertExpectedMigrationAsync(string connectionString)
    {
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand(
            """
            SELECT COUNT(*)
            FROM "__EFMigrationsHistory"
            WHERE "MigrationId" = '20260922000000_AddAdminUserTokenVersion'
            """,
            connection);
        var count = (long)(await command.ExecuteScalarAsync() ?? 0L);

        if (count != 1)
        {
            throw new InvalidOperationException("The expected test migration was not applied.");
        }
    }

    private static void AssertSafeTestDatabaseName(string databaseName)
    {
        if (string.Equals(databaseName, ForbiddenDatabase, StringComparison.OrdinalIgnoreCase) ||
            !databaseName.StartsWith("mini_crm_auth_tests_", StringComparison.Ordinal) ||
            databaseName.Any(character =>
                !char.IsAsciiLetterOrDigit(character) && character != '_'))
        {
            throw new InvalidOperationException("Unsafe integration test database name.");
        }
    }

    private async Task DisposeApplicationAsync()
    {
        Client?.Dispose();

        if (_factory is not null)
        {
            await _factory.DisposeAsync();
            _factory = null;
        }
    }
}

public sealed record TestSession(string Token, TestUser User);

public sealed record LoginResponse(string Token, TestUser User);

public sealed record TestUser(
    Guid Id,
    string Username,
    string Email,
    bool IsActive,
    string Role);
