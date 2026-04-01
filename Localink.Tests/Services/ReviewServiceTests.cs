using Xunit;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class ReviewServiceTests
{
    private AppDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"ReviewDb_{Guid.NewGuid()}")
            .ConfigureWarnings(w =>
                w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new AppDbContext(options);
    }

    private User ValidUser()
    {
        return new User
        {
            UserId = 1,
            AccountType = "user",
            FullName = "John Reviewer",
            Email = "reviewer@example.com",
            PhoneNumber = "+919876543210",
            PasswordHash = "hashed",
            IsEmailVerified = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private Category ValidCategory()
    {
        return new Category
        {
            CategoryId = 1,
            CategoryName = "Restaurants",
            IconUrl = "https://example.com/icon.png"
        };
    }

    private Subcategory ValidSubcategory()
    {
        return new Subcategory
        {
            SubcategoryId = 1,
            CategoryId = 1,
            SubcategoryName = "Fast Food",
            IconUrl = "https://example.com/sub-icon.png"
        };
    }

    private Business ValidBusiness()
    {
        return new Business
        {
            BusinessId = 1,
            BusinessName = "Restaurant Name",
            Description = "A great restaurant serving delicious food",
            UserId = 1,
            CategoryId = 1,
            SubcategoryId = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private BusinessReview ValidReview()
    {
        return new BusinessReview
        {
            ReviewId = 1,
            UserId = 1,
            BusinessId = 1,
            Rating = 5,
            Comment = "Excellent service and food!",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    [Fact]
    public async Task AddOrUpdateReview_ShouldCreateNewReview()
    {
        // Arrange
        var db = GetDbContext();
        var user = ValidUser();
        var category = ValidCategory();
        var subcategory = ValidSubcategory();
        var business = ValidBusiness();

        db.Users.Add(user);
        db.Categories.Add(category);
        db.Subcategories.Add(subcategory);
        db.Businesses.Add(business);
        await db.SaveChangesAsync();

        var service = new ReviewService(db);
        var reviewDto = new ReviewRequestDto
        {
            BusinessId = 1,
            UserId = 1,
            Rating = 4,
            Comment = "Good food!"
        };

        // Act
        var result = await service.AddOrUpdateReview(reviewDto);

        // Assert
        Assert.NotNull(result);
        var review = await db.BusinessReviews.FirstOrDefaultAsync(r => r.UserId == 1 && r.BusinessId == 1);
        Assert.NotNull(review);
    }

    [Fact]
    public async Task AddOrUpdateReview_ShouldUpdateExistingReview()
    {
        // Arrange
        var db = GetDbContext();
        var user = ValidUser();
        var category = ValidCategory();
        var subcategory = ValidSubcategory();
        var business = ValidBusiness();
        var review = ValidReview();

        db.Users.Add(user);
        db.Categories.Add(category);
        db.Subcategories.Add(subcategory);
        db.Businesses.Add(business);
        db.BusinessReviews.Add(review);
        await db.SaveChangesAsync();

        var service = new ReviewService(db);
        var reviewDto = new ReviewRequestDto
        {
            BusinessId = 1,
            UserId = 1,
            Rating = 3,
            Comment = "Not bad!"
        };

        // Act
        var result = await service.AddOrUpdateReview(reviewDto);

        // Assert
        Assert.NotNull(result);
        var updated = await db.BusinessReviews.FirstOrDefaultAsync(r => r.ReviewId == 1);
        Assert.Equal(3, updated.Rating);
    }

    [Fact]
    public async Task GetReviewsByBusiness_ShouldReturnBusinessReviews()
    {
        // Arrange
        var db = GetDbContext();
        var user = ValidUser();
        var category = ValidCategory();
        var subcategory = ValidSubcategory();
        var business = ValidBusiness();
        var review = ValidReview();

        db.Users.Add(user);
        db.Categories.Add(category);
        db.Subcategories.Add(subcategory);
        db.Businesses.Add(business);
        db.BusinessReviews.Add(review);
        await db.SaveChangesAsync();

        var service = new ReviewService(db);

        // Act
        var result = await service.GetReviewsByBusiness(1);

        // Assert
        Assert.NotNull(result);
        Assert.NotEmpty(result);
    }

    [Fact]
    public async Task GetReviewsByBusiness_WithNoReviews_ShouldReturnEmptyList()
    {
        // Arrange
        var db = GetDbContext();
        var category = ValidCategory();
        var subcategory = ValidSubcategory();
        var business = ValidBusiness();

        db.Categories.Add(category);
        db.Subcategories.Add(subcategory);
        db.Businesses.Add(business);
        await db.SaveChangesAsync();

        var service = new ReviewService(db);

        // Act
        var result = await service.GetReviewsByBusiness(1);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task GetSummary_ShouldReturnReviewSummary()
    {
        // Arrange
        var db = GetDbContext();
        var user = ValidUser();
        var category = ValidCategory();
        var subcategory = ValidSubcategory();
        var business = ValidBusiness();
        var review1 = ValidReview();
        var review2 = new BusinessReview
        {
            ReviewId = 2,
            UserId = 1,
            BusinessId = 1,
            Rating = 4,
            Comment = "Pretty good",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Users.Add(user);
        db.Categories.Add(category);
        db.Subcategories.Add(subcategory);
        db.Businesses.Add(business);
        db.BusinessReviews.Add(review1);
        db.BusinessReviews.Add(review2);
        await db.SaveChangesAsync();

        var service = new ReviewService(db);

        // Act
        var result = await service.GetSummary(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.TotalReviews);
    }

    [Fact]
    public async Task GetSummary_ShouldCalculateAverageRating()
    {
        // Arrange
        var db = GetDbContext();
        var user = ValidUser();
        var category = ValidCategory();
        var subcategory = ValidSubcategory();
        var business = ValidBusiness();
        var review1 = new BusinessReview
        {
            ReviewId = 1,
            UserId = 1,
            BusinessId = 1,
            Rating = 5,
            Comment = "Excellent!",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var review2 = new BusinessReview
        {
            ReviewId = 2,
            UserId = 1,
            BusinessId = 1,
            Rating = 3,
            Comment = "Average",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Users.Add(user);
        db.Categories.Add(category);
        db.Subcategories.Add(subcategory);
        db.Businesses.Add(business);
        db.BusinessReviews.Add(review1);
        db.BusinessReviews.Add(review2);
        await db.SaveChangesAsync();

        var service = new ReviewService(db);

        // Act
        var result = await service.GetSummary(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(4, result.AverageRating);
    }
}
