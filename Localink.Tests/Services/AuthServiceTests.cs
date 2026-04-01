using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using FluentAssertions;

namespace Localink.Tests.Services
{
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

        private IConfiguration GetConfiguration()
        {
            var inMemorySettings = new Dictionary<string, string?>
            {
                { "Jwt:Key", "SuperSecretKeyForTestingPurposesOnly1234567890" },
                { "Jwt:Issuer", "TestIssuer" },
                { "Jwt:Audience", "TestAudience" },
                { "Jwt:ExpiryMinutes", "60" }
            };
            return new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();
        }

        private AuthService CreateService(AppDbContext db)
        {
            var config = GetConfiguration();
            var mockEmailService = new Mock<IEmailService>();
            var mockCaptchaService = new Mock<ICaptchaService>();
            mockCaptchaService.Setup(c => c.VerifyAsync(It.IsAny<string>())).ReturnsAsync(true);
            mockEmailService.Setup(e => e.SendWelcomeEmailAsync(It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            return new AuthService(db, config, mockEmailService.Object, mockCaptchaService.Object);
        }

        [Fact]
        public async Task RegisterAsync_ShouldCreateUser_WhenValid()
        {
            // Arrange
            var db = GetDbContext();
            var service = CreateService(db);
            var request = new RegisterRequest
            {
                UserType = "user",
                Name = "John Doe",
                Email = "john@example.com",
                Phone = "9876543210",
                CountryCode = "+91",
                Password = "Password1",
                Country = "India",
                State = "TS",
                City = "Hyderabad"
            };

            // Act
            var result = await service.RegisterAsync(request);

            // Assert
            result.Should().Contain("successfully");
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == "john@example.com");
            user.Should().NotBeNull();
        }

        [Fact]
        public async Task RegisterAsync_ShouldThrow_WhenEmailExists()
        {
            // Arrange
            var db = GetDbContext();
            db.Users.Add(new User
            {
                UserId = 1,
                AccountType = "user",
                FullName = "Existing",
                Email = "john@example.com",
                PhoneNumber = "1111111111",
                PasswordHash = "hash",
                CountryCode = "+91"
            });
            await db.SaveChangesAsync();

            var service = CreateService(db);
            var request = new RegisterRequest
            {
                UserType = "user",
                Name = "John Doe",
                Email = "john@example.com",
                Phone = "9876543210",
                CountryCode = "+91",
                Password = "Password1",
                Country = "India",
                State = "TS",
                City = "Hyd"
            };

            // Act & Assert
            var act = () => service.RegisterAsync(request);
            await act.Should().ThrowAsync<InvalidOperationException>();
        }

        [Fact]
        public async Task RegisterAsync_ShouldThrow_WhenEmptyEmail()
        {
            // Arrange
            var db = GetDbContext();
            var service = CreateService(db);
            var request = new RegisterRequest
            {
                UserType = "user",
                Name = "John",
                Email = "  ",
                Phone = "9876543210",
                CountryCode = "+91",
                Password = "Password1",
                Country = "India",
                State = "TS",
                City = "Hyd"
            };

            // Act & Assert
            var act = () => service.RegisterAsync(request);
            await act.Should().ThrowAsync<ArgumentException>();
        }

        [Fact]
        public async Task LoginAsync_ShouldReturnToken_WhenValid()
        {
            // Arrange
            var db = GetDbContext();
            db.Users.Add(new User
            {
                UserId = 1,
                AccountType = "user",
                FullName = "John Doe",
                Email = "john@example.com",
                PhoneNumber = "9876543210",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password1", 12),
                CountryCode = "+91"
            });
            await db.SaveChangesAsync();

            var service = CreateService(db);
            var request = new LoginRequest
            {
                UsernameOrEmail = "john@example.com",
                Password = "Password1",
                CaptchaToken = "valid"
            };

            // Act
            var result = await service.LoginAsync(request);

            // Assert
            result.Should().NotBeNull();
        }

        [Fact]
        public async Task LoginAsync_ShouldThrow_WhenInvalidPassword()
        {
            // Arrange
            var db = GetDbContext();
            db.Users.Add(new User
            {
                UserId = 1,
                AccountType = "user",
                FullName = "John",
                Email = "john@example.com",
                PhoneNumber = "9876543210",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password1", 12),
                CountryCode = "+91"
            });
            await db.SaveChangesAsync();

            var service = CreateService(db);
            var request = new LoginRequest
            {
                UsernameOrEmail = "john@example.com",
                Password = "WrongPassword",
                CaptchaToken = "valid"
            };

            // Act & Assert
            var act = () => service.LoginAsync(request);
            await act.Should().ThrowAsync<UnauthorizedAccessException>();
        }

        [Fact]
        public async Task VerifyEmailAsync_ReturnsEmailExists_WhenFound()
        {
            // Arrange
            var db = GetDbContext();
            db.Users.Add(new User
            {
                UserId = 1,
                AccountType = "user",
                FullName = "John",
                Email = "john@example.com",
                PasswordHash = "hash",
                CountryCode = "+91"
            });
            await db.SaveChangesAsync();

            var service = CreateService(db);

            // Act
            var result = await service.VerifyEmailAsync("john@example.com");

            // Assert
            result.Should().Be("Email exists");
        }

        [Fact]
        public async Task VerifyEmailAsync_ReturnsInvalidRequest_WhenNotFound()
        {
            // Arrange
            var db = GetDbContext();
            var service = CreateService(db);

            // Act
            var result = await service.VerifyEmailAsync("nonexistent@example.com");

            // Assert
            result.Should().Be("Invalid request");
        }

        [Fact]
        public async Task ResetPasswordAsync_ShouldUpdatePassword()
        {
            // Arrange
            var db = GetDbContext();
            db.Users.Add(new User
            {
                UserId = 1,
                AccountType = "user",
                FullName = "John",
                Email = "john@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("OldPassword1", 12),
                CountryCode = "+91"
            });
            await db.SaveChangesAsync();

            var service = CreateService(db);
            var request = new ForgotPasswordRequest
            {
                Email = "john@example.com",
                NewPassword = "NewPassword1"
            };

            // Act
            var result = await service.ResetPasswordAsync(request);

            // Assert
            result.Should().Be("Password updated successfully");
            var user = await db.Users.FirstAsync(u => u.Email == "john@example.com");
            BCrypt.Net.BCrypt.Verify("NewPassword1", user.PasswordHash).Should().BeTrue();
        }

        [Fact]
        public async Task ResetPasswordAsync_ShouldThrow_WhenUserNotFound()
        {
            // Arrange
            var db = GetDbContext();
            var service = CreateService(db);
            var request = new ForgotPasswordRequest
            {
                Email = "nobody@example.com",
                NewPassword = "NewPassword1"
            };

            // Act & Assert
            var act = () => service.ResetPasswordAsync(request);
            await act.Should().ThrowAsync<UnauthorizedAccessException>();
        }

        [Fact]
        public async Task SendResetOtpAsync_ShouldReturnMessage_WhenUserExists()
        {
            // Arrange
            var db = GetDbContext();
            db.Users.Add(new User
            {
                UserId = 1,
                AccountType = "user",
                FullName = "John",
                Email = "john@example.com",
                PasswordHash = "hash",
                CountryCode = "+91"
            });
            await db.SaveChangesAsync();

            var service = CreateService(db);

            // Act
            var result = await service.SendResetOtpAsync("john@example.com", "validToken");

            // Assert
            result.Should().Contain("OTP has been sent");
        }

        [Fact]
        public async Task SendResetOtpAsync_ShouldReturnMessage_WhenUserDoesNotExist()
        {
            // Arrange
            var db = GetDbContext();
            var service = CreateService(db);

            // Act
            var result = await service.SendResetOtpAsync("nobody@example.com", "validToken");

            // Assert
            result.Should().Contain("OTP has been sent");
        }

        [Fact]
        public async Task VerifyOtpAndResetPasswordAsync_ShouldReset_WhenOtpValid()
        {
            // Arrange
            var db = GetDbContext();
            db.Users.Add(new User
            {
                UserId = 1,
                AccountType = "user",
                FullName = "John",
                Email = "john@example.com",
                PasswordHash = "hash",
                CountryCode = "+91",
                PasswordResetOtp = "123456",
                OtpExpiry = DateTime.UtcNow.AddMinutes(5),
                OtpAttempts = 0
            });
            await db.SaveChangesAsync();

            var service = CreateService(db);

            // Act
            var result = await service.VerifyOtpAndResetPasswordAsync("john@example.com", "123456", "NewPass1");

            // Assert
            result.Should().Be("Password reset successful");
        }

        [Fact]
        public async Task VerifyOtpAndResetPasswordAsync_ShouldThrow_WhenOtpInvalid()
        {
            // Arrange
            var db = GetDbContext();
            db.Users.Add(new User
            {
                UserId = 1,
                AccountType = "user",
                FullName = "John",
                Email = "john@example.com",
                PasswordHash = "hash",
                CountryCode = "+91",
                PasswordResetOtp = "123456",
                OtpExpiry = DateTime.UtcNow.AddMinutes(5),
                OtpAttempts = 0
            });
            await db.SaveChangesAsync();

            var service = CreateService(db);

            // Act & Assert
            var act = () => service.VerifyOtpAndResetPasswordAsync("john@example.com", "wrong", "NewPass1");
            await act.Should().ThrowAsync<UnauthorizedAccessException>().WithMessage("Invalid OTP");
        }

        [Fact]
        public async Task VerifyOtpAndResetPasswordAsync_ShouldThrow_WhenTooManyAttempts()
        {
            // Arrange
            var db = GetDbContext();
            db.Users.Add(new User
            {
                UserId = 1,
                AccountType = "user",
                FullName = "John",
                Email = "john@example.com",
                PasswordHash = "hash",
                CountryCode = "+91",
                PasswordResetOtp = "123456",
                OtpExpiry = DateTime.UtcNow.AddMinutes(5),
                OtpAttempts = 5
            });
            await db.SaveChangesAsync();

            var service = CreateService(db);

            // Act & Assert
            var act = () => service.VerifyOtpAndResetPasswordAsync("john@example.com", "123456", "NewPass1");
            await act.Should().ThrowAsync<UnauthorizedAccessException>().WithMessage("Too many attempts*");
        }

        // ──── Edge Case Tests ────

        [Fact]
        public async Task RegisterAsync_DuplicatePhone_ShouldThrowInvalidOperationException()
        {
            var db = GetDbContext();
            db.Users.Add(new User
            {
                UserId = 1, AccountType = "user", FullName = "User1",
                Email = "user1@example.com", PhoneNumber = "9876543210",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password1", 12),
                CountryCode = "+91"
            });
            await db.SaveChangesAsync();
            var service = CreateService(db);

            var request = new RegisterRequest
            {
                UserType = "user", Name = "User2", Email = "user2@example.com",
                Phone = "9876543210", CountryCode = "+91", Password = "Password1",
                Country = "IN", State = "TS", City = "Hyd"
            };

            var act = () => service.RegisterAsync(request);
            await act.Should().ThrowAsync<InvalidOperationException>();
        }

        [Fact]
        public async Task LoginAsync_EmptyUsername_ShouldThrowUnauthorizedException()
        {
            var db = GetDbContext();
            var service = CreateService(db);
            var request = new LoginRequest
            {
                UsernameOrEmail = "", Password = "Password1", CaptchaToken = "validToken"
            };

            var act = () => service.LoginAsync(request);
            await act.Should().ThrowAsync<UnauthorizedAccessException>();
        }

        [Fact]
        public async Task LoginAsync_NonExistentEmail_ShouldThrowUnauthorizedException()
        {
            var db = GetDbContext();
            var service = CreateService(db);
            var request = new LoginRequest
            {
                UsernameOrEmail = "nobody@example.com", Password = "Password1", CaptchaToken = "validToken"
            };

            var act = () => service.LoginAsync(request);
            await act.Should().ThrowAsync<UnauthorizedAccessException>();
        }

        [Fact]
        public async Task SendResetOtpAsync_Cooldown_ShouldThrowInvalidOperationException()
        {
            var db = GetDbContext();
            db.Users.Add(new User
            {
                UserId = 1, AccountType = "user", FullName = "John",
                Email = "john@example.com", PasswordHash = "hash", CountryCode = "+91",
                OtpExpiry = DateTime.UtcNow.AddSeconds(30) // OTP not yet expired (within 1-min window)
            });
            await db.SaveChangesAsync();
            var service = CreateService(db);

            var act = () => service.SendResetOtpAsync("john@example.com", "validToken");
            await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*wait*");
        }

        [Fact]
        public async Task VerifyOtpAndResetPasswordAsync_ExpiredOtp_ShouldThrowUnauthorizedException()
        {
            var db = GetDbContext();
            db.Users.Add(new User
            {
                UserId = 1, AccountType = "user", FullName = "John",
                Email = "john@example.com", PasswordHash = "hash", CountryCode = "+91",
                PasswordResetOtp = "123456",
                OtpExpiry = DateTime.UtcNow.AddMinutes(-5), // expired
                OtpAttempts = 0
            });
            await db.SaveChangesAsync();
            var service = CreateService(db);

            var act = () => service.VerifyOtpAndResetPasswordAsync("john@example.com", "123456", "NewPassword1");
            await act.Should().ThrowAsync<UnauthorizedAccessException>().WithMessage("OTP expired");
        }
    }
}
