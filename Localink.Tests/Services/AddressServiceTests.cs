using Xunit;
using Microsoft.EntityFrameworkCore;
using FluentAssertions;

namespace Localink.Tests.Services
{
    public class AddressServiceTests
    {
        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"AddressDb_{Guid.NewGuid()}")
                .Options;
            return new AppDbContext(options);
        }

        [Fact]
        public async Task GetAddressByUserId_ReturnsAddress_WhenExists()
        {
            // Arrange
            var db = GetDbContext();
            db.Addresses.Add(new Address
            {
                AddressId = 1,
                UserId = 1,
                Country = "India",
                State = "Telangana",
                City = "Hyderabad",
                StreetAddress = "123 Main St",
                Pincode = "500001"
            });
            await db.SaveChangesAsync();

            var service = new AddressService(db);

            // Act
            var result = await service.GetAddressByUserId(1);

            // Assert
            result.Should().NotBeNull();
            result!.City.Should().Be("Hyderabad");
            result.State.Should().Be("Telangana");
            result.Country.Should().Be("India");
            result.Street.Should().Be("123 Main St");
            result.Pincode.Should().Be("500001");
        }

        [Fact]
        public async Task GetAddressByUserId_ReturnsNull_WhenNotFound()
        {
            // Arrange
            var db = GetDbContext();
            var service = new AddressService(db);

            // Act
            var result = await service.GetAddressByUserId(999);

            // Assert
            result.Should().BeNull();
        }
    }
}
