using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using FluentAssertions;

namespace Localink.Tests.Services
{
    public class AdminServiceTests
    {
        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"AdminDb_{Guid.NewGuid()}")
                .Options;
            return new AppDbContext(options);
        }

        private void SeedBaseData(AppDbContext db)
        {
            var user = new User
            {
                UserId = 1,
                AccountType = "client",
                FullName = "John Doe",
                Email = "john@test.com",
                PhoneNumber = "9876543210",
                PasswordHash = "hashed",
                CountryCode = "+91"
            };
            var category = new Category { CategoryId = 1, CategoryName = "Food", IconUrl = "icon.png" };
            var subcategory = new Subcategory { SubcategoryId = 1, CategoryId = 1, SubcategoryName = "Fast Food" };
            var business = new Business
            {
                BusinessId = 1,
                BusinessName = "Test Biz",
                Description = "A great business for testing",
                CategoryId = 1,
                SubcategoryId = 1,
                UserId = 1,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            var adminDashboard = new AdminDashboard
            {
                Id = 1,
                BusinessId = 1,
                Status = BusinessStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            db.Users.Add(user);
            db.Categories.Add(category);
            db.Subcategories.Add(subcategory);
            db.Businesses.Add(business);
            db.AdminDashboards.Add(adminDashboard);
            db.SaveChanges();
        }

        [Fact]
        public async Task GetAllAsync_ReturnsAllAdminBusinesses()
        {
            // Arrange
            var db = GetDbContext();
            SeedBaseData(db);
            var mockEmailService = new Mock<IEmailService>();
            var service = new AdminService(db, mockEmailService.Object);

            // Act
            var result = await service.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            result[0].Name.Should().Be("Test Biz");
            result[0].Status.Should().Be("Pending");
        }

        [Fact]
        public async Task UpdateStatusAsync_UpdatesStatus_WhenFound()
        {
            // Arrange
            var db = GetDbContext();
            SeedBaseData(db);
            var mockEmailService = new Mock<IEmailService>();
            mockEmailService
                .Setup(e => e.SendBusinessStatusUpdateToUserAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(),
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string?>()))
                .Returns(Task.CompletedTask);

            var service = new AdminService(db, mockEmailService.Object);
            var dto = new UpdateStatusDto { Status = BusinessStatus.Approved };

            // Act
            await service.UpdateStatusAsync(1, dto, 100);

            // Assert
            var record = await db.AdminDashboards.FirstAsync(a => a.BusinessId == 1);
            record.Status.Should().Be(BusinessStatus.Approved);
            record.ActionBy.Should().Be(100);
        }

        [Fact]
        public async Task UpdateStatusAsync_ThrowsException_WhenNotFound()
        {
            // Arrange
            var db = GetDbContext();
            var mockEmailService = new Mock<IEmailService>();
            var service = new AdminService(db, mockEmailService.Object);
            var dto = new UpdateStatusDto { Status = BusinessStatus.Approved };

            // Act & Assert
            var act = () => service.UpdateStatusAsync(999, dto, 100);
            await act.Should().ThrowAsync<Exception>().WithMessage("Business not found in admin dashboard");
        }

        [Fact]
        public async Task ExportAsync_ThrowsException_WhenInvalidStatus()
        {
            // Arrange
            var db = GetDbContext();
            var mockEmailService = new Mock<IEmailService>();
            var service = new AdminService(db, mockEmailService.Object);

            // Act & Assert
            var act = () => service.ExportAsync("InvalidStatus");
            await act.Should().ThrowAsync<Exception>().WithMessage("Invalid status");
        }

        [Fact]
        public async Task ExportAsync_ReturnsByteArray_WhenValidStatus()
        {
            // Arrange
            var db = GetDbContext();
            SeedBaseData(db);
            var mockEmailService = new Mock<IEmailService>();
            var service = new AdminService(db, mockEmailService.Object);

            // Act
            var result = await service.ExportAsync("Pending");

            // Assert
            result.Should().NotBeNull();
            result.Length.Should().BeGreaterThan(0);
        }
    }
}
