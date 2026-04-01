public interface IReviewService
{
    Task AddOrUpdateReview(long userId, ReviewRequestDto dto);
    Task<List<ReviewResponseDto>> GetReviewsByBusiness(long businessId);
    Task<ReviewSummaryDto> GetSummary(long businessId);
}