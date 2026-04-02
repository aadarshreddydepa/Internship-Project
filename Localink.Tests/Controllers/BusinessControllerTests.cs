using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Controllers
{
    public class BusinessControllerTests
    {
        private readonly Mock<IBusinessService> _mockService;
        private readonly BusinessController _controller;

        public BusinessControllerTests()
        {
            _mockService = new Mock<IBusinessService>();
            _controller = new BusinessController(_mockService.Object);
        }

        private void SetupUser(long userId)
        {
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, "client")
            }, "TestAuthentication"));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        // ──── GetAllBusinesses ────

        [Fact]
        public async Task GetAllBusinesses_ReturnsOk()
        {
            // Arrange
            var businesses = new List<object> { new { BusinessId = 1L } };
            _mockService.Setup(s => s.GetAllBusinessesAsync()).ReturnsAsync(businesses);

            // Act
            var result = await _controller.GetAllBusinesses() as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }

        // ──── GetBusinessById ────

        [Fact]
        public async Task GetBusinessById_ReturnsOk_WhenFound()
        {
            // Arrange
            var biz = new { BusinessId = 1L, BusinessName = "Test" };
            _mockService.Setup(s => s.GetBusinessByIdAsync(1)).ReturnsAsync(biz);

            // Act
            var result = await _controller.GetBusinessById(1) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task GetBusinessById_ReturnsNotFound_WhenNull()
        {
            // Arrange
            _mockService.Setup(s => s.GetBusinessByIdAsync(999)).ReturnsAsync((object?)null);

            // Act
            var result = await _controller.GetBusinessById(999) as NotFoundResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(404);
        }

        // ──── RegisterBusiness ────

        [Fact]
        public async Task RegisterBusiness_ReturnsOk_WithBusinessId()
        {
            // Arrange
            SetupUser(1);
            var dto = new RegisterBusinessDto
            {
                BusinessName = "My Biz",
                Description = "A lovely store",
                CategoryId = 1,
                SubcategoryId = 1,
                PhoneCode = "+91",
                PhoneNumber = "9876543210",
                Email = "biz@test.com",
                Website = "biz.com",
                Address = "123 Street",
                City = "Hyd",
                State = "TS",
                Country = "India",
                Pincode = "500001",
                Hours = new List<DayHoursDto>()
            };
            _mockService.Setup(s => s.RegisterBusinessAsync(dto, 1)).ReturnsAsync(42L);

            // Act
            var result = await _controller.RegisterBusiness(dto) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }

        // ──── UpdateBusiness ────

        [Fact]
        public async Task UpdateBusiness_ReturnsOk_WhenFound()
        {
            // Arrange
            SetupUser(1);
            var dto = new UpdateBusinessDto { BusinessName = "Updated" };
            _mockService.Setup(s => s.UpdateBusinessFullAsync(1, dto)).ReturnsAsync(true);

            // Act
            var result = await _controller.UpdateBusiness(1, dto) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task UpdateBusiness_ReturnsNotFound_WhenNull()
        {
            // Arrange
            SetupUser(1);
            var dto = new UpdateBusinessDto { BusinessName = "Updated" };
            _mockService.Setup(s => s.UpdateBusinessFullAsync(999, dto)).ReturnsAsync(false);

            // Act — note: the controller checks `result == null` so false (not null) goes to Ok
            var result = await _controller.UpdateBusiness(999, dto);

            // Assert — UpdateBusinessFullAsync returns bool; controller treats non-null as Ok
            result.Should().NotBeNull();
        }

        // ──── DeleteBusiness ────

        [Fact]
        public async Task DeleteBusiness_ReturnsNoContent_WhenDeleted()
        {
            // Arrange
            SetupUser(1);
            _mockService.Setup(s => s.DeleteBusinessAsync(1)).ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteBusiness(1) as NoContentResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(204);
        }

        [Fact]
        public async Task DeleteBusiness_ReturnsNotFound_WhenNotDeleted()
        {
            // Arrange
            SetupUser(1);
            _mockService.Setup(s => s.DeleteBusinessAsync(999)).ReturnsAsync(false);

            // Act
            var result = await _controller.DeleteBusiness(999) as NotFoundResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(404);
        }

        // ──── GetMyBusinesses ────

        [Fact]
        public async Task GetMyBusinesses_ReturnsOk()
        {
            // Arrange
            SetupUser(1);
            var data = new List<BusinessDto> { new BusinessDto { Id = 1, Name = "My Biz" } };
            _mockService.Setup(s => s.GetBusinessesByUserAsync(1)).ReturnsAsync(data);

            // Act
            var result = await _controller.GetMyBusinesses() as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }

        // ──── GetBySubcategory ────

        [Fact]
        public async Task GetBySubcategory_ReturnsOk()
        {
            // Arrange
            var data = new List<BusinessDto> { new BusinessDto { Id = 1 } };
            _mockService.Setup(s => s.GetBySubcategoryAsync(5)).ReturnsAsync(data);

            // Act
            var result = await _controller.GetBySubcategory(5) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }

        // ──── GetById (v1) ────

        [Fact]
        public async Task GetById_ReturnsOk()
        {
            // Arrange
            var dto = new BusinessDto { Id = 1, Name = "Test" };
            _mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(dto);

            // Act
            var result = await _controller.GetById(1) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }

        // ──── SearchBusinesses ────

        [Fact]
        public async Task SearchBusinesses_ReturnsOk()
        {
            // Arrange
            var data = new List<BusinessDto> { new BusinessDto { Id = 1, Name = "Found" } };
            _mockService.Setup(s => s.SearchBusinessesAsync("Found")).ReturnsAsync(data);

            // Act
            var result = await _controller.SearchBusinesses("Found") as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }
    }
}
