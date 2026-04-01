using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Controllers
{
    public class SubcategoryControllerTests
    {
        private readonly Mock<ISubcategoryService> _mockService;
        private readonly SubcategoryController _controller;

        public SubcategoryControllerTests()
        {
            _mockService = new Mock<ISubcategoryService>();
            _controller = new SubcategoryController(_mockService.Object);
        }

        [Fact]
        public async Task GetByCategory_ReturnsOk_WithSubcategories()
        {
            // Arrange
            var subcategories = new List<SubcategoryDto>
            {
                new SubcategoryDto { Id = 1, Name = "Fast Food", Count = 5 },
                new SubcategoryDto { Id = 2, Name = "Fine Dining", Count = 3 }
            };
            _mockService.Setup(s => s.GetByCategoryIdAsync(1)).ReturnsAsync(subcategories);

            // Act
            var result = await _controller.GetByCategory(1) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
            result.Value.Should().BeEquivalentTo(subcategories);
        }

        [Fact]
        public async Task GetByCategory_ReturnsOk_WithEmptyList()
        {
            // Arrange
            _mockService.Setup(s => s.GetByCategoryIdAsync(999)).ReturnsAsync(new List<SubcategoryDto>());

            // Act
            var result = await _controller.GetByCategory(999) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }
    }
}
