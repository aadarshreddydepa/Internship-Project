using Xunit;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;

public class PhotoServiceTests
{
    [Fact]
    public async Task UploadPhotoAsync_ShouldUploadPhotoSuccessfully()
    {
        // Arrange
        var mockService = new Mock<IPhotoService>();
        var photoUrl = "https://example.com/photo.jpg";
        
        mockService.Setup(x => x.UploadPhotoAsync(It.IsAny<long>(), It.IsAny<byte[]>()))
            .ReturnsAsync(photoUrl);

        // Act
        var result = await mockService.Object.UploadPhotoAsync(1, new byte[] { });

        // Assert
        Assert.NotNull(result);
        Assert.Equal(photoUrl, result);
        mockService.Verify(x => x.UploadPhotoAsync(1, It.IsAny<byte[]>()), Times.Once);
    }

    [Fact]
    public async Task GetPhotosAsync_ShouldReturnAllBusinessPhotos()
    {
        // Arrange
        var mockService = new Mock<IPhotoService>();
        var photos = new List<object>
        {
            new { PhotoId = 1, BusinessId = 1, ImageUrl = "https://example.com/photo1.jpg", IsPrimary = true },
            new { PhotoId = 2, BusinessId = 1, ImageUrl = "https://example.com/photo2.jpg", IsPrimary = false }
        };

        mockService.Setup(x => x.GetPhotosAsync(It.IsAny<long>()))
            .ReturnsAsync(photos);

        // Act
        var result = await mockService.Object.GetPhotosAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GetPhotosAsync_WithNoPhotos_ShouldReturnEmptyList()
    {
        // Arrange
        var mockService = new Mock<IPhotoService>();
        mockService.Setup(x => x.GetPhotosAsync(It.IsAny<long>()))
            .ReturnsAsync(new List<object>());

        // Act
        var result = await mockService.Object.GetPhotosAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task DeletePhotoAsync_ShouldDeletePhotoSuccessfully()
    {
        // Arrange
        var mockService = new Mock<IPhotoService>();
        mockService.Setup(x => x.DeletePhotoAsync(It.IsAny<long>()))
            .ReturnsAsync(true);

        // Act
        var result = await mockService.Object.DeletePhotoAsync(1);

        // Assert
        Assert.True(result);
        mockService.Verify(x => x.DeletePhotoAsync(1), Times.Once);
    }

    [Fact]
    public async Task DeletePhotoAsync_WithNonExistentPhoto_ShouldReturnFalse()
    {
        // Arrange
        var mockService = new Mock<IPhotoService>();
        mockService.Setup(x => x.DeletePhotoAsync(It.IsAny<long>()))
            .ReturnsAsync(false);

        // Act
        var result = await mockService.Object.DeletePhotoAsync(999);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task SavePhotoAsync_ShouldSaveBase64PhotoSuccessfully()
    {
        // Arrange
        var mockService = new Mock<IPhotoService>();
        var base64Photo = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        var photoUrl = "https://example.com/saved-photo.jpg";

        mockService.Setup(x => x.SavePhotoAsync(It.IsAny<long>(), It.IsAny<string>()))
            .ReturnsAsync(photoUrl);

        // Act
        var result = await mockService.Object.SavePhotoAsync(1, base64Photo);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(photoUrl, result);
        mockService.Verify(x => x.SavePhotoAsync(1, base64Photo), Times.Once);
    }
}
