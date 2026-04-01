using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Controllers
{
    public class ReviewControllerTests
    {
        private readonly Mock<IReviewService> _mockReviewService;
        private readonly ReviewController _controller;

        public ReviewControllerTests()
        {
            _mockReviewService = new Mock<IReviewService>();
            _controller = new ReviewController(_mockReviewService.Object);
        }

        private void SetupUser(long userId)
        {
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            }, "TestAuthentication"));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        private void SetupNoUser()
        {
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal() }
            };
        }

        [Fact]
        public async Task AddOrUpdateReview_ReturnsOk_WhenValidRequest()
        {
            // Arrange
            var userId = 1L;
            var requestDto = new ReviewRequestDto { BusinessId = 10, Rating = 5, Comment = "Great!" };
            SetupUser(userId);
            _mockReviewService.Setup(s => s.AddOrUpdateReview(userId, requestDto)).Returns(Task.CompletedTask);

            // Act
            var result = await _controller.AddOrUpdateReview(requestDto) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result.StatusCode.Should().Be(200);
            _mockReviewService.Verify(s => s.AddOrUpdateReview(userId, requestDto), Times.Once);
        }

        [Fact]
        public async Task AddOrUpdateReview_ReturnsUnauthorized_WhenUserNotFound()
        {
            // Arrange
            var requestDto = new ReviewRequestDto { BusinessId = 10, Rating = 5, Comment = "Great!" };
            SetupNoUser();

            // Act
            var result = await _controller.AddOrUpdateReview(requestDto) as UnauthorizedObjectResult;

            // Assert
            result.Should().NotBeNull();
            result.StatusCode.Should().Be(401);
            result.Value.Should().Be("Invalid user");
            _mockReviewService.Verify(s => s.AddOrUpdateReview(It.IsAny<long>(), It.IsAny<ReviewRequestDto>()), Times.Never);
        }

        [Fact]
        public async Task AddOrUpdateReview_ReturnsBadRequest_OnException()
        {
            // Arrange
            var userId = 1L;
            var requestDto = new ReviewRequestDto { BusinessId = 10, Rating = 5, Comment = "Great!" };
            SetupUser(userId);
            _mockReviewService.Setup(s => s.AddOrUpdateReview(userId, requestDto)).ThrowsAsync(new Exception("Business not found"));

            // Act
            var result = await _controller.AddOrUpdateReview(requestDto) as BadRequestObjectResult;

            // Assert
            result.Should().NotBeNull();
            result.StatusCode.Should().Be(400);
        }

        [Fact]
        public async Task GetReviews_ReturnsOk_WithReviewsList()
        {
            // Arrange
            var businessId = 10L;
            var reviews = new List<ReviewResponseDto>
            {
                new ReviewResponseDto { ReviewId = 1, Rating = 5, Comment = "Good" },
                new ReviewResponseDto { ReviewId = 2, Rating = 4, Comment = "Nice" }
            };
            _mockReviewService.Setup(s => s.GetReviewsByBusiness(businessId)).ReturnsAsync(reviews);

            // Act
            var result = await _controller.GetReviews(businessId) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result.StatusCode.Should().Be(200);
            result.Value.Should().BeEquivalentTo(reviews);
        }

        [Fact]
        public async Task GetReviews_Returns500_OnException()
        {
            // Arrange
            var businessId = 10L;
            _mockReviewService.Setup(s => s.GetReviewsByBusiness(businessId)).ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.GetReviews(businessId) as ObjectResult;

            // Assert
            result.Should().NotBeNull();
            result.StatusCode.Should().Be(500);
        }

        [Fact]
        public async Task GetSummary_ReturnsOk_WithSummary()
        {
            // Arrange
            var businessId = 10L;
            var summary = new ReviewSummaryDto { AverageRating = 4.5, TotalReviews = 20 };
            _mockReviewService.Setup(s => s.GetSummary(businessId)).ReturnsAsync(summary);

            // Act
            var result = await _controller.GetSummary(businessId) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result.StatusCode.Should().Be(200);
            result.Value.Should().BeEquivalentTo(summary);
        }

        [Fact]
        public async Task GetSummary_Returns500_OnException()
        {
            // Arrange
            var businessId = 10L;
            _mockReviewService.Setup(s => s.GetSummary(businessId)).ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.GetSummary(businessId) as ObjectResult;

            // Assert
            result.Should().NotBeNull();
            result.StatusCode.Should().Be(500);
        }
    }
}
