using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using FluentAssertions;

namespace Localink.Tests.Controllers
{
    public class PhotoControllerTests
    {
        private readonly Mock<IPhotoService> _mockService;
        private readonly PhotoController _controller;

        public PhotoControllerTests()
        {
            _mockService = new Mock<IPhotoService>();
            _controller = new PhotoController(_mockService.Object);
        }

        // ──── UploadPhoto ────

        [Fact]
        public async Task UploadPhoto_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            var fileMock = new Mock<IFormFile>();
            fileMock.Setup(f => f.Length).Returns(1024);
            fileMock.Setup(f => f.FileName).Returns("photo.jpg");

            var photo = new BusinessPhoto
            {
                PhotoId = 1,
                BusinessId = 1,
                ImageUrl = "/uploads/photo.jpg",
                IsPrimary = true
            };
            _mockService.Setup(s => s.UploadPhotoAsync(1, fileMock.Object)).ReturnsAsync(photo);

            // Act
            var result = await _controller.UploadPhoto(1, fileMock.Object) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
        }

        // ──── GetPhotos ────

        [Fact]
        public async Task GetPhotos_ReturnsOk_WithPhotoList()
        {
            // Arrange
            var photos = new List<BusinessPhoto>
            {
                new BusinessPhoto { PhotoId = 1, BusinessId = 1, ImageUrl = "/uploads/a.jpg", IsPrimary = true },
                new BusinessPhoto { PhotoId = 2, BusinessId = 1, ImageUrl = "/uploads/b.jpg", IsPrimary = false }
            };
            _mockService.Setup(s => s.GetPhotosAsync(1)).ReturnsAsync(photos);

            // Act
            var result = await _controller.GetPhotos(1) as OkObjectResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(200);
            result.Value.Should().BeEquivalentTo(photos);
        }

        // ──── DeletePhoto ────

        [Fact]
        public async Task DeletePhoto_ReturnsNoContent_WhenDeleted()
        {
            // Arrange
            _mockService.Setup(s => s.DeletePhotoAsync(1)).ReturnsAsync(true);

            // Act
            var result = await _controller.DeletePhoto(1) as NoContentResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(204);
        }

        [Fact]
        public async Task DeletePhoto_ReturnsNotFound_WhenPhotoMissing()
        {
            // Arrange
            _mockService.Setup(s => s.DeletePhotoAsync(999)).ReturnsAsync(false);

            // Act
            var result = await _controller.DeletePhoto(999) as NotFoundResult;

            // Assert
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(404);
        }
    }
}
