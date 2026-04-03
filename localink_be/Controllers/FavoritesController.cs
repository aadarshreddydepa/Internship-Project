using Microsoft.AspNetCore.Mvc;
using localink_be.Models.DTOs;
using localink_be.Services.Interfaces;

namespace localink_be.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FavoritesController : ControllerBase
    {
        private readonly IFavoritesService _favoritesService;

        public FavoritesController(IFavoritesService favoritesService)
        {
            _favoritesService = favoritesService;
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddFavorite(FavoriteDto dto)
        {
            var result = await _favoritesService.AddFavoriteAsync(dto);

            if (result == "Already added")
                return BadRequest(result);

            return Ok(result);
        }

        [HttpDelete("remove")]
        public async Task<IActionResult> RemoveFavorite(long userId, long businessId)
        {
            var result = await _favoritesService.RemoveFavoriteAsync(userId, businessId);

            if (result == "Not found")
                return NotFound(result);

            return Ok(result);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetFavorites(long userId)
        {
            var favorites = await _favoritesService.GetUserFavoritesAsync(userId);
            return Ok(favorites);
        }
    }
}
