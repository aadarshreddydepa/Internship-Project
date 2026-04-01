using Xunit;
using Microsoft.EntityFrameworkCore;
using FluentAssertions;

namespace Localink.Tests.Services
{
    public class CategoryServiceTests
    {
        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"CatDb_{Guid.NewGuid()}")
                .Options;
            return new AppDbContext(options);
        }

        [Fact]
        public async Task GetCategoriesAsync_ReturnsCategories_WhenExist()
        {
            // Arrange
            var db = GetDbContext();
            db.Categories.AddRange(
                new Category { CategoryId = 1, CategoryName = "Food", IconUrl = "icon1.png" },
                new Category { CategoryId = 2, CategoryName = "Retail", IconUrl = "icon2.png" }
            );
            await db.SaveChangesAsync();

            var service = new CategoryService(db);

            // Act
            var result = await service.GetCategoriesAsync();

            // Assert
            result.Should().HaveCount(2);
            result[0].Name.Should().Be("Food");
            result[1].Name.Should().Be("Retail");
        }

        [Fact]
        public async Task GetCategoriesAsync_ThrowsException_WhenEmpty()
        {
            // Arrange
            var db = GetDbContext();
            var service = new CategoryService(db);

            // Act & Assert
            var act = () => service.GetCategoriesAsync();
            await act.Should().ThrowAsync<Exception>().WithMessage("Error fetching categories");
        }

        [Fact]
        public void Constructor_ThrowsArgumentNullException_WhenContextIsNull()
        {
            // Act & Assert
            var act = () => new CategoryService(null!);
            act.Should().Throw<ArgumentNullException>();
        }
    }
}
