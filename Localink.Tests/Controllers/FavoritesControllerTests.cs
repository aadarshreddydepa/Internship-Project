using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Moq;
using localink_be.Controllers;
using localink_be.Services.Interfaces;
using localink_be.Models.DTOs;
using Xunit;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNetCore.Http.Features;

namespace Localink.Tests.Controllers
{
    /// <summary>
    /// Unit tests for FavoritesController
    /// Tests validation, add/remove favorites, and error handling
    /// </summary>
    public class FavoritesControllerTests
    {
        private readonly Mock<IFavoritesService> _mockService;
        private readonly FavoritesController _controller;

        public FavoritesControllerTests()
        {
            _mockService = new Mock<IFavoritesService>();
            _controller = new FavoritesController(_mockService.Object);
        }

        #region AddFavorite Tests

        [Fact]
        public async Task AddFavorite_ValidDto_ReturnsSuccess()
        {
            // Arrange
            var dto = new FavoriteDto { UserId = 1, BusinessId = 2 };
            _mockService.Setup(s => s.AddFavoriteAsync(dto))
                .ReturnsAsync("Added to favorites");

            // Act
            var result = await _controller.AddFavorite(dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
            _mockService.Verify(s => s.AddFavoriteAsync(dto), Times.Once);
        }

        [Fact]
        public async Task AddFavorite_AlreadyAdded_ReturnsBadRequest()
        {
            // Arrange
            var dto = new FavoriteDto { UserId = 1, BusinessId = 2 };
            _mockService.Setup(s => s.AddFavoriteAsync(dto))
                .ReturnsAsync("Already added");

            // Act
            var result = await _controller.AddFavorite(dto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequestResult.Value);
            _mockService.Verify(s => s.AddFavoriteAsync(dto), Times.Once);
        }

        [Fact]
        public async Task AddFavorite_InvalidUserId_ReturnsBadRequest()
        {
            // Arrange
            var dto = new FavoriteDto { UserId = 0, BusinessId = 2 };
            _controller.ModelState.AddModelError("UserId", "Invalid User ID");

            // Act
            var result = await _controller.AddFavorite(dto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequestResult.Value);
        }

        [Fact]
        public async Task AddFavorite_InvalidBusinessId_ReturnsBadRequest()
        {
            // Arrange
            var dto = new FavoriteDto { UserId = 1, BusinessId = 0 };
            _controller.ModelState.AddModelError("BusinessId", "Invalid Business ID");

            // Act
            var result = await _controller.AddFavorite(dto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequestResult.Value);
        }

        #endregion

        #region RemoveFavorite Tests

        [Fact]
        public async Task RemoveFavorite_ValidIds_ReturnsSuccess()
        {
            // Arrange
            long userId = 1;
            long businessId = 2;
            _mockService.Setup(s => s.RemoveFavoriteAsync(userId, businessId))
                .ReturnsAsync("Removed from favorites");

            // Act
            var result = await _controller.RemoveFavorite(userId, businessId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
            _mockService.Verify(s => s.RemoveFavoriteAsync(userId, businessId), Times.Once);
        }

        [Fact]
        public async Task RemoveFavorite_NotFound_ReturnsNotFound()
        {
            // Arrange
            long userId = 1;
            long businessId = 2;
            _mockService.Setup(s => s.RemoveFavoriteAsync(userId, businessId))
                .ReturnsAsync("Not found");

            // Act
            var result = await _controller.RemoveFavorite(userId, businessId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.NotNull(notFoundResult.Value);
            _mockService.Verify(s => s.RemoveFavoriteAsync(userId, businessId), Times.Once);
        }

        [Fact]
        public async Task RemoveFavorite_InvalidUserId_ReturnsBadRequest()
        {
            // Arrange
            long userId = 0;
            long businessId = 2;

            // Act
            var result = await _controller.RemoveFavorite(userId, businessId);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequestResult.Value);
        }

        [Fact]
        public async Task RemoveFavorite_InvalidBusinessId_ReturnsBadRequest()
        {
            // Arrange
            long userId = 1;
            long businessId = 0;

            // Act
            var result = await _controller.RemoveFavorite(userId, businessId);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequestResult.Value);
        }

        #endregion

        #region GetFavorites Tests

        [Fact]
        public async Task GetFavorites_ValidUserId_ReturnsFavorites()
        {
            // Arrange
            long userId = 1;
            var favorites = new List<long> { 2, 3, 4 };
            _mockService.Setup(s => s.GetUserFavoritesAsync(userId))
                .ReturnsAsync(favorites);

            // Act
            var result = await _controller.GetFavorites(userId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedFavorites = Assert.IsType<List<long>>(okResult.Value);
            Assert.Equal(3, returnedFavorites.Count);
            _mockService.Verify(s => s.GetUserFavoritesAsync(userId), Times.Once);
        }

        [Fact]
        public async Task GetFavorites_EmptyList_ReturnsEmptyList()
        {
            // Arrange
            long userId = 1;
            var favorites = new List<long>();
            _mockService.Setup(s => s.GetUserFavoritesAsync(userId))
                .ReturnsAsync(favorites);

            // Act
            var result = await _controller.GetFavorites(userId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedFavorites = Assert.IsType<List<long>>(okResult.Value);
            Assert.Empty(returnedFavorites);
            _mockService.Verify(s => s.GetUserFavoritesAsync(userId), Times.Once);
        }

        [Fact]
        public async Task GetFavorites_InvalidUserId_ReturnsBadRequest()
        {
            // Arrange
            long userId = 0;

            // Act
            var result = await _controller.GetFavorites(userId);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequestResult.Value);
        }

        #endregion

        #region Validation Tests

        [Theory]
        [InlineData(-1, 1)]
        [InlineData(1, -1)]
        [InlineData(0, 0)]
        public async Task AddFavorite_InvalidIds_ReturnsBadRequest(long userId, long businessId)
        {
            // Arrange
            var dto = new FavoriteDto { UserId = userId, BusinessId = businessId };
            if (userId <= 0)
                _controller.ModelState.AddModelError("UserId", "Invalid User ID");
            if (businessId <= 0)
                _controller.ModelState.AddModelError("BusinessId", "Invalid Business ID");

            // Act
            var result = await _controller.AddFavorite(dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        #endregion

        #region Error Handling Tests

        [Fact]
        public async Task AddFavorite_ServiceThrowsException_ReturnsBadRequest()
        {
            // Arrange
            var dto = new FavoriteDto { UserId = 1, BusinessId = 2 };
            _mockService.Setup(s => s.AddFavoriteAsync(dto))
                .ThrowsAsync(new System.Exception("Database error"));

            // Act
            var result = await _controller.AddFavorite(dto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequestResult.Value);
        }

        [Fact]
        public async Task GetFavorites_ServiceThrowsException_ReturnsBadRequest()
        {
            // Arrange
            long userId = 1;
            _mockService.Setup(s => s.GetUserFavoritesAsync(userId))
                .ThrowsAsync(new System.Exception("Database error"));

            // Act
            var result = await _controller.GetFavorites(userId);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequestResult.Value);
        }

        #endregion
    }
}
