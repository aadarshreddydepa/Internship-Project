using Xunit;
using Moq;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using FluentAssertions;

namespace Localink.Tests.Services
{
    public class PhotoServiceTests
    {
        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"PhotoDb_{Guid.NewGuid()}")
                .Options;
            return new AppDbContext(options);
        }

        private void SeedBusiness(AppDbContext db)
        {
            db.Users.Add(new User
            {
                UserId = 1, AccountType = "client", FullName = "John",
                Email = "j@t.com", PasswordHash = "h", CountryCode = "+91"
            });
            db.Categories.Add(new Category { CategoryId = 1, CategoryName = "Food", IconUrl = "i.png" });
            db.Subcategories.Add(new Subcategory { SubcategoryId = 1, CategoryId = 1, SubcategoryName = "Fast" });
            db.Businesses.Add(new Business
            {
                BusinessId = 1, BusinessName = "Biz", Description = "Test business description",
                CategoryId = 1, SubcategoryId = 1, UserId = 1,
                CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
            });
            db.SaveChanges();
        }

        private string GetTempWebRoot()
        {
            var path = Path.Combine(Path.GetTempPath(), $"localink_test_{Guid.NewGuid()}");
            Directory.CreateDirectory(path);
            return path;
        }

        // ──── UploadPhotoAsync ────

        [Fact]
        public async Task UploadPhotoAsync_ReturnsNull_WhenBusinessNotFound()
        {
            // Arrange
            var db = GetDbContext();
            var mockEnv = new Mock<IWebHostEnvironment>();
            mockEnv.Setup(e => e.WebRootPath).Returns(GetTempWebRoot());
            var service = new PhotoService(db, mockEnv.Object);
            var fileMock = new Mock<IFormFile>();
            fileMock.Setup(f => f.Length).Returns(1024);

            // Act
            var result = await service.UploadPhotoAsync(999, fileMock.Object);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task UploadPhotoAsync_ReturnsNull_WhenFileIsNull()
        {
            // Arrange
            var db = GetDbContext();
            SeedBusiness(db);
            var mockEnv = new Mock<IWebHostEnvironment>();
            mockEnv.Setup(e => e.WebRootPath).Returns(GetTempWebRoot());
            var service = new PhotoService(db, mockEnv.Object);

            // Act
            var result = await service.UploadPhotoAsync(1, null!);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task UploadPhotoAsync_ReturnsPhoto_WhenSuccessful()
        {
            // Arrange
            var db = GetDbContext();
            SeedBusiness(db);
            var webRoot = GetTempWebRoot();
            var mockEnv = new Mock<IWebHostEnvironment>();
            mockEnv.Setup(e => e.WebRootPath).Returns(webRoot);
            var service = new PhotoService(db, mockEnv.Object);

            var content = new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D };
            var fileMock = new Mock<IFormFile>();
            fileMock.Setup(f => f.Length).Returns(content.Length);
            fileMock.Setup(f => f.FileName).Returns("test.png");
            fileMock.Setup(f => f.CopyToAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await service.UploadPhotoAsync(1, fileMock.Object);

            // Assert
            result.Should().NotBeNull();
            result!.BusinessId.Should().Be(1);
            result.IsPrimary.Should().BeTrue();
            result.ImageUrl.Should().StartWith("/uploads/");
        }

        // ──── GetPhotosAsync ────

        [Fact]
        public async Task GetPhotosAsync_ReturnsPhotos_WhenExist()
        {
            // Arrange
            var db = GetDbContext();
            SeedBusiness(db);
            db.BusinessPhotos.AddRange(
                new BusinessPhoto { PhotoId = 1, BusinessId = 1, ImageUrl = "/a.jpg", IsPrimary = true, CreatedAt = DateTime.UtcNow },
                new BusinessPhoto { PhotoId = 2, BusinessId = 1, ImageUrl = "/b.jpg", IsPrimary = false, CreatedAt = DateTime.UtcNow }
            );
            await db.SaveChangesAsync();

            var mockEnv = new Mock<IWebHostEnvironment>();
            var service = new PhotoService(db, mockEnv.Object);

            // Act
            var result = await service.GetPhotosAsync(1);

            // Assert
            result.Should().HaveCount(2);
        }

        [Fact]
        public async Task GetPhotosAsync_ReturnsEmptyList_WhenNoPhotos()
        {
            // Arrange
            var db = GetDbContext();
            var mockEnv = new Mock<IWebHostEnvironment>();
            var service = new PhotoService(db, mockEnv.Object);

            // Act
            var result = await service.GetPhotosAsync(999);

            // Assert
            result.Should().BeEmpty();
        }

        // ──── DeletePhotoAsync ────

        [Fact]
        public async Task DeletePhotoAsync_ReturnsFalse_WhenNotFound()
        {
            // Arrange
            var db = GetDbContext();
            var mockEnv = new Mock<IWebHostEnvironment>();
            mockEnv.Setup(e => e.WebRootPath).Returns(GetTempWebRoot());
            var service = new PhotoService(db, mockEnv.Object);

            // Act
            var result = await service.DeletePhotoAsync(999);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task DeletePhotoAsync_ReturnsTrue_WhenFoundAndDeleted()
        {
            // Arrange
            var db = GetDbContext();
            SeedBusiness(db);
            var webRoot = GetTempWebRoot();

            // Create a physical file so the delete path works
            var uploadsDir = Path.Combine(webRoot, "uploads");
            Directory.CreateDirectory(uploadsDir);
            var fileName = "test_delete.jpg";
            var filePath = Path.Combine(uploadsDir, fileName);
            await File.WriteAllBytesAsync(filePath, new byte[] { 0x01 });

            db.BusinessPhotos.Add(new BusinessPhoto
            {
                PhotoId = 1,
                BusinessId = 1,
                ImageUrl = $"/uploads/{fileName}",
                IsPrimary = true,
                CreatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();

            var mockEnv = new Mock<IWebHostEnvironment>();
            mockEnv.Setup(e => e.WebRootPath).Returns(webRoot);
            var service = new PhotoService(db, mockEnv.Object);

            // Act
            var result = await service.DeletePhotoAsync(1);

            // Assert
            result.Should().BeTrue();
            (await db.BusinessPhotos.CountAsync()).Should().Be(0);
        }

        // ──── SavePhotoAsync ────

        [Fact]
        public async Task SavePhotoAsync_DoesNothing_WhenBase64Empty()
        {
            // Arrange
            var db = GetDbContext();
            var mockEnv = new Mock<IWebHostEnvironment>();
            var service = new PhotoService(db, mockEnv.Object);

            // Act
            await service.SavePhotoAsync("", 1);

            // Assert
            (await db.BusinessPhotos.CountAsync()).Should().Be(0);
        }

        [Fact]
        public async Task SavePhotoAsync_SavesPhoto_WhenValidBase64()
        {
            // Arrange
            var db = GetDbContext();
            SeedBusiness(db);
            var webRoot = GetTempWebRoot();
            var mockEnv = new Mock<IWebHostEnvironment>();
            mockEnv.Setup(e => e.WebRootPath).Returns(webRoot);
            var service = new PhotoService(db, mockEnv.Object);

            // A small valid base64 (just some bytes)
            var base64 = Convert.ToBase64String(new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 });

            // Act
            await service.SavePhotoAsync(base64, 1);

            // Assert
            (await db.BusinessPhotos.CountAsync()).Should().Be(1);
            var photo = await db.BusinessPhotos.FirstAsync();
            photo.IsPrimary.Should().BeTrue();
        }
    }
}
