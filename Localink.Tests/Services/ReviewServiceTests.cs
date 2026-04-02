using Xunit;
using Microsoft.EntityFrameworkCore;
using FluentAssertions;

namespace Localink.Tests.Services
{
    public class ReviewServiceTests
    {
        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"ReviewDb_{Guid.NewGuid()}")
                .Options;
            return new AppDbContext(options);
        }

        private void SeedBaseData(AppDbContext db)
        {
            db.Users.Add(new User
            {
                UserId = 1, AccountType = "user", FullName = "John",
                Email = "j@t.com", PasswordHash = "h", CountryCode = "+91"
            });
            db.Categories.Add(new Category { CategoryId = 1, CategoryName = "Food", IconUrl = "i.png" });
            db.Subcategories.Add(new Subcategory { SubcategoryId = 1, CategoryId = 1, SubcategoryName = "Fast" });
            db.Businesses.Add(new Business
            {
                BusinessId = 1, BusinessName = "Biz", Description = "Test business description",
                CategoryId = 1, SubcategoryId = 1, UserId = 1,
                CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
            });
            db.SaveChanges();
        }

        // ──── AddOrUpdateReview ────

        [Fact]
        public async Task AddOrUpdateReview_CreatesNewReview()
        {
            // Arrange
            var db = GetDbContext();
            SeedBaseData(db);
            var service = new ReviewService(db);
            var dto = new ReviewRequestDto { BusinessId = 1, Rating = 4, Comment = "Good!" };

            // Act
            await service.AddOrUpdateReview(1, dto);

            // Assert
            var review = await db.BusinessReviews.FirstOrDefaultAsync(r => r.UserId == 1 && r.BusinessId == 1);
            review.Should().NotBeNull();
            review!.Rating.Should().Be(4);
            review.Comment.Should().Be("Good!");
        }

        [Fact]
        public async Task AddOrUpdateReview_UpdatesExistingReview()
        {
            // Arrange
            var db = GetDbContext();
            SeedBaseData(db);
            db.BusinessReviews.Add(new BusinessReview
            {
                ReviewId = 1, UserId = 1, BusinessId = 1,
                Rating = 3, Comment = "OK", CreatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();

            var service = new ReviewService(db);
            var dto = new ReviewRequestDto { BusinessId = 1, Rating = 5, Comment = "Excellent!" };

            // Act
            await service.AddOrUpdateReview(1, dto);

            // Assert
            var review = await db.BusinessReviews.FirstAsync(r => r.ReviewId == 1);
            review.Rating.Should().Be(5);
            review.Comment.Should().Be("Excellent!");
        }

        [Fact]
        public async Task AddOrUpdateReview_ThrowsException_WhenRatingInvalid()
        {
            // Arrange
            var db = GetDbContext();
            var service = new ReviewService(db);
            var dto = new ReviewRequestDto { BusinessId = 1, Rating = 6, Comment = "Too high" };

            // Act & Assert
            var act = () => service.AddOrUpdateReview(1, dto);
            await act.Should().ThrowAsync<Exception>().WithMessage("Rating must be between 1 and 5");
        }

        [Fact]
        public async Task AddOrUpdateReview_ThrowsException_WhenRatingZero()
        {
            // Arrange
            var db = GetDbContext();
            var service = new ReviewService(db);
            var dto = new ReviewRequestDto { BusinessId = 1, Rating = 0, Comment = "Zero" };

            // Act & Assert
            var act = () => service.AddOrUpdateReview(1, dto);
            await act.Should().ThrowAsync<Exception>().WithMessage("Rating must be between 1 and 5");
        }

        // ──── GetReviewsByBusiness ────

        [Fact]
        public async Task GetReviewsByBusiness_ReturnsReviews_WhenExist()
        {
            // Arrange
            var db = GetDbContext();
            SeedBaseData(db);
            db.BusinessReviews.Add(new BusinessReview
            {
                ReviewId = 1, UserId = 1, BusinessId = 1,
                Rating = 5, Comment = "Great!", CreatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();

            var service = new ReviewService(db);

            // Act
            var result = await service.GetReviewsByBusiness(1);

            // Assert
            result.Should().HaveCount(1);
            result[0].Rating.Should().Be(5);
        }

        [Fact]
        public async Task GetReviewsByBusiness_ReturnsEmptyList_WhenNoReviews()
        {
            // Arrange
            var db = GetDbContext();
            var service = new ReviewService(db);

            // Act
            var result = await service.GetReviewsByBusiness(999);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        // ──── GetSummary ────

        [Fact]
        public async Task GetSummary_ReturnsCorrectSummary()
        {
            // Arrange
            var db = GetDbContext();
            SeedBaseData(db);
            db.BusinessReviews.AddRange(
                new BusinessReview { ReviewId = 1, UserId = 1, BusinessId = 1, Rating = 5, CreatedAt = DateTime.UtcNow },
                new BusinessReview { ReviewId = 2, UserId = 1, BusinessId = 1, Rating = 3, CreatedAt = DateTime.UtcNow }
            );
            await db.SaveChangesAsync();

            var service = new ReviewService(db);

            // Act
            var result = await service.GetSummary(1);

            // Assert
            result.Should().NotBeNull();
            result.TotalReviews.Should().Be(2);
            result.AverageRating.Should().Be(4.0);
        }

        [Fact]
        public async Task GetSummary_ReturnsZero_WhenNoReviews()
        {
            // Arrange
            var db = GetDbContext();
            var service = new ReviewService(db);

            // Act
            var result = await service.GetSummary(999);

            // Assert
            result.TotalReviews.Should().Be(0);
            result.AverageRating.Should().Be(0);
        }

        // ──── Edge Case Tests ────

        [Fact]
        public async Task AddOrUpdateReview_BoundaryRating1_ShouldSucceed()
        {
            var db = GetDbContext();
            SeedBaseData(db);
            var service = new ReviewService(db);
            var dto = new ReviewRequestDto { BusinessId = 1, Rating = 1, Comment = "Terrible" };

            await service.AddOrUpdateReview(1, dto);

            var review = await db.BusinessReviews.FirstAsync();
            review.Rating.Should().Be(1);
        }

        [Fact]
        public async Task AddOrUpdateReview_BoundaryRating5_ShouldSucceed()
        {
            var db = GetDbContext();
            SeedBaseData(db);
            var service = new ReviewService(db);
            var dto = new ReviewRequestDto { BusinessId = 1, Rating = 5, Comment = "Excellent" };

            await service.AddOrUpdateReview(1, dto);

            var review = await db.BusinessReviews.FirstAsync();
            review.Rating.Should().Be(5);
        }

        [Fact]
        public async Task AddOrUpdateReview_NegativeRating_ShouldThrowException()
        {
            var db = GetDbContext();
            SeedBaseData(db);
            var service = new ReviewService(db);
            var dto = new ReviewRequestDto { BusinessId = 1, Rating = -1 };

            var act = () => service.AddOrUpdateReview(1, dto);
            await act.Should().ThrowAsync<Exception>().WithMessage("Rating must be between 1 and 5");
        }

        [Fact]
        public async Task AddOrUpdateReview_ZeroRating_ShouldThrowException()
        {
            var db = GetDbContext();
            SeedBaseData(db);
            var service = new ReviewService(db);
            var dto = new ReviewRequestDto { BusinessId = 1, Rating = 0 };

            var act = () => service.AddOrUpdateReview(1, dto);
            await act.Should().ThrowAsync<Exception>().WithMessage("Rating must be between 1 and 5");
        }

        [Fact]
        public async Task AddOrUpdateReview_Rating6_ShouldThrowException()
        {
            var db = GetDbContext();
            SeedBaseData(db);
            var service = new ReviewService(db);
            var dto = new ReviewRequestDto { BusinessId = 1, Rating = 6 };

            var act = () => service.AddOrUpdateReview(1, dto);
            await act.Should().ThrowAsync<Exception>().WithMessage("Rating must be between 1 and 5");
        }
    }
}

