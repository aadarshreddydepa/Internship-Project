using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Controllers
{
    public class CategoryControllerTests
    {
        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"CatCtrlDb_{Guid.NewGuid()}")
                .Options;
            return new AppDbContext(options);
        }

        // ──── GetSubcategories (DB-based) ────

        [Fact]
        public async Task GetSubcategories_ReturnsOk_WhenSubcategoriesExist()
        {
            // Arrange
            var db = GetDbContext();
            var category = new Category { CategoryId = 1, CategoryName = "Food", IconUrl = "icon.png" };
            var sub1 = new Subcategory { SubcategoryId = 1, CategoryId = 1, SubcategoryName = "Fast Food" };
            var sub2 = new Subcategory { SubcategoryId = 2, CategoryId = 1, SubcategoryName = "Fine Dining" };

            db.Categories.Add(category);
            db.Subcategories.AddRange(sub1, sub2);
            await db.SaveChangesAsync();

            var mockService = new Mock<ICategoryService>();
            var controller = new CategoryController(db, mockService.Object);

            // Act
            var result = await controller.GetSubcategories(1) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task GetSubcategories_ReturnsNotFound_WhenNoSubcategories()
        {
            // Arrange
            var db = GetDbContext();
            var mockService = new Mock<ICategoryService>();
            var controller = new CategoryController(db, mockService.Object);

            // Act
            var result = await controller.GetSubcategories(999) as NotFoundResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(404);
        }

        // ──── GetAll (via ICategoryService) ────

        [Fact]
        public async Task GetAll_ReturnsOk_WithCategories()
        {
            // Arrange
            var db = GetDbContext();
            var mockService = new Mock<ICategoryService>();
            var categories = new List<CategoryDto>
            {
                new CategoryDto { Id = 1, Name = "Food", IconUrl = "icon.png" },
                new CategoryDto { Id = 2, Name = "Retail", IconUrl = "icon2.png" }
            };
            mockService.Setup(s => s.GetCategoriesAsync()).ReturnsAsync(categories);
            var controller = new CategoryController(db, mockService.Object);

            // Act
            var result = await controller.GetAll() as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
            result.Value.Should().BeEquivalentTo(categories);
        }
    }
}
