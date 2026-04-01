using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using FluentAssertions;

namespace Localink.Tests.Services
{
    public class BusinessServiceTests
    {
        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"BusinessDb_{Guid.NewGuid()}")
                .ConfigureWarnings(w =>
                    w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
                .Options;
            return new AppDbContext(options);
        }

        private void SeedBaseData(AppDbContext db)
        {
            var user = new User
            {
                UserId = 1,
                AccountType = "client",
                FullName = "John",
                Email = "john@test.com",
                PasswordHash = "hash",
                CountryCode = "+91"
            };
            var category = new Category { CategoryId = 1, CategoryName = "Food", IconUrl = "icon.png" };
            var subcategory = new Subcategory { SubcategoryId = 1, CategoryId = 1, SubcategoryName = "Fast Food" };

            db.Users.Add(user);
            db.Categories.Add(category);
            db.Subcategories.Add(subcategory);
            db.SaveChanges();
        }

        private BusinessService CreateService(AppDbContext db)
        {
            var mockContact = new Mock<IContactService>();
            mockContact.Setup(c => c.AddContactAsync(It.IsAny<RegisterBusinessDto>(), It.IsAny<long>()))
                .Returns(Task.CompletedTask);

            var mockHours = new Mock<IHoursService>();
            mockHours.Setup(h => h.AddHoursAsync(It.IsAny<List<DayHoursDto>>(), It.IsAny<long>()))
                .Returns(Task.CompletedTask);

            var mockPhoto = new Mock<IPhotoService>();
            mockPhoto.Setup(p => p.SavePhotoAsync(It.IsAny<string>(), It.IsAny<long>()))
                .Returns(Task.CompletedTask);

            var mockEmail = new Mock<IEmailService>();
            mockEmail.Setup(e => e.SendNewBusinessNotificationToAdminAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(),
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            return new BusinessService(db, mockContact.Object, mockHours.Object, mockPhoto.Object, mockEmail.Object);
        }

        // ──── GetAllBusinessesAsync ────

        [Fact]
        public async Task GetAllBusinessesAsync_ReturnsBusinesses()
        {
            // Arrange
            var db = GetDbContext();
            SeedBaseData(db);
            db.Businesses.Add(new Business
            {
                BusinessId = 1,
                BusinessName = "Test Biz",
                Description = "A great business for testing",
                CategoryId = 1,
                SubcategoryId = 1,
                UserId = 1,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();

            var service = CreateService(db);

            // Act
            var result = await service.GetAllBusinessesAsync();

            // Assert
            result.Should().HaveCount(1);
        }

        // ──── CreateBusinessAsync ────

        [Fact]
        public async Task CreateBusinessAsync_ReturnsCreatedBusiness()
        {
            // Arrange
            var db = GetDbContext();
            SeedBaseData(db);
            var service = CreateService(db);
            var business = new Business
            {
                BusinessName = "New Biz",
                Description = "Description for new business",
                CategoryId = 1,
                SubcategoryId = 1,
                UserId = 1,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Act
            var result = await service.CreateBusinessAsync(business);

            // Assert
            result.Should().NotBeNull();
            result.BusinessName.Should().Be("New Biz");
            (await db.Businesses.CountAsync()).Should().Be(1);
        }

        // ──── GetBusinessByIdAsync ────

        [Fact]
        public async Task GetBusinessByIdAsync_ReturnsNull_WhenNotFound()
        {
            // Arrange
            var db = GetDbContext();
            var service = CreateService(db);

            // Act
            var result = await service.GetBusinessByIdAsync(999);

            // Assert
            result.Should().BeNull();
        }

        // ──── DeleteBusinessAsync ────

        [Fact]
        public async Task DeleteBusinessAsync_ReturnsTrue_WhenFound()
        {
            // Arrange
            var db = GetDbContext();
            SeedBaseData(db);
            db.Businesses.Add(new Business
            {
                BusinessId = 1,
                BusinessName = "Biz",
                Description = "Description for testing",
                CategoryId = 1,
                SubcategoryId = 1,
                UserId = 1,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();

            var service = CreateService(db);

            // Act
            var result = await service.DeleteBusinessAsync(1);

            // Assert
            result.Should().BeTrue();
            (await db.Businesses.CountAsync()).Should().Be(0);
        }

        [Fact]
        public async Task DeleteBusinessAsync_ReturnsFalse_WhenNotFound()
        {
            // Arrange
            var db = GetDbContext();
            var service = CreateService(db);

            // Act
            var result = await service.DeleteBusinessAsync(999);

            // Assert
            result.Should().BeFalse();
        }

        // ──── UpdateBusinessFullAsync ────

        [Fact]
        public async Task UpdateBusinessFullAsync_ReturnsTrue_WhenFound()
        {
            // Arrange
            var db = GetDbContext();
            SeedBaseData(db);
            db.Businesses.Add(new Business
            {
                BusinessId = 1,
                BusinessName = "Old Name",
                Description = "Old description for biz",
                CategoryId = 1,
                SubcategoryId = 1,
                UserId = 1,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();

            var service = CreateService(db);
            var dto = new UpdateBusinessDto
            {
                BusinessName = "New Name",
                Description = "New description for the biz",
                CategoryId = 1,
                SubcategoryId = 1,
                PhoneCode = "+91",
                PhoneNumber = "9999999999",
                Email = "new@test.com",
                City = "Hyd",
                State = "TS",
                Country = "India",
                Pincode = "500001",
                StreetAddress = "New Street"
            };

            // Act
            var result = await service.UpdateBusinessFullAsync(1, dto);

            // Assert
            result.Should().BeTrue();
            var updated = await db.Businesses.FindAsync(1L);
            updated!.BusinessName.Should().Be("New Name");
        }

        [Fact]
        public async Task UpdateBusinessFullAsync_ReturnsFalse_WhenNotFound()
        {
            // Arrange
            var db = GetDbContext();
            var service = CreateService(db);
            var dto = new UpdateBusinessDto { BusinessName = "X" };

            // Act
            var result = await service.UpdateBusinessFullAsync(999, dto);

            // Assert
            result.Should().BeFalse();
        }

        // ──── GetBusinessesByUserAsync ────

        [Fact]
        public async Task GetBusinessesByUserAsync_ThrowsException_WhenInvalidUserId()
        {
            // Arrange
            var db = GetDbContext();
            var service = CreateService(db);

            // Act & Assert
            var act = () => service.GetBusinessesByUserAsync(0);
            await act.Should().ThrowAsync<ArgumentException>();
        }

        // ──── GetBySubcategoryAsync ────

        [Fact]
        public async Task GetBySubcategoryAsync_ThrowsException_WhenInvalidId()
        {
            // Arrange
            var db = GetDbContext();
            var service = CreateService(db);

            // Act & Assert
            var act = () => service.GetBySubcategoryAsync(0);
            await act.Should().ThrowAsync<ArgumentException>();
        }

        // ──── GetByIdAsync ────

        [Fact]
        public async Task GetByIdAsync_ThrowsException_WhenInvalidId()
        {
            // Arrange
            var db = GetDbContext();
            var service = CreateService(db);

            // Act & Assert
            var act = () => service.GetByIdAsync(0);
            await act.Should().ThrowAsync<ArgumentException>();
        }

        // ──── SearchBusinessesAsync ────

        [Fact]
        public async Task SearchBusinessesAsync_ReturnsEmptyList_WhenQueryEmpty()
        {
            // Arrange
            var db = GetDbContext();
            var service = CreateService(db);

            // Act
            var result = await service.SearchBusinessesAsync("");

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task SearchBusinessesAsync_ReturnsEmptyList_WhenQueryWhitespace()
        {
            // Arrange
            var db = GetDbContext();
            var service = CreateService(db);

            // Act
            var result = await service.SearchBusinessesAsync("   ");

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        // ──── Edge Case Tests ────

        [Fact]
        public async Task RegisterBusinessAsync_InvalidCategory_ShouldThrowException()
        {
            var db = GetDbContext();
            SeedBaseData(db);
            var service = CreateService(db);
            var dto = new RegisterBusinessDto
            {
                BusinessName = "Biz", Description = "A great business testing",
                CategoryId = 999, SubcategoryId = 1,
                PhoneCode = "+91", PhoneNumber = "9876543210", Email = "b@t.com",
                City = "Hyd", State = "TS", Country = "IN", Pincode = "500001",
                Address = "Street 1",
                Hours = new List<DayHoursDto>()
            };

            var act = () => service.RegisterBusinessAsync(dto, 1);
            await act.Should().ThrowAsync<Exception>().WithMessage("Invalid category");
        }

        [Fact]
        public async Task RegisterBusinessAsync_InvalidSubcategory_ShouldThrowException()
        {
            var db = GetDbContext();
            SeedBaseData(db);
            var service = CreateService(db);
            var dto = new RegisterBusinessDto
            {
                BusinessName = "Biz", Description = "A great business testing",
                CategoryId = 1, SubcategoryId = 999,
                PhoneCode = "+91", PhoneNumber = "9876543210", Email = "b@t.com",
                City = "Hyd", State = "TS", Country = "IN", Pincode = "500001",
                Address = "Street 1",
                Hours = new List<DayHoursDto>()
            };

            var act = () => service.RegisterBusinessAsync(dto, 1);
            await act.Should().ThrowAsync<Exception>().WithMessage("Invalid subcategory");
        }

        [Fact]
        public async Task RegisterBusinessAsync_OversizedPhoto_ShouldThrowException()
        {
            var db = GetDbContext();
            SeedBaseData(db);
            var service = CreateService(db);
            var dto = new RegisterBusinessDto
            {
                BusinessName = "Biz", Description = "A great business testing",
                CategoryId = 1, SubcategoryId = 1,
                PhoneCode = "+91", PhoneNumber = "9876543210", Email = "b@t.com",
                City = "Hyd", State = "TS", Country = "IN", Pincode = "500001",
                Address = "Street 1",
                Hours = new List<DayHoursDto>(),
                Photo = new string('A', 5_000_001) // > 5MB
            };

            var act = () => service.RegisterBusinessAsync(dto, 1);
            await act.Should().ThrowAsync<Exception>().WithMessage("Image too large");
        }

        [Fact]
        public async Task RegisterBusinessAsync_ValidData_ShouldReturnBusinessId()
        {
            var db = GetDbContext();
            SeedBaseData(db);
            var service = CreateService(db);
            var dto = new RegisterBusinessDto
            {
                BusinessName = "Good Biz", Description = "A great business for real",
                CategoryId = 1, SubcategoryId = 1,
                PhoneCode = "+91", PhoneNumber = "9876543210", Email = "b@t.com",
                City = "Hyd", State = "TS", Country = "IN", Pincode = "500001",
                Address = "123 Main St",
                Hours = new List<DayHoursDto>()
            };

            var result = await service.RegisterBusinessAsync(dto, 1);
            result.Should().BeGreaterThan(0);
            (await db.Businesses.CountAsync()).Should().Be(1);
            (await db.AdminDashboards.CountAsync()).Should().Be(1);
        }

        [Fact]
        public async Task GetBusinessPreviewAsync_ReturnsNull_WhenNotFound()
        {
            var db = GetDbContext();
            var service = CreateService(db);

            var result = await service.GetBusinessPreviewAsync(999);
            result.Should().BeNull();
        }

        [Fact]
        public async Task GetBusinessesByUserAsync_ReturnsBusinesses_WhenUserHasBusinesses()
        {
            var db = GetDbContext();
            SeedBaseData(db);
            db.Businesses.Add(new Business
            {
                BusinessId = 1, BusinessName = "My Biz", Description = "Biz description for user",
                CategoryId = 1, SubcategoryId = 1, UserId = 1,
                CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();

            var service = CreateService(db);
            var result = await service.GetBusinessesByUserAsync(1);
            result.Should().HaveCount(1);
        }

        [Fact]
        public async Task GetBySubcategoryAsync_ReturnsBusinesses_WhenValid()
        {
            var db = GetDbContext();
            SeedBaseData(db);
            db.Businesses.Add(new Business
            {
                BusinessId = 1, BusinessName = "Sub Biz", Description = "Biz for subcategory test",
                CategoryId = 1, SubcategoryId = 1, UserId = 1,
                CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();

            var service = CreateService(db);
            var result = await service.GetBySubcategoryAsync(1);
            result.Should().HaveCount(1);
        }

        [Fact]
        public async Task SearchBusinessesAsync_ReturnsMatches_WhenQueryMatchesName()
        {
            var db = GetDbContext();
            SeedBaseData(db);
            db.Businesses.Add(new Business
            {
                BusinessId = 1, BusinessName = "Pizza Palace", Description = "Best pizza in town",
                CategoryId = 1, SubcategoryId = 1, UserId = 1,
                CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();

            var service = CreateService(db);
            var result = await service.SearchBusinessesAsync("Pizza");
            result.Should().HaveCount(1);
        }
    }
}

