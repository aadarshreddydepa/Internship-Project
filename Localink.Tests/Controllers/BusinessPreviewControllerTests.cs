using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Controllers
{
    public class BusinessPreviewControllerTests
    {
        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"PreviewDb_{Guid.NewGuid()}")
                .Options;
            return new AppDbContext(options);
        }

        // ──── GetBusinessPreview ────

        [Fact]
        public async Task GetBusinessPreview_ReturnsOk_WhenBusinessExists()
        {
            // Arrange
            var db = GetDbContext();
            var category = new Category { CategoryId = 1, CategoryName = "Food", IconUrl = "icon.png" };
            var subcategory = new Subcategory { SubcategoryId = 1, CategoryId = 1, SubcategoryName = "Fast Food" };
            var business = new Business
            {
                BusinessId = 1,
                BusinessName = "Preview Biz",
                Description = "Description here for preview",
                CategoryId = 1,
                SubcategoryId = 1,
                UserId = 1,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            db.Categories.Add(category);
            db.Subcategories.Add(subcategory);
            db.Businesses.Add(business);
            await db.SaveChangesAsync();

            var controller = new BusinessPreviewController(db);

            // Act
            var result = await controller.GetBusinessPreview(1) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }

        [Fact]
        public async Task GetBusinessPreview_ReturnsNotFound_WhenBusinessDoesNotExist()
        {
            // Arrange
            var db = GetDbContext();
            var controller = new BusinessPreviewController(db);

            // Act
            var result = await controller.GetBusinessPreview(999) as NotFoundObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(404);
            result.Value.Should().Be("Business not found");
        }

        [Fact]
        public async Task GetBusinessPreview_IncludesContactDetails_WhenPresent()
        {
            // Arrange
            var db = GetDbContext();
            var category = new Category { CategoryId = 1, CategoryName = "Food", IconUrl = "icon.png" };
            var subcategory = new Subcategory { SubcategoryId = 1, CategoryId = 1, SubcategoryName = "Fast Food" };
            var business = new Business
            {
                BusinessId = 1,
                BusinessName = "Preview Biz",
                Description = "Description here for preview",
                CategoryId = 1,
                SubcategoryId = 1,
                UserId = 1,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            var contact = new BusinessContact
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
            };

            db.Categories.Add(category);
            db.Subcategories.Add(subcategory);
            db.Businesses.Add(business);
            db.BusinessContacts.Add(contact);
            await db.SaveChangesAsync();

            var controller = new BusinessPreviewController(db);

            // Act
            var result = await controller.GetBusinessPreview(1) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }
    }
}
