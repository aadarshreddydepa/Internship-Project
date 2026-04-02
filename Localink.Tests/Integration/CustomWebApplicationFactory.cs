using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Moq;

namespace Localink.Tests.Integration
{
    /// <summary>
    /// Custom WebApplicationFactory that replaces SQL Server with InMemory DB
    /// and mocks external dependencies (Email, Captcha) for integration testing.
    /// </summary>
    public class CustomWebApplicationFactory : WebApplicationFactory<Program>
    {
        private readonly string _dbName = $"IntegrationTestDb_{Guid.NewGuid()}";

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureServices(services =>
            {
                // Remove existing DbContext registration
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                if (descriptor != null)
                    services.Remove(descriptor);

                // Remove the AppDbContext registration itself
                var dbContextDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(AppDbContext));
                if (dbContextDescriptor != null)
                    services.Remove(dbContextDescriptor);

                // Add InMemory database
                services.AddDbContext<AppDbContext>(options =>
                {
                    options.UseInMemoryDatabase(_dbName);
                    options.ConfigureWarnings(w =>
                        w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning));
                });

                // Mock ICaptchaService to always return true
                var mockCaptcha = new Mock<ICaptchaService>();
                mockCaptcha.Setup(c => c.VerifyAsync(It.IsAny<string>()))
                    .ReturnsAsync(true);

                var captchaDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(ICaptchaService));
                if (captchaDescriptor != null)
                    services.Remove(captchaDescriptor);
                services.AddScoped(_ => mockCaptcha.Object);

                // Mock IEmailService to no-op
                var mockEmail = new Mock<IEmailService>();
                mockEmail.Setup(e => e.SendWelcomeEmailAsync(It.IsAny<string>(), It.IsAny<string>()))
                    .Returns(Task.CompletedTask);
                mockEmail.Setup(e => e.SendOtpEmailAsync(It.IsAny<string>(), It.IsAny<string>()))
                    .Returns(Task.CompletedTask);
                mockEmail.Setup(e => e.SendNewBusinessNotificationToAdminAsync(
                        It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(),
                        It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                    .Returns(Task.CompletedTask);
                mockEmail.Setup(e => e.SendBusinessStatusUpdateToUserAsync(
                        It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(),
                        It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string?>()))
                    .Returns(Task.CompletedTask);

                var emailDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IEmailService));
                if (emailDescriptor != null)
                    services.Remove(emailDescriptor);
                services.AddScoped(_ => mockEmail.Object);
            });

            builder.UseEnvironment("Development");
        }

        /// <summary>
        /// Seeds essential data (categories, subcategories) into the test database.
        /// </summary>
        public void SeedDatabase(Action<AppDbContext> seedAction)
        {
            using var scope = Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.EnsureCreated();
            seedAction(db);
        }
    }
}
