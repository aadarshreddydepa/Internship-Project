using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Controllers
{
    public class AdminControllerTests
    {
        private readonly Mock<IAdminService> _mockService;
        private readonly AdminController _controller;

        public AdminControllerTests()
        {
            _mockService = new Mock<IAdminService>();
            _controller = new AdminController(_mockService.Object);
        }

        private void SetupAdminUser(long userId)
        {
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, "admin")
            }, "TestAuthentication"));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        // ──── GetAll ────

        [Fact]
        public async Task GetAll_ReturnsOk_WithBusinessList()
        {
            // Arrange
            var data = new List<AdminBusinessDto>
            {
                new AdminBusinessDto { Id = 1, Name = "Biz1", Category = "Cat1", Status = "Pending" },
                new AdminBusinessDto { Id = 2, Name = "Biz2", Category = "Cat2", Status = "Approved" }
            };
            _mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(data);

            // Act
            var result = await _controller.GetAll() as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
            result.Value.Should().BeEquivalentTo(data);
        }

        [Fact]
        public async Task GetAll_ReturnsOk_WithEmptyList()
        {
            // Arrange
            _mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(new List<AdminBusinessDto>());

            // Act
            var result = await _controller.GetAll() as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }

        // ──── UpdateStatus ────

        [Fact]
        public async Task UpdateStatus_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            SetupAdminUser(100);
            var dto = new UpdateStatusDto { Status = BusinessStatus.Approved };
            _mockService.Setup(s => s.UpdateStatusAsync(1, dto, 100)).Returns(Task.CompletedTask);

            // Act
            var result = await _controller.UpdateStatus(1, dto) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
            _mockService.Verify(s => s.UpdateStatusAsync(1, dto, 100), Times.Once);
        }

        // ──── Export ────

        [Fact]
        public async Task Export_ReturnsFile_WhenValidStatus()
        {
            // Arrange
            var fileBytes = new byte[] { 0x50, 0x4B, 0x03, 0x04 };
            _mockService.Setup(s => s.ExportAsync("Approved")).ReturnsAsync(fileBytes);

            // Act
            var result = await _controller.Export("Approved") as FileContentResult;

            // Assert
            result.Should().NotBeNull();
            result!.ContentType.Should().Be("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            result.FileDownloadName.Should().Be("Approved-businesses.xlsx");
            result.FileContents.Should().BeEquivalentTo(fileBytes);
        }
    }
}
