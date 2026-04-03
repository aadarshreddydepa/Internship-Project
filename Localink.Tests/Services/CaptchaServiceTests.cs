using Xunit;
using Moq;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using FluentAssertions;

namespace Localink.Tests.Services
{
    public class CaptchaServiceTests
    {
        [Fact]
        public async Task VerifyAsync_ReturnsFalse_WhenTokenIsEmpty()
        {
            // Arrange
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    { "Captcha:SecretKey", "secret" }
                })
                .Build();

            var httpClient = new HttpClient(new FakeHttpHandler(HttpStatusCode.OK, "{\"success\":true}"));
            var service = new CaptchaService(config, httpClient);

            // Act
            var result = await service.VerifyAsync("");

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task VerifyAsync_ReturnsFalse_WhenTokenIsNull()
        {
            // Arrange
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    { "Captcha:SecretKey", "secret" }
                })
                .Build();

            var httpClient = new HttpClient(new FakeHttpHandler(HttpStatusCode.OK, "{\"success\":true}"));
            var service = new CaptchaService(config, httpClient);

            // Act
            var result = await service.VerifyAsync(null!);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task VerifyAsync_ReturnsFalse_WhenSecretKeyMissing()
        {
            // Arrange
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>())
                .Build();

            var httpClient = new HttpClient(new FakeHttpHandler(HttpStatusCode.OK, "{\"success\":true}"));
            var service = new CaptchaService(config, httpClient);

            // Act
            var result = await service.VerifyAsync("some-token");

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task VerifyAsync_ReturnsTrue_WhenGoogleReturnsSuccess()
        {
            // Arrange
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    { "Captcha:SecretKey", "secret" }
                })
                .Build();

            var httpClient = new HttpClient(new FakeHttpHandler(HttpStatusCode.OK, "{\"success\":true}"));
            var service = new CaptchaService(config, httpClient);

            // Act
            var result = await service.VerifyAsync("valid-token");

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public async Task VerifyAsync_ReturnsFalse_WhenGoogleReturnsFail()
        {
            // Arrange
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    { "Captcha:SecretKey", "secret" }
                })
                .Build();

            var httpClient = new HttpClient(new FakeHttpHandler(HttpStatusCode.OK, "{\"success\":false}"));
            var service = new CaptchaService(config, httpClient);

            // Act
            var result = await service.VerifyAsync("invalid-token");

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task VerifyAsync_ReturnsFalse_WhenHttpFails()
        {
            // Arrange
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    { "Captcha:SecretKey", "secret" }
                })
                .Build();

            var httpClient = new HttpClient(new FakeHttpHandler(HttpStatusCode.InternalServerError, ""));
            var service = new CaptchaService(config, httpClient);

            // Act
            var result = await service.VerifyAsync("some-token");

            // Assert
            result.Should().BeFalse();
        }
    }

    /// <summary>
    /// A fake HTTP message handler for testing HttpClient calls without hitting the network.
    /// </summary>
    internal class FakeHttpHandler : HttpMessageHandler
    {
        private readonly HttpStatusCode _statusCode;
        private readonly string _content;

        public FakeHttpHandler(HttpStatusCode statusCode, string content)
        {
            _statusCode = statusCode;
            _content = content;
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            return Task.FromResult(new HttpResponseMessage(_statusCode)
            {
                Content = new StringContent(_content)
            });
        }
    }
}
