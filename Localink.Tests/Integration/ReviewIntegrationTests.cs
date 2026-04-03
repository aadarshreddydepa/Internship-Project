using System.Net;
using System.Net.Http.Json;
using System.Net.Http.Headers;
using System.Text.Json;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Integration
{
    public class ReviewIntegrationTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory _factory;

        public ReviewIntegrationTests(CustomWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        private async Task<string> RegisterAndGetToken()
        {
            var email = $"rev_{Guid.NewGuid():N}@test.com";
            var request = new RegisterRequest
            {
                UserType = "user", Name = "Review User",
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
            return body.GetProperty("data").GetProperty("token").GetString()!;
        }

        [Fact]
        public async Task AddReview_Unauthenticated_Returns401()
        {
            var dto = new ReviewRequestDto { BusinessId = 1, Rating = 5, Comment = "Great!" };
            var response = await _client.PostAsJsonAsync("/api/v1/reviews", dto);
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task AddReview_Authenticated_ReturnsOk()
        {
            var token = await RegisterAndGetToken();

            // Seed a business
            _factory.SeedDatabase(db =>
            {
                if (!db.Categories.Any(c => c.CategoryId == 300))
                {
                    db.Categories.Add(new Category { CategoryId = 300, CategoryName = "Review Cat", IconUrl = "r.png" });
                    db.Subcategories.Add(new Subcategory { SubcategoryId = 300, CategoryId = 300, SubcategoryName = "Review Sub" });
                    db.SaveChanges();
                }
                if (!db.Businesses.Any(b => b.BusinessId == 5000))
                {
                    db.Businesses.Add(new Business
                    {
                        BusinessId = 5000, BusinessName = "Review Biz", Description = "Business for review testing",
                        CategoryId = 300, SubcategoryId = 300, UserId = 1,
                        CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                    });
                    db.SaveChanges();
                }
            });

            var dto = new ReviewRequestDto { BusinessId = 5000, Rating = 4, Comment = "Good service" };
            var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/reviews");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Content = JsonContent.Create(dto);
            var response = await _client.SendAsync(request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task GetReviews_ReturnsOk()
        {
            var response = await _client.GetAsync("/api/v1/reviews/business/1");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task GetSummary_ReturnsOk()
        {
            var response = await _client.GetAsync("/api/v1/reviews/summary/1");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task AddReview_InvalidRating_Returns400()
        {
            var token = await RegisterAndGetToken();
            var dto = new ReviewRequestDto { BusinessId = 1, Rating = 10, Comment = "Too high" };

            var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/reviews");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Content = JsonContent.Create(dto);
            var response = await _client.SendAsync(request);

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }
    }
}
