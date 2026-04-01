using Xunit;
using Microsoft.EntityFrameworkCore;
using FluentAssertions;

namespace Localink.Tests.Services
{
    public class UserServiceTests
    {
        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"UserDb_{Guid.NewGuid()}")
                .Options;
            return new AppDbContext(options);
        }

        private void SeedUser(AppDbContext db)
        {
            db.Users.Add(new User
            {
                UserId = 1,
                AccountType = "user",
                FullName = "John Doe",
                Email = "john@test.com",
                PhoneNumber = "9876543210",
                PasswordHash = "hash",
                CountryCode = "+91"
            });
            db.Addresses.Add(new Address
            {
                AddressId = 1,
                UserId = 1,
                Country = "India",
                State = "TS",
                City = "Hyderabad",
                StreetAddress = "123 Main St",
                Pincode = "500001"
            });
            db.SaveChanges();
        }

        // ──── GetUserProfileAsync ────

        [Fact]
        public async Task GetUserProfileAsync_ReturnsProfile_WhenExists()
        {
            // Arrange
            var db = GetDbContext();
            SeedUser(db);
            var service = new UserService(db);

            // Act
            var result = await service.GetUserProfileAsync(1);

            // Assert
            result.Should().NotBeNull();
            result!.FullName.Should().Be("John Doe");
            result.Email.Should().Be("john@test.com");
            result.Phone.Should().Be("9876543210");
            result.Address.Should().NotBeNull();
            result.Address.City.Should().Be("Hyderabad");
        }

        [Fact]
        public async Task GetUserProfileAsync_ReturnsNull_WhenNotFound()
        {
            // Arrange
            var db = GetDbContext();
            var service = new UserService(db);

            // Act
            var result = await service.GetUserProfileAsync(999);

            // Assert
            result.Should().BeNull();
        }

        // ──── UpdateUserProfileAsync ────

        [Fact]
        public async Task UpdateUserProfileAsync_ReturnsTrue_WhenUserExists()
        {
            // Arrange
            var db = GetDbContext();
            SeedUser(db);
            var service = new UserService(db);
            var dto = new UpdateUserProfileDto
            {
                FullName = "John Updated",
                Phone = "1111111111",
                Address = new AddressDto
                {
                    Street = "New Street",
                    City = "Mumbai",
                    State = "MH",
                    Country = "India",
                    Pincode = "400001"
                }
            };

            // Act
            var result = await service.UpdateUserProfileAsync(1, dto);

            // Assert
            result.Should().BeTrue();
            var user = await db.Users.FirstAsync(u => u.UserId == 1);
            user.FullName.Should().Be("John Updated");
            user.PhoneNumber.Should().Be("1111111111");

            var address = await db.Addresses.FirstAsync(a => a.UserId == 1);
            address.City.Should().Be("Mumbai");
        }

        [Fact]
        public async Task UpdateUserProfileAsync_ReturnsFalse_WhenUserNotFound()
        {
            // Arrange
            var db = GetDbContext();
            var service = new UserService(db);
            var dto = new UpdateUserProfileDto
            {
                FullName = "Nobody",
                Address = new AddressDto()
            };

            // Act
            var result = await service.UpdateUserProfileAsync(999, dto);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task UpdateUserProfileAsync_CreatesAddress_WhenNoExistingAddress()
        {
            // Arrange
            var db = GetDbContext();
            db.Users.Add(new User
            {
                UserId = 2,
                AccountType = "user",
                FullName = "Jane",
                Email = "jane@test.com",
                PasswordHash = "hash",
                CountryCode = "+91"
            });
            await db.SaveChangesAsync();

            var service = new UserService(db);
            var dto = new UpdateUserProfileDto
            {
                FullName = "Jane Updated",
                Phone = "2222222222",
                Address = new AddressDto
                {
                    Street = "456 Ave",
                    City = "Delhi",
                    State = "DL",
                    Country = "India",
                    Pincode = "110001"
                }
            };

            // Act
            var result = await service.UpdateUserProfileAsync(2, dto);

            // Assert
            result.Should().BeTrue();
            var address = await db.Addresses.FirstOrDefaultAsync(a => a.UserId == 2);
            address.Should().NotBeNull();
            address!.City.Should().Be("Delhi");
        }
    }
}
