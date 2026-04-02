using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Integration
{
    public class AuthIntegrationTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory _factory;

        public AuthIntegrationTests(CustomWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        private RegisterRequest ValidRegisterRequest() => new()
        {
            UserType = "user",
            Name = "Integration User",
            Email = $"integ_{Guid.NewGuid():N}@test.com",
            Phone = $"98765{Random.Shared.Next(10000, 99999)}",
            CountryCode = "+91",
            Password = "SecurePass1",
            Country = "India",
            State = "Telangana",
            City = "Hyderabad",
            Street = "123 Main St",
            Pincode = "500001"
        };

        [Fact]
        public async Task Register_ReturnsOk_WithValidData()
        {
            var request = ValidRegisterRequest();
            var response = await _client.PostAsJsonAsync("/api/v1/auth/register", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var body = await response.Content.ReadFromJsonAsync<JsonElement>();
            body.GetProperty("message").GetString().Should().Contain("registered");
        }

        [Fact]
        public async Task Register_DuplicateEmail_ReturnsError()
        {
            var request = ValidRegisterRequest();
            var email = request.Email;

            // First registration
            await _client.PostAsJsonAsync("/api/v1/auth/register", request);

            // Second with same email — InvalidOperationException → 500 via ExceptionMiddleware
            var request2 = ValidRegisterRequest();
            request2.Email = email;
            var response = await _client.PostAsJsonAsync("/api/v1/auth/register", request2);

            response.IsSuccessStatusCode.Should().BeFalse();
        }

        [Fact]
        public async Task Login_ReturnsOk_WithValidCredentials()
        {
            // Arrange: register first
            var request = ValidRegisterRequest();
            await _client.PostAsJsonAsync("/api/v1/auth/register", request);

            // Act: login via /api/v1/auth/sessions
            var loginRequest = new LoginRequest
            {
                UsernameOrEmail = request.Email,
                Password = request.Password,
                CaptchaToken = "mock-token"
            };
            var response = await _client.PostAsJsonAsync("/api/v1/auth/sessions", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var body = await response.Content.ReadFromJsonAsync<JsonElement>();
            body.GetProperty("data").GetProperty("token").GetString().Should().NotBeNullOrEmpty();
        }

        [Fact]
        public async Task Login_InvalidCredentials_ReturnsError()
        {
            var loginRequest = new LoginRequest
            {
                UsernameOrEmail = "nobody@test.com",
                Password = "WrongPassword1",
                CaptchaToken = "mock-token"
            };
            var response = await _client.PostAsJsonAsync("/api/v1/auth/sessions", loginRequest);

            response.IsSuccessStatusCode.Should().BeFalse();
        }

        [Fact]
        public async Task SendOtp_ReturnsOk()
        {
            // Arrange: register first
            var request = ValidRegisterRequest();
            await _client.PostAsJsonAsync("/api/v1/auth/register", request);

            // Act: OTP via /api/v1/auth/forgot-password
            var otpRequest = new SendOtpRequest { Email = request.Email, CaptchaToken = "mock-token" };
            var response = await _client.PostAsJsonAsync("/api/v1/auth/forgot-password", otpRequest);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }
    }
}
