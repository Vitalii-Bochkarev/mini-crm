using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace MyProject2.Admin;

internal sealed class PostgreSqlHealthCheck(AdminDbContext dbContext) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Database.CanConnectAsync(cancellationToken)
            ? HealthCheckResult.Healthy()
            : HealthCheckResult.Unhealthy();
    }
}
