namespace localink_be.Services.Interfaces
{
    public interface IAIService
    {
        Task<string[]> GetReviewSuggestionsAsync(string draftText, int rating, string businessName);
    }
}
