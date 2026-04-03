using Xunit;
using Microsoft.EntityFrameworkCore;
using FluentAssertions;

namespace Localink.Tests.Services
{
    public class SubcategoryServiceTests
    {
        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"SubcatDb_{Guid.NewGuid()}")
                .Options;
            return new AppDbContext(options);
        }

        [Fact]
        public async Task GetByCategoryIdAsync_ReturnsSubcategories_WhenExist()
        {
            // Arrange
            var db = GetDbContext();
            db.Categories.Add(new Category { CategoryId = 1, CategoryName = "Food", IconUrl = "i.png" });
            db.Subcategories.AddRange(
                new Subcategory { SubcategoryId = 1, CategoryId = 1, SubcategoryName = "Fast Food" },
                new Subcategory { SubcategoryId = 2, CategoryId = 1, SubcategoryName = "Fine Dining" }
            );
            await db.SaveChangesAsync();

            var service = new SubcategoryService(db);

            // Act
            var result = await service.GetByCategoryIdAsync(1);

            // Assert
            result.Should().HaveCount(2);
            result[0].Name.Should().Be("Fast Food");
        }

        [Fact]
        public async Task GetByCategoryIdAsync_ThrowsException_WhenNoSubcategories()
        {
            // Arrange
            var db = GetDbContext();
            var service = new SubcategoryService(db);

            // Act & Assert
            var act = () => service.GetByCategoryIdAsync(1);
            await act.Should().ThrowAsync<Exception>().WithMessage("Error fetching subcategories*");
        }

        [Fact]
        public async Task GetByCategoryIdAsync_ThrowsArgumentException_WhenCategoryIdInvalid()
        {
            // Arrange
            var db = GetDbContext();
            var service = new SubcategoryService(db);

            // Act & Assert
            var act = () => service.GetByCategoryIdAsync(0);
            await act.Should().ThrowAsync<Exception>();
        }

        [Fact]
        public void Constructor_ThrowsArgumentNullException_WhenContextIsNull()
        {
            // Act & Assert
            var act = () => new SubcategoryService(null!);
            act.Should().Throw<ArgumentNullException>();
        }
    }
}
