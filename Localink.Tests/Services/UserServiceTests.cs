using Xunit;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

public class UserServiceTests
{
    private AppDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"UserDb_{Guid.NewGuid()}")
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
            IsEmailVerified = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private Address ValidAddress()
    {
        return new Address
        {
            AddressId = 1,
            UserId = 1,
            Country = "India",
            State = "Maharashtra",
            City = "Mumbai",
            StreetAddress = "123 Main Street",
            Pincode = "400001"
        };
    }

    [Fact]
    public async Task GetUserProfileAsync_ShouldReturnUserProfile()
    {
        // Arrange
        var db = GetDbContext();
        var user = ValidUser();
        var address = ValidAddress();

        db.Users.Add(user);
        db.Addresses.Add(address);
        await db.SaveChangesAsync();

        var service = new UserService(db);

        // Act
        var result = await service.GetUserProfileAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("John Doe", result.FullName);
    }

    [Fact]
    public async Task GetUserProfileAsync_WithInvalidUserId_ShouldReturnNull()
    {
        // Arrange
        var db = GetDbContext();
        var service = new UserService(db);

        // Act
        var result = await service.GetUserProfileAsync(999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateUserProfileAsync_ShouldUpdateProfile()
    {
        // Arrange
        var db = GetDbContext();
        var user = ValidUser();
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var service = new UserService(db);

        var updateDto = new UpdateUserProfileDto
        {
            FullName = "Jane Doe",
            Phone = "+919876543211",
            Address = new AddressDto
            {
                Country = "India",
                State = "Tamil Nadu",
                City = "Chennai",
                StreetAddress = "456 Oak Street",
                Pincode = "600001"
            }
        };

        // Act
        var result = await service.UpdateUserProfileAsync(1, updateDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Jane Doe", result.FullName);
    }

    [Fact]
    public async Task UpdateUserProfileAsync_WithInvalidUserId_ShouldReturnNull()
    {
        // Arrange
        var db = GetDbContext();
        var service = new UserService(db);

        var updateDto = new UpdateUserProfileDto
        {
            FullName = "Jane Doe",
            Phone = "+919876543211",
            Address = new AddressDto
            {
                Country = "India",
                State = "Tamil Nadu",
                City = "Chennai",
                StreetAddress = "456 Oak Street",
                Pincode = "600001"
            }
        };

        // Act
        var result = await service.UpdateUserProfileAsync(999, updateDto);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateUserProfileAsync_ShouldCreateAddressIfNotExists()
    {
        // Arrange
        var db = GetDbContext();
        var user = ValidUser();
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var service = new UserService(db);

        var updateDto = new UpdateUserProfileDto
        {
            FullName = "John Doe",
            Phone = "+919876543210",
            Address = new AddressDto
            {
                Country = "India",
                State = "Maharashtra",
                City = "Mumbai",
                StreetAddress = "123 Main Street",
                Pincode = "400001"
            }
        };

        // Act
        var result = await service.UpdateUserProfileAsync(1, updateDto);

        // Assert
        Assert.NotNull(result);
        var address = await db.Addresses.FirstOrDefaultAsync(a => a.UserId == 1);
        Assert.NotNull(address);
        Assert.Equal("Mumbai", address.City);
    }

    [Fact]
    public async Task UpdateUserProfileAsync_ShouldUpdateAddressIfExists()
    {
        // Arrange
        var db = GetDbContext();
        var user = ValidUser();
        var address = ValidAddress();

        db.Users.Add(user);
        db.Addresses.Add(address);
        await db.SaveChangesAsync();

        var service = new UserService(db);

        var updateDto = new UpdateUserProfileDto
        {
            FullName = "John Doe",
            Phone = "+919876543210",
            Address = new AddressDto
            {
                Country = "India",
                State = "Tamil Nadu",
                City = "Chennai",
                StreetAddress = "789 New Street",
                Pincode = "600001"
            }
        };

        // Act
        var result = await service.UpdateUserProfileAsync(1, updateDto);

        // Assert
        Assert.NotNull(result);
        var updatedAddress = await db.Addresses.FirstOrDefaultAsync(a => a.UserId == 1);
        Assert.NotNull(updatedAddress);
        Assert.Equal("Chennai", updatedAddress.City);
    }
}
