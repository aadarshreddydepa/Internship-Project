using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Controllers
{
    public class UserControllerTests
    {
        private readonly Mock<IUserService> _mockUserService;
        private readonly Mock<IAuthService> _mockAuthService;
        private readonly UserController _controller;

        public UserControllerTests()
        {
            _mockUserService = new Mock<IUserService>();
            _mockAuthService = new Mock<IAuthService>();
            _controller = new UserController(_mockUserService.Object, _mockAuthService.Object);
        }

        private void SetupUser(long userId)
        {
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            }, "TestAuthentication"));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        private void SetupNoUser()
        {
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal() }
            };
        }

        // ──── Register ────

        [Fact]
        public async Task Register_ReturnsOk_WhenValid()
        {
            // Arrange
            var request = new RegisterRequest
            {
                UserType = "user",
                Name = "John Doe",
                Email = "john@test.com",
                Phone = "9876543210",
                CountryCode = "+91",
                Password = "Password1",
                Country = "India",
                State = "TS",
                City = "Hyderabad"
            };
            _mockAuthService.Setup(s => s.RegisterAsync(request)).ReturnsAsync("User registered successfully");

            // Act
            var result = await _controller.Register(request) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task Register_ReturnsBadRequest_WhenModelStateInvalid()
        {
            // Arrange
            _controller.ModelState.AddModelError("Email", "Required");

            // Act
            var result = await _controller.Register(new RegisterRequest()) as BadRequestObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(400);
        }

        // ──── VerifyEmail ────

        [Fact]
        public async Task VerifyEmail_ReturnsOk()
        {
            // Arrange
            _mockAuthService.Setup(s => s.VerifyEmailAsync("john@test.com")).ReturnsAsync("Email exists");

            // Act
            var result = await _controller.VerifyEmail("john@test.com") as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }

        // ──── ResetPassword ────

        [Fact]
        public async Task ResetPassword_ReturnsOk_WhenValid()
        {
            // Arrange
            var request = new ForgotPasswordRequest
            {
                Email = "user@test.com",
                NewPassword = "NewPassword1"
            };
            _mockAuthService.Setup(s => s.ResetPasswordAsync(request)).ReturnsAsync("Password updated successfully");

            // Act
            var result = await _controller.ResetPassword(request) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task ResetPassword_ReturnsBadRequest_WhenInvalidModel()
        {
            // Arrange
            _controller.ModelState.AddModelError("Email", "Required");

            // Act
            var result = await _controller.ResetPassword(new ForgotPasswordRequest()) as BadRequestObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(400);
        }

        // ──── GetProfile ────

        [Fact]
        public async Task GetProfile_ReturnsOk_WhenFound()
        {
            // Arrange
            SetupUser(1);
            var profile = new UserProfileDto
            {
                UserId = 1,
                FullName = "John",
                Email = "john@test.com"
            };
            _mockUserService.Setup(s => s.GetUserProfileAsync(1)).ReturnsAsync(profile);

            // Act
            var result = await _controller.GetProfile() as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task GetProfile_ReturnsNotFound_WhenNull()
        {
            // Arrange
            SetupUser(999);
            _mockUserService.Setup(s => s.GetUserProfileAsync(999)).ReturnsAsync((UserProfileDto?)null);

            // Act
            var result = await _controller.GetProfile() as NotFoundResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(404);
        }

        // ──── UpdateProfile ────

        [Fact]
        public async Task UpdateProfile_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            SetupUser(1);
            var dto = new UpdateUserProfileDto
            {
                FullName = "John Updated",
                Address = new AddressDto { City = "Hyd" }
            };
            _mockUserService.Setup(s => s.UpdateUserProfileAsync(1, dto)).ReturnsAsync(true);

            // Act
            var result = await _controller.UpdateProfile(dto) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task UpdateProfile_ReturnsNotFound_WhenUserMissing()
        {
            // Arrange
            SetupUser(999);
            var dto = new UpdateUserProfileDto
            {
                FullName = "Nobody",
                Address = new AddressDto()
            };
            _mockUserService.Setup(s => s.UpdateUserProfileAsync(999, dto)).ReturnsAsync(false);

            // Act
            var result = await _controller.UpdateProfile(dto) as NotFoundObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(404);
        }

        [Fact]
        public async Task UpdateProfile_ReturnsBadRequest_WhenModelStateInvalid()
        {
            // Arrange
            SetupUser(1);
            _controller.ModelState.AddModelError("FullName", "Required");

            // Act
            var result = await _controller.UpdateProfile(new UpdateUserProfileDto()) as BadRequestObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(400);
        }

        [Fact]
        public async Task UpdateProfile_ReturnsUnauthorized_WhenNoUser()
        {
            // Arrange
            SetupNoUser();
            var dto = new UpdateUserProfileDto
            {
                FullName = "Test",
                Address = new AddressDto()
            };

            // Act
            var result = await _controller.UpdateProfile(dto) as UnauthorizedResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(401);
        }
    }
}
