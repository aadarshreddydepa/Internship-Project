namespace localink_be.Services.Interfaces
{
    public interface IAIService
    {
        Task<string[]> GetReviewSuggestionsAsync(string draftText, int rating, string businessName);
        Task<string?> GetReviewSummaryAsync(string[] reviews, double averageRating, int totalReviews, string businessName);
    }
}
