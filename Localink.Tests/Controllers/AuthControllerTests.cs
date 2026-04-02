using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<IAuthService> _mockAuthService;
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            _mockAuthService = new Mock<IAuthService>();
            _controller = new AuthController(_mockAuthService.Object);
        }

        // ──── Login ────

        [Fact]
        public async Task Login_ReturnsOk_WhenValidCredentials()
        {
            // Arrange
            var request = new LoginRequest
            {
                UsernameOrEmail = "user@test.com",
                Password = "Password1",
                CaptchaToken = "token"
            };
            var loginResult = new { token = "jwt-token", userType = "user", name = "John" };
            _mockAuthService.Setup(s => s.LoginAsync(request)).ReturnsAsync(loginResult);

            // Act
            var result = await _controller.Login(request) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task Login_ReturnsBadRequest_WhenModelStateInvalid()
        {
            // Arrange
            _controller.ModelState.AddModelError("Password", "Required");

            // Act
            var result = await _controller.Login(new LoginRequest()) as BadRequestObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(400);
        }

        // ──── Register ────

        [Fact]
        public async Task Register_ReturnsOk_WhenValidRequest()
        {
            // Arrange
            var request = new RegisterRequest
            {
                UserType = "user",
                Name = "Test User",
                Email = "test@test.com",
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

        // ──── SendOtp (forgot-password) ────

        [Fact]
        public async Task SendOtp_ReturnsOk_WhenValidEmail()
        {
            // Arrange
            var request = new SendOtpRequest { Email = "user@test.com", CaptchaToken = "token" };
            _mockAuthService.Setup(s => s.SendResetOtpAsync(request.Email, request.CaptchaToken))
                .ReturnsAsync("If the email exists, an OTP has been sent");

            // Act
            var result = await _controller.SendOtp(request) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task SendOtp_ReturnsBadRequest_WhenModelStateInvalid()
        {
            // Arrange
            _controller.ModelState.AddModelError("Email", "Required");

            // Act
            var result = await _controller.SendOtp(new SendOtpRequest()) as BadRequestObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(400);
        }

        // ──── ResetPassword ────

        [Fact]
        public async Task ResetPassword_ReturnsOk_WhenValidRequest()
        {
            // Arrange
            var request = new ResetPasswordWithOtpRequest
            {
                Email = "user@test.com",
                Otp = "123456",
                NewPassword = "NewPassword1"
            };
            _mockAuthService.Setup(s => s.VerifyOtpAndResetPasswordAsync(request.Email, request.Otp, request.NewPassword))
                .ReturnsAsync("Password reset successful");

            // Act
            var result = await _controller.ResetPassword(request) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task ResetPassword_ReturnsBadRequest_WhenModelStateInvalid()
        {
            // Arrange
            _controller.ModelState.AddModelError("Otp", "Required");

            // Act
            var result = await _controller.ResetPassword(new ResetPasswordWithOtpRequest()) as BadRequestObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(400);
        }
    }
}
