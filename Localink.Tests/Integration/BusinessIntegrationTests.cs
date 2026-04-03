using System.Net;
using System.Net.Http.Json;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Integration
{
    public class BusinessIntegrationTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory _factory;

        public BusinessIntegrationTests(CustomWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();

            // Seed categories + subcategories
            factory.SeedDatabase(db =>
            {
                if (!db.Categories.Any())
                {
                    db.Categories.Add(new Category { CategoryId = 100, CategoryName = "Food", IconUrl = "i.png" });
                    db.Subcategories.Add(new Subcategory { SubcategoryId = 100, CategoryId = 100, SubcategoryName = "Fast Food" });
                    db.SaveChanges();
                }
            });
        }

        private async Task<(string Token, string Email)> RegisterClientAndGetToken()
        {
            var email = $"biz_{Guid.NewGuid():N}@test.com";
            var request = new RegisterRequest
            {
                UserType = "client", Name = "Biz Owner",
                Email = email,
                Phone = $"98765{Random.Shared.Next(10000, 99999)}",
                CountryCode = "+91", Password = "SecurePass1",
                Country = "India", State = "TS", City = "Hyd"
            };
            await _client.PostAsJsonAsync("/api/v1/auth/register", request);

            var login = new LoginRequest
            {
                UsernameOrEmail = email, Password = "SecurePass1", CaptchaToken = "mock"
            };
            var resp = await _client.PostAsJsonAsync("/api/v1/auth/sessions", login);
            var body = await resp.Content.ReadFromJsonAsync<JsonElement>();
            return (body.GetProperty("data").GetProperty("token").GetString()!, email);
        }

        [Fact]
        public async Task GetAllBusinesses_ReturnsOk()
        {
            var response = await _client.GetAsync("/api/v1/business");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task GetBusinessById_NonExistent_Returns404()
        {
            var response = await _client.GetAsync("/api/v1/business/99999");
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task RegisterBusiness_Authenticated_ReturnsOk()
        {
            var (token, _) = await RegisterClientAndGetToken();

            var dto = new RegisterBusinessDto
            {
                BusinessName = "Test Restaurant",
                Description = "A lovely restaurant for testing",
                CategoryId = 100, SubcategoryId = 100,
                PhoneCode = "+91", PhoneNumber = "9876543210",
                Email = "rest@test.com", Website = "test.com",
                Address = "123 Street", City = "Hyd", State = "TS",
                Country = "India", Pincode = "500001",
                Hours = new List<DayHoursDto>
                {
                    new DayHoursDto { DayOfWeek = "Monday", Mode = "24h", Slots = new List<TimeSlotDto>() }
                }
            };

            var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/business/register");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Content = JsonContent.Create(dto);
            var response = await _client.SendAsync(request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var body = await response.Content.ReadFromJsonAsync<JsonElement>();
            body.GetProperty("success").GetBoolean().Should().BeTrue();
            body.GetProperty("businessId").GetInt64().Should().BeGreaterThan(0);
        }

        [Fact]
        public async Task RegisterBusiness_Unauthenticated_Returns401()
        {
            var dto = new RegisterBusinessDto
            {
                BusinessName = "Test", Description = "A test business",
                CategoryId = 100, SubcategoryId = 100
            };
            var response = await _client.PostAsJsonAsync("/api/v1/business/register", dto);
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task SearchBusinesses_ReturnsOk()
        {
            var response = await _client.GetAsync("/api/v1/business/search?query=test");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task GetMyBusinesses_Unauthenticated_Returns401()
        {
            var response = await _client.GetAsync("/api/v1/business/my-businesses");
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
    }
}
