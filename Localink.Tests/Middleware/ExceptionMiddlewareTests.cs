using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Middleware
{
    public class ExceptionMiddlewareTests
    {
        private readonly Mock<ILogger<ExceptionMiddleware>> _mockLogger;

        public ExceptionMiddlewareTests()
        {
            _mockLogger = new Mock<ILogger<ExceptionMiddleware>>();
        }

        private (ExceptionMiddleware middleware, DefaultHttpContext context) CreateMiddleware(RequestDelegate next)
        {
            var middleware = new ExceptionMiddleware(next, _mockLogger.Object);
            var context = new DefaultHttpContext();
            context.Response.Body = new MemoryStream();
            return (middleware, context);
        }

        private async Task<JsonDocument> ReadResponseBody(HttpContext context)
        {
            context.Response.Body.Seek(0, SeekOrigin.Begin);
            var body = await new StreamReader(context.Response.Body).ReadToEndAsync();
            return JsonDocument.Parse(body);
        }

        [Fact]
        public async Task InvokeAsync_PassesThrough_WhenNoException()
        {
            // Arrange
            var (middleware, context) = CreateMiddleware(_ => Task.CompletedTask);

            // Act
            await middleware.InvokeAsync(context);

            // Assert — status code not modified (default 200)
            context.Response.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task InvokeAsync_Returns400_ForArgumentException()
        {
            // Arrange
            var (middleware, context) = CreateMiddleware(_ => throw new ArgumentException("Bad input"));

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            context.Response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
            context.Response.ContentType.Should().Be("application/json");

            var doc = await ReadResponseBody(context);
            doc.RootElement.GetProperty("success").GetBoolean().Should().BeFalse();
            doc.RootElement.GetProperty("message").GetString().Should().Be("Bad input");
        }

        [Fact]
        public async Task InvokeAsync_Returns404_ForKeyNotFoundException()
        {
            // Arrange
            var (middleware, context) = CreateMiddleware(_ => throw new KeyNotFoundException("Not found"));

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            context.Response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
            var doc = await ReadResponseBody(context);
            doc.RootElement.GetProperty("message").GetString().Should().Be("Not found");
        }

        [Fact]
        public async Task InvokeAsync_Returns500_ForGenericException()
        {
            // Arrange
            var (middleware, context) = CreateMiddleware(_ => throw new Exception("Something broke"));

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            context.Response.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError);
            var doc = await ReadResponseBody(context);
            doc.RootElement.GetProperty("message").GetString().Should().Be("Something went wrong");
            doc.RootElement.GetProperty("error").GetString().Should().Be("Something broke");
        }

        [Fact]
        public async Task InvokeAsync_ResponseBody_HasCorrectJsonStructure()
        {
            // Arrange
            var (middleware, context) = CreateMiddleware(_ => throw new ArgumentException("test"));

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            var doc = await ReadResponseBody(context);
            doc.RootElement.TryGetProperty("success", out _).Should().BeTrue();
            doc.RootElement.TryGetProperty("message", out _).Should().BeTrue();
        }
    }
}
