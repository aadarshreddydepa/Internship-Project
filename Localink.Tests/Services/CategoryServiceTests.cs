using Xunit;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

public class CategoryServiceTests
{
    private AppDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"CategoryDb_{Guid.NewGuid()}")
            .ConfigureWarnings(w =>
                w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new AppDbContext(options);
    }

    private Category ValidCategory()
    {
        return new Category
        {
            CategoryId = 1,
            CategoryName = "Restaurants",
            IconUrl = "https://example.com/restaurants.png"
        };
    }

    [Fact]
    public async Task GetCategoriesAsync_ShouldReturnAllCategories()
    {
        // Arrange
        var db = GetDbContext();
        db.Categories.Add(ValidCategory());
        db.Categories.Add(new Category
        {
            CategoryId = 2,
            CategoryName = "Hotels",
            IconUrl = "https://example.com/hotels.png"
        });
        await db.SaveChangesAsync();

        var service = new CategoryService(db);

        // Act
        var result = await service.GetCategoriesAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GetCategoriesAsync_WithNoCategories_ShouldReturnEmptyList()
    {
        // Arrange
        var db = GetDbContext();
        var service = new CategoryService(db);

        // Act
        var result = await service.GetCategoriesAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task GetCategoriesAsync_ShouldReturnCategoryDtos()
    {
        // Arrange
        var db = GetDbContext();
        db.Categories.Add(ValidCategory());
        await db.SaveChangesAsync();

        var service = new CategoryService(db);

        // Act
        var result = await service.GetCategoriesAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Single(result);
        Assert.IsType<List<CategoryDto>>(result);
    }

    [Fact]
    public async Task GetCategoriesAsync_ShouldIncludeIconUrl()
    {
        // Arrange
        var db = GetDbContext();
        var category = ValidCategory();
        db.Categories.Add(category);
        await db.SaveChangesAsync();

        var service = new CategoryService(db);

        // Act
        var result = await service.GetCategoriesAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Single(result);
        Assert.NotNull(result[0].IconUrl);
        Assert.Equal("https://example.com/restaurants.png", result[0].IconUrl);
    }
}
