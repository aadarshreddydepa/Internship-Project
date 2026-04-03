using System.Net;
using System.Text.Json;
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly IWebHostEnvironment _env;

    public ExceptionMiddleware(
        RequestDelegate next,
        ILogger<ExceptionMiddleware> logger,
        IWebHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var statusCode = GetStatusCode(ex);
        var traceId = context.TraceIdentifier;

        // Structured logging (VERY IMPORTANT for production)
        LogException(ex, statusCode, traceId);

        var response = new
        {
            success = false,
            statusCode = (int)statusCode,
            message = GetSafeMessage(ex, statusCode),
            traceId = traceId, 
            details = _env.IsDevelopment() ? ex.ToString() : null
        };

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
    }

    // Centralized status code mapping
    private static HttpStatusCode GetStatusCode(Exception ex)
    {
        return ex switch
        {
            ArgumentException => HttpStatusCode.BadRequest,
            InvalidOperationException => HttpStatusCode.BadRequest,
            UnauthorizedAccessException => HttpStatusCode.Unauthorized,
            KeyNotFoundException => HttpStatusCode.NotFound,
            _ => HttpStatusCode.InternalServerError
        };
    }

    // Clean logging strategy
    private void LogException(Exception ex, HttpStatusCode statusCode, string traceId)
    {
        if ((int)statusCode >= 500)
        {
            _logger.LogError(ex, "Server Error | TraceId: {TraceId}", traceId);
        }
        else
        {
            _logger.LogWarning(ex, "Client Error | TraceId: {TraceId}", traceId);
        }
    }

    //Safe message control (VERY IMPORTANT)
    private string GetSafeMessage(Exception ex, HttpStatusCode statusCode)
    {
        if (_env.IsDevelopment())
            return ex.Message;

        return statusCode switch
        {
            HttpStatusCode.BadRequest => "Invalid request",
            HttpStatusCode.Unauthorized => "Unauthorized access",
            HttpStatusCode.NotFound => "Resource not found",
            _ => "An unexpected error occurred"
        };
    }
}