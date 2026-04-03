using Xunit;
using Moq;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using FluentAssertions;

namespace Localink.Tests.Services
{
    public class EmailServiceTests
    {
        // EmailService depends on IConfiguration and ILogger<EmailService>.
        // Since actually sending emails requires SMTP, we test constructor and
        // that methods throw when SMTP is not configured (fail-safe behavior).

        private IConfiguration GetConfiguration()
        {
            return new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    { "Email:AppName", "Localink" },
                    { "Email:From", "test@localink.com" },
                    { "Email:Host", "smtp.invalid.local" },
                    { "Email:Port", "587" },
                    { "Email:Username", "testuser" },
                    { "Email:Password", "testpass" }
                })
                .Build();
        }

        [Fact]
        public async Task SendOtpEmailAsync_ThrowsException_WhenSmtpUnavailable()
        {
            // Arrange
            var config = GetConfiguration();
            var logger = new Mock<ILogger<EmailService>>();
            var service = new EmailService(config, logger.Object);

            // Act & Assert
            // SMTP is not available, so this should throw
            var act = () => service.SendOtpEmailAsync("user@test.com", "123456");
            await act.Should().ThrowAsync<Exception>();
        }

        [Fact]
        public async Task SendWelcomeEmailAsync_ThrowsException_WhenSmtpUnavailable()
        {
            // Arrange
            var config = GetConfiguration();
            var logger = new Mock<ILogger<EmailService>>();
            var service = new EmailService(config, logger.Object);

            // Act & Assert
            var act = () => service.SendWelcomeEmailAsync("user@test.com", "Test User");
            await act.Should().ThrowAsync<Exception>();
        }

        [Fact]
        public async Task SendNewBusinessNotificationToAdminAsync_ThrowsException_WhenSmtpUnavailable()
        {
            // Arrange
            var config = GetConfiguration();
            var logger = new Mock<ILogger<EmailService>>();
            var service = new EmailService(config, logger.Object);

            // Act & Assert
            var act = () => service.SendNewBusinessNotificationToAdminAsync(
                "admin@test.com", "Biz", "Cat", "Desc", "Addr", "Phone", "email@test.com");
            await act.Should().ThrowAsync<Exception>();
        }

        [Fact]
        public async Task SendBusinessStatusUpdateToUserAsync_ThrowsException_WhenSmtpUnavailable()
        {
            // Arrange
            var config = GetConfiguration();
            var logger = new Mock<ILogger<EmailService>>();
            var service = new EmailService(config, logger.Object);

            // Act & Assert
            var act = () => service.SendBusinessStatusUpdateToUserAsync(
                "user@test.com", "Owner", "BizName", "Cat", "Approved", null);
            await act.Should().ThrowAsync<Exception>();
        }
    }
}
