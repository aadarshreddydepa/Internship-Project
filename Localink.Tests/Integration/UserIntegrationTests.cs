using System.Net;
using System.Net.Http.Json;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Integration
{
    public class UserIntegrationTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory _factory;

        public UserIntegrationTests(CustomWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        private async Task<string> RegisterAndGetToken()
        {
            var request = new RegisterRequest
            {
                UserType = "user",
                Name = "Test User",
                Email = $"user_{Guid.NewGuid():N}@test.com",
                Phone = $"98765{Random.Shared.Next(10000, 99999)}",
                CountryCode = "+91",
                Password = "SecurePass1",
                Country = "India",
                State = "Telangana",
                City = "Hyderabad"
            };

            await _client.PostAsJsonAsync("/api/v1/auth/register", request);

            var login = new LoginRequest
            {
                UsernameOrEmail = request.Email,
                Password = "SecurePass1",
                CaptchaToken = "mock-token"
            };
            var loginResponse = await _client.PostAsJsonAsync("/api/v1/auth/sessions", login);
            var body = await loginResponse.Content.ReadFromJsonAsync<JsonElement>();
            return body.GetProperty("data").GetProperty("token").GetString()!;
        }

        [Fact]
        public async Task GetProfile_Unauthenticated_Returns401()
        {
            var response = await _client.GetAsync("/api/v1/user/profile");
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task GetProfile_Authenticated_ReturnsOk()
        {
            var token = await RegisterAndGetToken();

            var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/user/profile");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var response = await _client.SendAsync(request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var body = await response.Content.ReadFromJsonAsync<JsonElement>();
            body.GetProperty("fullName").GetString().Should().Be("Test User");
        }

        [Fact]
        public async Task UpdateProfile_Authenticated_ReturnsOk()
        {
            var token = await RegisterAndGetToken();

            var dto = new UpdateUserProfileDto
            {
                FullName = "Updated Name",
                Phone = "9123456789",
                Address = new AddressDto
                {
                    Street = "456 Elm St",
                    City = "Mumbai",
                    State = "Maharashtra",
                    Country = "India",
                    Pincode = "400001"
                }
            };

            var request = new HttpRequestMessage(HttpMethod.Put, "/api/v1/user/profile");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Content = JsonContent.Create(dto);
            var response = await _client.SendAsync(request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task VerifyEmail_ExistingEmail_ReturnsOk()
        {
            var regRequest = new RegisterRequest
            {
                UserType = "user", Name = "Email Test",
                Email = $"emailcheck_{Guid.NewGuid():N}@test.com",
                Phone = $"97654{Random.Shared.Next(10000, 99999)}",
                CountryCode = "+91", Password = "SecurePass1",
                Country = "India", State = "TS", City = "Hyd"
            };
            await _client.PostAsJsonAsync("/api/v1/auth/register", regRequest);

            var response = await _client.GetAsync($"/api/v1/user/email?value={regRequest.Email}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var body = await response.Content.ReadFromJsonAsync<JsonElement>();
            body.GetProperty("message").GetString().Should().Contain("exists");
        }

        [Fact]
        public async Task UpdateProfile_Unauthenticated_Returns401()
        {
            var dto = new UpdateUserProfileDto
            {
                FullName = "Hacker", Address = new AddressDto()
            };
            var response = await _client.PutAsJsonAsync("/api/v1/user/profile", dto);
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
    }
}
