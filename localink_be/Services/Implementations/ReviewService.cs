using Microsoft.EntityFrameworkCore;

public class ReviewService : IReviewService
{
    private readonly AppDbContext _context;

    public ReviewService(AppDbContext context)
    {
        _context = context;
    }

    
    public async Task AddOrUpdateReview(long userId, ReviewRequestDto dto)
    {
        if (dto.Rating < 1 || dto.Rating > 5)
            throw new Exception("Rating must be between 1 and 5");

        var existingReview = await _context.BusinessReviews
            .FirstOrDefaultAsync(r =>
                r.UserId == userId &&
                r.BusinessId == dto.BusinessId);

        if (existingReview != null)
        {
            
            existingReview.Rating = dto.Rating;
            existingReview.Comment = dto.Comment;
            existingReview.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            
            var newReview = new BusinessReview
            {
                BusinessId = dto.BusinessId,
                UserId = userId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            await _context.BusinessReviews.AddAsync(newReview);
        }

        await _context.SaveChangesAsync();
    }

    public async Task<List<ReviewResponseDto>> GetReviewsByBusiness(long businessId)
    {
        return await _context.BusinessReviews
            .AsNoTracking() 
            .Where(r => r.BusinessId == businessId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewResponseDto
            {
                ReviewId = r.ReviewId,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                UserName = r.User.FullName
            })
            .ToListAsync();
    }


    public async Task<ReviewSummaryDto> GetSummary(long businessId)
    {
        var query = _context.BusinessReviews
            .Where(r => r.BusinessId == businessId);

        var avg = await query
            .AverageAsync(r => (double?)r.Rating) ?? 0;

        var count = await query.CountAsync();

        return new ReviewSummaryDto
        {
            AverageRating = Math.Round(avg, 1),
            TotalReviews = count
        };
    }
}