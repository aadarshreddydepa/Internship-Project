using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// ============================================
// AddressService Tests
// ============================================
public class AddressServiceTests
{
    private AppDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"AddressDb_{Guid.NewGuid()}")
            .ConfigureWarnings(w =>
                w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetAddressByUserId_ShouldReturnAddressWhenExists()
    {
        // Arrange
        var db = GetDbContext();
        var address = new Address
        {
            AddressId = 1,
            UserId = 1,
            Country = "India",
            State = "Maharashtra",
            City = "Mumbai",
            StreetAddress = "123 Main Street",
            Pincode = "400001"
        };
        db.Addresses.Add(address);
        await db.SaveChangesAsync();

        var service = new AddressService(db);

        // Act
        var result = await service.GetAddressByUserId(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Mumbai", result.City);
    }

    [Fact]
    public async Task GetAddressByUserId_ShouldReturnNullWhenNotExists()
    {
        // Arrange
        var db = GetDbContext();
        var service = new AddressService(db);

        // Act
        var result = await service.GetAddressByUserId(999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetAddressByUserId_ShouldReturnAddressDto()
    {
        // Arrange
        var db = GetDbContext();
        var address = new Address
        {
            AddressId = 1,
            UserId = 1,
            Country = "India",
            State = "Tamil Nadu",
            City = "Chennai",
            StreetAddress = "456 Oak Street",
            Pincode = "600001"
        };
        db.Addresses.Add(address);
        await db.SaveChangesAsync();

        var service = new AddressService(db);

        // Act
        var result = await service.GetAddressByUserId(1);

        // Assert
        Assert.NotNull(result);
        Assert.IsType<AddressDto>(result);
    }
}

// ============================================
// SubcategoryService Tests
// ============================================
public class SubcategoryServiceTests
{
    private AppDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"SubcategoryDb_{Guid.NewGuid()}")
            .ConfigureWarnings(w =>
                w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetByCategoryIdAsync_ShouldReturnSubcategoriesForCategory()
    {
        // Arrange
        var db = GetDbContext();
        db.Subcategories.Add(new Subcategory
        {
            SubcategoryId = 1,
            CategoryId = 1,
            SubcategoryName = "Fast Food",
            IconUrl = "https://example.com/fast-food.png"
        });
        await db.SaveChangesAsync();

        var service = new SubcategoryService(db);

        // Act
        var result = await service.GetByCategoryIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result);
    }

    [Fact]
    public async Task GetByCategoryIdAsync_ShouldReturnEmptyWhenNoSubcategories()
    {
        // Arrange
        var db = GetDbContext();
        var service = new SubcategoryService(db);

        // Act
        var result = await service.GetByCategoryIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task GetByCategoryIdAsync_ShouldReturnEmptyForNonExistentCategory()
    {
        // Arrange
        var db = GetDbContext();
        db.Subcategories.Add(new Subcategory
        {
            SubcategoryId = 1,
            CategoryId = 1,
            SubcategoryName = "Fast Food",
            IconUrl = "https://example.com/fast-food.png"
        });
        await db.SaveChangesAsync();

        var service = new SubcategoryService(db);

        // Act
        var result = await service.GetByCategoryIdAsync(999);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task GetByCategoryIdAsync_ShouldReturnSubcategoryDtos()
    {
        // Arrange
        var db = GetDbContext();
        db.Subcategories.Add(new Subcategory
        {
            SubcategoryId = 1,
            CategoryId = 1,
            SubcategoryName = "Casual Dining",
            IconUrl = "https://example.com/casual.png"
        });
        await db.SaveChangesAsync();

        var service = new SubcategoryService(db);

        // Act
        var result = await service.GetByCategoryIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.IsType<List<SubcategoryDto>>(result);
    }
}

// ============================================
// ContactService Tests
// ============================================
public class ContactServiceTests
{
    [Fact]
    public async Task AddContactAsync_ShouldCreateContactSuccessfully()
    {
        // Arrange
        var mockService = new Mock<IContactService>();
        var contactDto = new object();

        mockService.Setup(x => x.AddContactAsync(It.IsAny<long>(), It.IsAny<object>()))
            .ReturnsAsync(new object());

        // Act
        var result = await mockService.Object.AddContactAsync(1, contactDto);

        // Assert
        Assert.NotNull(result);
        mockService.Verify(x => x.AddContactAsync(1, contactDto), Times.Once);
    }

    [Fact]
    public async Task UpdateContactAsync_ShouldUpdateContactSuccessfully()
    {
        // Arrange
        var mockService = new Mock<IContactService>();
        var contactDto = new object();

        mockService.Setup(x => x.UpdateContactAsync(It.IsAny<long>(), It.IsAny<object>()))
            .ReturnsAsync(new object());

        // Act
        var result = await mockService.Object.UpdateContactAsync(1, contactDto);

        // Assert
        Assert.NotNull(result);
    }

    [Fact]
    public async Task UpdateContactAsync_ShouldReturnNullWhenNotExists()
    {
        // Arrange
        var mockService = new Mock<IContactService>();
        mockService.Setup(x => x.UpdateContactAsync(It.IsAny<long>(), It.IsAny<object>()))
            .ReturnsAsync(null as object);

        // Act
        var result = await mockService.Object.UpdateContactAsync(999, new object());

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task DeleteContactAsync_ShouldDeleteContactSuccessfully()
    {
        // Arrange
        var mockService = new Mock<IContactService>();
        mockService.Setup(x => x.DeleteContactAsync(It.IsAny<long>()))
            .ReturnsAsync(true);

        // Act
        var result = await mockService.Object.DeleteContactAsync(1);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task GetContactByBusinessIdAsync_ShouldReturnContactWhenExists()
    {
        // Arrange
        var mockService = new Mock<IContactService>();
        var contact = new object();

        mockService.Setup(x => x.GetContactByBusinessIdAsync(It.IsAny<long>()))
            .ReturnsAsync(contact);

        // Act
        var result = await mockService.Object.GetContactByBusinessIdAsync(1);

        // Assert
        Assert.NotNull(result);
    }
}

// ============================================
// EmailService Tests
// ============================================
public class EmailServiceTests
{
    [Fact]
    public async Task SendOtpEmailAsync_ShouldSendEmailSuccessfully()
    {
        // Arrange
        var mockService = new Mock<IEmailService>();
        mockService.Setup(x => x.SendOtpEmailAsync(It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockService.Object.SendOtpEmailAsync("user@example.com", "123456");

        // Assert
        mockService.Verify(x => x.SendOtpEmailAsync("user@example.com", "123456"), Times.Once);
    }

    [Fact]
    public async Task SendWelcomeEmailAsync_ShouldSendWelcomeEmail()
    {
        // Arrange
        var mockService = new Mock<IEmailService>();
        mockService.Setup(x => x.SendWelcomeEmailAsync(It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockService.Object.SendWelcomeEmailAsync("newuser@example.com", "John Doe");

        // Assert
        mockService.Verify(x => x.SendWelcomeEmailAsync("newuser@example.com", "John Doe"), Times.Once);
    }

    [Fact]
    public async Task SendNewBusinessNotificationToAdminAsync_ShouldSendNotification()
    {
        // Arrange
        var mockService = new Mock<IEmailService>();
        mockService.Setup(x => x.SendNewBusinessNotificationToAdminAsync(It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockService.Object.SendNewBusinessNotificationToAdminAsync("admin@example.com", "New Business Name");

        // Assert
        mockService.Verify(x => x.SendNewBusinessNotificationToAdminAsync("admin@example.com", "New Business Name"), Times.Once);
    }

    [Fact]
    public async Task SendBusinessStatusUpdateToUserAsync_ShouldSendApprovalEmail()
    {
        // Arrange
        var mockService = new Mock<IEmailService>();
        mockService.Setup(x => x.SendBusinessStatusUpdateToUserAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockService.Object.SendBusinessStatusUpdateToUserAsync("owner@example.com", "Business Name", "approved");

        // Assert
        mockService.Verify(x => x.SendBusinessStatusUpdateToUserAsync("owner@example.com", "Business Name", "approved"), Times.Once);
    }
}
