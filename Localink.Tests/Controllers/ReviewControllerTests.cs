using localink_be.Controllers;
using localink_be.Models.DTOs;
using localink_be.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace Localink.Tests.Controllers
{
    public class ReviewControllerTests
    {
        [Fact]
        public async Task AddOrUpdateReview_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            var mockReviewService = new Mock<IReviewService>();
            var businessId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var reviewDto = new ReviewRequestDto
            {
                BusinessId = businessId,
                Rating = 5,
                Comment = "Great service!"
            };

            mockReviewService.Setup(x => x.AddOrUpdateReviewAsync(userId, businessId, It.IsAny<ReviewRequestDto>()))
                .ReturnsAsync(new ReviewResponseDto 
                { 
                    ReviewId = Guid.NewGuid(),
                    Rating = 5,
                    Comment = "Great service!",
                    UserName = "Test User",
                    CreatedAt = DateTime.UtcNow
                });

            var controller = new ReviewController(mockReviewService.Object);

            // Act
            var result = await controller.AddOrUpdateReview(userId, reviewDto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
            mockReviewService.Verify(x => x.AddOrUpdateReviewAsync(userId, businessId, It.IsAny<ReviewRequestDto>()), Times.Once);
        }

        [Fact]
        public async Task AddOrUpdateReview_ReturnsUnauthorized_WhenNoUser()
        {
            // Arrange
            var mockReviewService = new Mock<IReviewService>();
            var businessId = Guid.NewGuid();
            var userId = Guid.Empty;
            var reviewDto = new ReviewRequestDto
            {
                BusinessId = businessId,
                Rating = 5,
                Comment = "Great service!"
            };

            mockReviewService.Setup(x => x.AddOrUpdateReviewAsync(userId, businessId, It.IsAny<ReviewRequestDto>()))
                .ThrowsAsync(new UnauthorizedAccessException("User not authenticated"));

            var controller = new ReviewController(mockReviewService.Object);

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => controller.AddOrUpdateReview(userId, reviewDto));
        }

        [Fact]
        public async Task GetReviews_ReturnsOk_WithReviews()
        {
            // Arrange
            var mockReviewService = new Mock<IReviewService>();
            var businessId = Guid.NewGuid();
            var reviews = new List<ReviewResponseDto>
            {
                new ReviewResponseDto
                {
                    ReviewId = Guid.NewGuid(),
                    Rating = 5,
                    Comment = "Excellent!",
                    UserName = "User 1",
                    CreatedAt = DateTime.UtcNow
                },
                new ReviewResponseDto
                {
                    ReviewId = Guid.NewGuid(),
                    Rating = 4,
                    Comment = "Good!",
                    UserName = "User 2",
                    CreatedAt = DateTime.UtcNow
                }
            };

            mockReviewService.Setup(x => x.GetReviewsByBusinessAsync(businessId))
                .ReturnsAsync(reviews);

            var controller = new ReviewController(mockReviewService.Object);

            // Act
            var result = await controller.GetReviews(businessId);

            // Assert
            Assert.IsType<OkObjectResult>(result);
            mockReviewService.Verify(x => x.GetReviewsByBusinessAsync(businessId), Times.Once);
        }

        [Fact]
        public async Task GetReviews_ReturnsEmptyList_WhenNoReviews()
        {
            // Arrange
            var mockReviewService = new Mock<IReviewService>();
            var businessId = Guid.NewGuid();

            mockReviewService.Setup(x => x.GetReviewsByBusinessAsync(businessId))
                .ReturnsAsync(new List<ReviewResponseDto>());

            var controller = new ReviewController(mockReviewService.Object);

            // Act
            var result = await controller.GetReviews(businessId);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetSummary_ReturnsOk_WithSummary()
        {
            // Arrange
            var mockReviewService = new Mock<IReviewService>();
            var businessId = Guid.NewGuid();
            var summary = new ReviewSummaryDto
            {
                AverageRating = 4.5,
                TotalReviews = 2,
                RatingDistribution = new Dictionary<int, int>
                {
                    { 5, 1 },
                    { 4, 1 }
                }
            };

            mockReviewService.Setup(x => x.GetReviewSummaryAsync(businessId))
                .ReturnsAsync(summary);

            var controller = new ReviewController(mockReviewService.Object);

            // Act
            var result = await controller.GetSummary(businessId);

            // Assert
            Assert.IsType<OkObjectResult>(result);
            mockReviewService.Verify(x => x.GetReviewSummaryAsync(businessId), Times.Once);
        }

        [Fact]
        public async Task GetSummary_ReturnsZeroRating_WhenNoReviews()
        {
            // Arrange
            var mockReviewService = new Mock<IReviewService>();
            var businessId = Guid.NewGuid();
            var summary = new ReviewSummaryDto
            {
                AverageRating = 0,
                TotalReviews = 0,
                RatingDistribution = new Dictionary<int, int>()
            };

            mockReviewService.Setup(x => x.GetReviewSummaryAsync(businessId))
                .ReturnsAsync(summary);

            var controller = new ReviewController(mockReviewService.Object);

            // Act
            var result = await controller.GetSummary(businessId);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task AddOrUpdateReview_CallsServiceOnce()
        {
            // Arrange
            var mockReviewService = new Mock<IReviewService>();
            var businessId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var reviewDto = new ReviewRequestDto
            {
                BusinessId = businessId,
                Rating = 5,
                Comment = "Great service!"
            };

            mockReviewService.Setup(x => x.AddOrUpdateReviewAsync(userId, businessId, It.IsAny<ReviewRequestDto>()))
                .ReturnsAsync(new ReviewResponseDto 
                { 
                    ReviewId = Guid.NewGuid(),
                    Rating = 5,
                    Comment = "Great service!",
                    UserName = "Test User",
                    CreatedAt = DateTime.UtcNow
                });

            var controller = new ReviewController(mockReviewService.Object);

            // Act
            await controller.AddOrUpdateReview(userId, reviewDto);

            // Assert
            mockReviewService.Verify(x => x.AddOrUpdateReviewAsync(userId, businessId, It.IsAny<ReviewRequestDto>()), Times.Once);
        }
    }
}
