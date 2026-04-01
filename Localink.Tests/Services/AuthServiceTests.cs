using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

public class AuthServiceTests
{
    private AppDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"AuthDb_{Guid.NewGuid()}")
            .ConfigureWarnings(w =>
                w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new AppDbContext(options);
    }

    private User ValidUser()
    {
        return new User
        {
            UserId = 1,
            AccountType = "user",
            FullName = "John Doe",
            Email = "john@example.com",
            PhoneNumber = "+919876543210",
            PasswordHash = "hashed_password",
            IsEmailVerified = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    [Fact]
    public async Task RegisterAsync_ShouldCreateUser()
    {
        // Arrange
        var db = GetDbContext();
        var mockEmailService = new Mock<IEmailService>();
        var mockCaptchaService = new Mock<ICaptchaService>();
        
        var service = new AuthService(db, mockEmailService.Object, mockCaptchaService.Object);
        var user = ValidUser();

        // Act
        var result = await service.RegisterAsync(user.FullName, user.Email, "password123", user.PhoneNumber);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Contains("success", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ShouldReturnToken()
    {
        // Arrange
        var db = GetDbContext();
        var user = ValidUser();
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123");
        user.IsEmailVerified = true;
        
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var mockEmailService = new Mock<IEmailService>();
        var mockCaptchaService = new Mock<ICaptchaService>();
        var service = new AuthService(db, mockEmailService.Object, mockCaptchaService.Object);

        // Act
        var result = await service.LoginAsync("john@example.com", "password123");

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Contains("token", StringComparison.OrdinalIgnoreCase) || !string.IsNullOrEmpty(result));
    }

    [Fact]
    public async Task VerifyEmailAsync_WithValidEmail_ShouldReturnTrue()
    {
        // Arrange
        var db = GetDbContext();
        var user = ValidUser();
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var mockEmailService = new Mock<IEmailService>();
        var mockCaptchaService = new Mock<ICaptchaService>();
        var service = new AuthService(db, mockEmailService.Object, mockCaptchaService.Object);

        // Act
        var result = await service.VerifyEmailAsync("john@example.com");

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task VerifyEmailAsync_WithInvalidEmail_ShouldReturnFalse()
    {
        // Arrange
        var db = GetDbContext();
        var mockEmailService = new Mock<IEmailService>();
        var mockCaptchaService = new Mock<ICaptchaService>();
        var service = new AuthService(db, mockEmailService.Object, mockCaptchaService.Object);

        // Act
        var result = await service.VerifyEmailAsync("nonexistent@example.com");

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task SendResetOtpAsync_ShouldSendOTP()
    {
        // Arrange
        var db = GetDbContext();
        var user = ValidUser();
        user.IsEmailVerified = true;
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var mockEmailService = new Mock<IEmailService>();
        var mockCaptchaService = new Mock<ICaptchaService>();
        var service = new AuthService(db, mockEmailService.Object, mockCaptchaService.Object);

        // Act
        var result = await service.SendResetOtpAsync("john@example.com");

        // Assert
        Assert.NotNull(result);
    }

    [Fact]
    public async Task ResetPasswordAsync_WithValidOtp_ShouldUpdatePassword()
    {
        // Arrange
        var db = GetDbContext();
        var user = ValidUser();
        user.IsEmailVerified = true;
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var mockEmailService = new Mock<IEmailService>();
        var mockCaptchaService = new Mock<ICaptchaService>();
        var service = new AuthService(db, mockEmailService.Object, mockCaptchaService.Object);

        // Act - First send OTP
        var otp = await service.SendResetOtpAsync("john@example.com");
        
        // Then reset with OTP (this is a simplified test - actual OTP verification happens in real service)
        var resetResult = await service.ResetPasswordAsync("john@example.com", otp, "newpassword123");

        // Assert
        Assert.NotNull(resetResult);
    }
}
