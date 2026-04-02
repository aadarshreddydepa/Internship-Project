using System.Net;
using System.Net.Http.Json;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Integration
{
    public class AdminIntegrationTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory _factory;

        public AdminIntegrationTests(CustomWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        private async Task<string> RegisterAdminAndGetToken()
        {
            var email = $"admin_{Guid.NewGuid():N}@test.com";
            var request = new RegisterRequest
            {
                UserType = "admin", Name = "Admin User",
                Email = email,
                Phone = $"98765{Random.Shared.Next(10000, 99999)}",
                CountryCode = "+91", Password = "AdminPass1",
                Country = "India", State = "TS", City = "Hyd"
            };
            await _client.PostAsJsonAsync("/api/v1/auth/register", request);

            var login = new LoginRequest
            {
                UsernameOrEmail = email, Password = "AdminPass1", CaptchaToken = "mock"
            };
            var resp = await _client.PostAsJsonAsync("/api/v1/auth/sessions", login);
            var body = await resp.Content.ReadFromJsonAsync<JsonElement>();
            return body.GetProperty("data").GetProperty("token").GetString()!;
        }

        [Fact]
        public async Task GetAllBusinesses_Unauthenticated_Returns401()
        {
            var response = await _client.GetAsync("/api/v1/admin/businesses");
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task GetAllBusinesses_NonAdminRole_Returns403()
        {
            // Register a normal user (not admin)
            var email = $"user_{Guid.NewGuid():N}@test.com";
            var request = new RegisterRequest
            {
                UserType = "user", Name = "Regular User",
                Email = email,
                Phone = $"97654{Random.Shared.Next(10000, 99999)}",
                CountryCode = "+91", Password = "UserPass1",
                Country = "India", State = "TS", City = "Hyd"
            };
            await _client.PostAsJsonAsync("/api/v1/auth/register", request);

            var login = new LoginRequest { UsernameOrEmail = email, Password = "UserPass1", CaptchaToken = "mock" };
            var loginResp = await _client.PostAsJsonAsync("/api/v1/auth/sessions", login);
            var body = await loginResp.Content.ReadFromJsonAsync<JsonElement>();
            var token = body.GetProperty("data").GetProperty("token").GetString()!;

            var req = new HttpRequestMessage(HttpMethod.Get, "/api/v1/admin/businesses");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var response = await _client.SendAsync(req);

            response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        }

        [Fact]
        public async Task GetAllBusinesses_AdminRole_ReturnsOk()
        {
            var token = await RegisterAdminAndGetToken();

            var req = new HttpRequestMessage(HttpMethod.Get, "/api/v1/admin/businesses");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var response = await _client.SendAsync(req);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task Export_AdminRole_ReturnsExcelFile()
        {
            var token = await RegisterAdminAndGetToken();

            // Seed an AdminDashboard entry
            _factory.SeedDatabase(db =>
            {
                if (!db.Categories.Any(c => c.CategoryId == 200))
                {
                    db.Categories.Add(new Category { CategoryId = 200, CategoryName = "Services", IconUrl = "s.png" });
                    db.Subcategories.Add(new Subcategory { SubcategoryId = 200, CategoryId = 200, SubcategoryName = "Cleaning" });
                    db.SaveChanges();
                }

                var biz = new Business
                {
                    BusinessName = "Export Test Biz", Description = "A business for export testing",
                    CategoryId = 200, SubcategoryId = 200, UserId = 1,
                    CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                };
                db.Businesses.Add(biz);
                db.SaveChanges();

                db.AdminDashboards.Add(new AdminDashboard
                {
                    BusinessId = biz.BusinessId,
                    Status = BusinessStatus.Pending,
                    CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                });
                db.SaveChanges();
            });

            var req = new HttpRequestMessage(HttpMethod.Get, "/api/v1/admin/export?status=Pending");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var response = await _client.SendAsync(req);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.Content.Headers.ContentType!.MediaType.Should().Be(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        }
    }
}
