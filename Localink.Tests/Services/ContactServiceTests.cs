using Xunit;
using Microsoft.EntityFrameworkCore;
using FluentAssertions;

namespace Localink.Tests.Services
{
    public class ContactServiceTests
    {
        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"ContactDb_{Guid.NewGuid()}")
                .Options;
            return new AppDbContext(options);
        }

        // ──── AddContactAsync ────

        [Fact]
        public async Task AddContactAsync_ShouldAddContact()
        {
            // Arrange
            var db = GetDbContext();
            var service = new ContactService(db);
            var dto = new RegisterBusinessDto
            {
                PhoneCode = "+91",
                PhoneNumber = "9876543210",
                Email = "biz@test.com",
                Website = "biz.com",
                Address = "123 St",
                City = "Hyd",
                State = "TS",
                Country = "India",
                Pincode = "500001",
                BusinessName = "Test",
                Description = "Test Desc",
                CategoryId = 1,
                SubcategoryId = 1,
                Hours = new List<DayHoursDto>()
            };

            // Act
            await service.AddContactAsync(dto, 1);

            // Assert
            var contacts = await db.BusinessContacts.ToListAsync();
            contacts.Should().HaveCount(1);
            contacts[0].Email.Should().Be("biz@test.com");
        }

        [Fact]
        public async Task AddContactAsync_ThrowsException_WhenPhoneCodeMissing()
        {
            // Arrange
            var db = GetDbContext();
            var service = new ContactService(db);
            var dto = new RegisterBusinessDto
            {
                PhoneCode = "",
                PhoneNumber = "9876543210",
                Email = "biz@test.com",
                BusinessName = "Test",
                Description = "Desc",
                CategoryId = 1,
                SubcategoryId = 1,
                Hours = new List<DayHoursDto>()
            };

            // Act & Assert
            var act = () => service.AddContactAsync(dto, 1);
            await act.Should().ThrowAsync<ArgumentException>().WithMessage("Phone code and number required");
        }

        // ──── UpdateContactAsync ────

        [Fact]
        public async Task UpdateContactAsync_ReturnsUpdatedContact_WhenExists()
        {
            // Arrange
            var db = GetDbContext();
            db.BusinessContacts.Add(new BusinessContact
            {
                ContactId = 1,
                BusinessId = 1,
                PhoneCode = "+91",
                PhoneNumber = "1111111111",
                Email = "old@test.com",
                Website = "old.com",
                StreetAddress = "Old St",
                City = "Old City",
                State = "Old State",
                Country = "India",
                Pincode = "100001",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();

            var service = new ContactService(db);
            var updated = new BusinessContact
            {
                PhoneCode = "+1",
                PhoneNumber = "2222222222",
                Email = "new@test.com",
                Website = "new.com",
                StreetAddress = "New St",
                City = "New City",
                State = "New State",
                Country = "USA",
                Pincode = "200002"
            };

            // Act
            var result = await service.UpdateContactAsync(1, updated);

            // Assert
            result.Should().NotBeNull();
            result!.Email.Should().Be("new@test.com");
            result.City.Should().Be("New City");
        }

        [Fact]
        public async Task UpdateContactAsync_ReturnsNull_WhenNotFound()
        {
            // Arrange
            var db = GetDbContext();
            var service = new ContactService(db);

            // Act
            var result = await service.UpdateContactAsync(999, new BusinessContact());

            // Assert
            result.Should().BeNull();
        }

        // ──── DeleteContactAsync ────

        [Fact]
        public async Task DeleteContactAsync_ReturnsTrue_WhenFound()
        {
            // Arrange
            var db = GetDbContext();
            db.BusinessContacts.Add(new BusinessContact
            {
                ContactId = 1,
                BusinessId = 1,
                PhoneCode = "+91",
                PhoneNumber = "9876543210",
                Email = "x@x.com",
                Website = "x.com",
                StreetAddress = "St",
                City = "C",
                State = "S",
                Country = "IN",
                Pincode = "100001",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();

            var service = new ContactService(db);

            // Act
            var result = await service.DeleteContactAsync(1);

            // Assert
            result.Should().BeTrue();
            (await db.BusinessContacts.CountAsync()).Should().Be(0);
        }

        [Fact]
        public async Task DeleteContactAsync_ReturnsFalse_WhenNotFound()
        {
            // Arrange
            var db = GetDbContext();
            var service = new ContactService(db);

            // Act
            var result = await service.DeleteContactAsync(999);

            // Assert
            result.Should().BeFalse();
        }

        // ──── GetContactByBusinessIdAsync ────

        [Fact]
        public async Task GetContactByBusinessIdAsync_ReturnsContact_WhenExists()
        {
            // Arrange
            var db = GetDbContext();
            db.BusinessContacts.Add(new BusinessContact
            {
                ContactId = 1,
                BusinessId = 1,
                PhoneCode = "+91",
                PhoneNumber = "9876543210",
                Email = "biz@test.com",
                Website = "biz.com",
                StreetAddress = "123 St",
                City = "Hyd",
                State = "TS",
                Country = "India",
                Pincode = "500001",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();

            var service = new ContactService(db);

            // Act
            var result = await service.GetContactByBusinessIdAsync(1);

            // Assert
            result.Should().NotBeNull();
        }

        [Fact]
        public async Task GetContactByBusinessIdAsync_ReturnsNull_WhenNotFound()
        {
            // Arrange
            var db = GetDbContext();
            var service = new ContactService(db);

            // Act
            var result = await service.GetContactByBusinessIdAsync(999);

            // Assert
            result.Should().BeNull();
        }
    }
}
