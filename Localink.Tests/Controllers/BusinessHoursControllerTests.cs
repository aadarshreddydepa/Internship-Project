using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Controllers
{
    public class BusinessHoursControllerTests
    {
        private readonly Mock<IHoursService> _mockService;
        private readonly BusinessHoursController _controller;

        public BusinessHoursControllerTests()
        {
            _mockService = new Mock<IHoursService>();
            _controller = new BusinessHoursController(_mockService.Object);
        }

        // ──── CreateOrReplaceBusinessHours ────

        [Fact]
        public async Task CreateOrReplaceBusinessHours_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            var dto = new BusinessHoursDto
            {
                Days = new List<DayHoursDto>
                {
                    new DayHoursDto { DayOfWeek = "Monday", Mode = "24h", Slots = new List<TimeSlotDto>() }
                }
            };
            _mockService.Setup(s => s.CreateOrReplaceBusinessHoursAsync(1, dto)).ReturnsAsync(true);

            // Act
            var result = await _controller.CreateOrReplaceBusinessHours(1, dto) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }

        // ──── GetBusinessHours ────

        [Fact]
        public async Task GetBusinessHours_ReturnsOk_WhenFound()
        {
            // Arrange
            var hours = new List<object>
            {
                new { DayOfWeek = "Monday", Mode = "24h", Slots = new List<object>() }
            };
            _mockService.Setup(s => s.GetBusinessHoursAsync(1)).ReturnsAsync(hours);

            // Act
            var result = await _controller.GetBusinessHours(1) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task GetBusinessHours_ReturnsNotFound_WhenNull()
        {
            // Arrange
            _mockService.Setup(s => s.GetBusinessHoursAsync(999)).ReturnsAsync((List<object>?)null);

            // Act
            var result = await _controller.GetBusinessHours(999) as NotFoundResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(404);
        }
    }
}
