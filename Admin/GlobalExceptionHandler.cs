using Microsoft.AspNetCore.Diagnostics;

namespace MyProject2.Admin;

public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (httpContext.Response.HasStarted)
        {
            return false;
        }

        if (exception is BadHttpRequestException badRequestException)
        {
            _logger.LogWarning(
                "Rejected malformed request {Method} {Path}. Trace identifier: {TraceIdentifier}",
                httpContext.Request.Method,
                httpContext.Request.Path,
                httpContext.TraceIdentifier);

            httpContext.Response.StatusCode = badRequestException.StatusCode;
            httpContext.Response.ContentType = "application/json";

            await httpContext.Response.WriteAsJsonAsync(
                new { error = "Некорректный запрос." },
                cancellationToken);

            return true;
        }

        _logger.LogError(
            exception,
            "Unhandled exception while processing {Method} {Path}. Trace identifier: {TraceIdentifier}",
            httpContext.Request.Method,
            httpContext.Request.Path,
            httpContext.TraceIdentifier);

        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;
        httpContext.Response.ContentType = "application/json";

        await httpContext.Response.WriteAsJsonAsync(
            new { error = "Внутренняя ошибка сервера." },
            cancellationToken);

        return true;
    }
}
