using Microsoft.EntityFrameworkCore;
using localink_be.Data;
using localink_be.Models.DTOs;
using localink_be.Models.Entities;
using localink_be.Services.Interfaces;

namespace localink_be.Services.Implementations
{
    public class FavoritesService : IFavoritesService
    {
        private readonly AppDbContext _context;

        public FavoritesService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<string> AddFavoriteAsync(FavoriteDto dto)
        {
            var exists = await _context.Favorites
                .AnyAsync(f => f.UserId == dto.UserId && f.BusinessId == dto.BusinessId);

            if (exists)
                return "Already added";

            var favorite = new Favorite
            {
                UserId = dto.UserId,
                BusinessId = dto.BusinessId,
                CreatedAt = DateTime.Now
            };

            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();

            return "Added to favorites";
        }

        public async Task<string> RemoveFavoriteAsync(long userId, long businessId)
        {
            var fav = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.BusinessId == businessId);

            if (fav == null)
                return "Not found";

            _context.Favorites.Remove(fav);
            await _context.SaveChangesAsync();

            return "Removed from favorites";
        }

        public async Task<List<long>> GetUserFavoritesAsync(long userId)
        {
            return await _context.Favorites
                .Where(f => f.UserId == userId)
                .Select(f => f.BusinessId)
                .ToListAsync();
        }
    }
}
