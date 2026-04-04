using System.Net.Http.Headers;
using System.Text.Json;
using localink_be.Services.Interfaces;

namespace localink_be.Services.Implementations
{
    public class AIService : IAIService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        private readonly ILogger<AIService> _logger;

        public AIService(IConfiguration config, ILogger<AIService> logger)
        {
            _config = config;
            _logger = logger;
            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Bearer", _config["Groq:ApiKey"]);
        }

        public async Task<string[]> GetReviewSuggestionsAsync(string draftText, int rating, string businessName)
        {
            try
            {
                var prompt = BuildPrompt(draftText, rating, businessName);
                
                var requestBody = new
                {
                    model = "llama-3.1-8b-instant",
                    messages = new[]
                    {
                        new { role = "system", content = "You are a helpful assistant that improves business reviews. Provide 3 improved versions of the user's review draft. Each version should be concise (max 2 sentences), natural, and helpful. Return ONLY a JSON array with 3 strings, no markdown." },
                        new { role = "user", content = prompt }
                    },
                    temperature = 0.7,
                    max_tokens = 300
                };

                var response = await _httpClient.PostAsJsonAsync(
                    "https://api.groq.com/openai/v1/chat/completions", 
                    requestBody);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Groq API error: {StatusCode}", response.StatusCode);
                    return Array.Empty<string>();
                }

                var result = await response.Content.ReadFromJsonAsync<GroqResponse>();
                var content = result?.choices?.FirstOrDefault()?.message?.content;

                if (string.IsNullOrEmpty(content))
                    return Array.Empty<string>();

                // Parse the JSON array from the response
                try
                {
                    var suggestions = JsonSerializer.Deserialize<string[]>(content);
                    return suggestions?.Where(s => !string.IsNullOrWhiteSpace(s)).ToArray() 
                        ?? Array.Empty<string>();
                }
                catch (JsonException)
                {
                    // Fallback: split by newlines if not valid JSON
                    return content.Split('\n')
                        .Where(s => !string.IsNullOrWhiteSpace(s) && s.Length > 10)
                        .Take(3)
                        .ToArray();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting AI review suggestions");
                return Array.Empty<string>();
            }
        }

        private string BuildPrompt(string draftText, int rating, string businessName)
        {
            var sentiment = rating >= 4 ? "positive" : rating >= 3 ? "neutral" : "negative";
            
            return $@"User is writing a {sentiment} review (rated {rating}/5 stars) for business '{businessName}'.
Current draft: ""{draftText}""

Provide 3 improved versions of this review. Each should be:
- Natural and conversational
- Specific and helpful
- 1-2 sentences max
- Match the sentiment of the {rating}-star rating

Return as JSON array: [""suggestion1"", ""suggestion2"", ""suggestion3""]";
        }

        public async Task<string?> GetReviewSummaryAsync(string[] reviews, double averageRating, int totalReviews, string businessName)
        {
            try
            {
                if (reviews == null || reviews.Length == 0)
                    return null;

                var prompt = BuildSummaryPrompt(reviews, averageRating, totalReviews, businessName);
                
                var requestBody = new
                {
                    model = "llama-3.1-8b-instant",
                    messages = new[]
                    {
                        new { role = "system", content = "You are a helpful assistant that summarizes business reviews. Provide a concise, natural summary of what people are saying about a business. Keep it under 2 sentences. Be balanced and highlight common themes." },
                        new { role = "user", content = prompt }
                    },
                    temperature = 0.5,
                    max_tokens = 200
                };

                var response = await _httpClient.PostAsJsonAsync(
                    "https://api.groq.com/openai/v1/chat/completions", 
                    requestBody);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Groq API error: {StatusCode}", response.StatusCode);
                    return null;
                }

                var result = await response.Content.ReadFromJsonAsync<GroqResponse>();
                var content = result?.choices?.FirstOrDefault()?.message?.content;

                if (string.IsNullOrWhiteSpace(content))
                    return null;

                // Clean up the response - remove quotes if present
                content = content.Trim().Trim('"');
                
                return content;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting AI review summary");
                return null;
            }
        }

        private string BuildSummaryPrompt(string[] reviews, double averageRating, int totalReviews, string businessName)
        {
            var reviewTexts = string.Join("\n- ", reviews.Take(20)); // Limit to 20 reviews for token efficiency
            var sentiment = averageRating >= 4 ? "positive" : averageRating >= 3 ? "mixed" : "negative";
            
            return $@"Analyze these {totalReviews} reviews for '{businessName}' (average rating: {averageRating:F1}/5 stars, overall {sentiment} sentiment):

Review excerpts:
- {reviewTexts}

Provide a concise summary (max 2 sentences) of what people commonly say about this business. 
Focus on:
- Overall experience themes
- Service quality
- Atmosphere or ambiance
- Value for money

Return only the summary text, no quotes or markdown.";
        }
    }

    public class GroqResponse
    {
        public Choice[] choices { get; set; } = Array.Empty<Choice>();
    }

    public class Choice
    {
        public Message message { get; set; } = new Message();
    }

    public class Message
    {
        public string content { get; set; } = string.Empty;
    }
}
