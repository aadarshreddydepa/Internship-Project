using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using localink_be.Services.Interfaces;
using Microsoft.Extensions.Configuration;

namespace localink_be.Services.Implementations
{
    public class AiService : IAiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public AiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Mistral:ApiKey"] ?? string.Empty;
        }

        public async Task<List<string>> GetReviewSuggestionsAsync(string keywords)
        {
            var suggestions = new List<string>();
            var inputText = keywords.Trim();
            var inputSentiment = DetectSentiment(inputText);
            var anchorWords = GetAnchorWords(inputText);

            if (string.IsNullOrWhiteSpace(keywords))
                return suggestions;

            if (string.IsNullOrWhiteSpace(_apiKey))
            {
                return BuildLocalSuggestions(inputText);
            }

            try
            {
                var requestBody = new
                {
                    model = "mistral-tiny", // or mistral-7b-instruct based on actual endpoint, using default tiny or small
                    messages = new[]
                    {
                        new { role = "system", content = "You rewrite user-written reviews. Generate exactly 3 suggestions that stay very close to the user's text, preserving meaning, tone, and key details. Maintain the SAME sentiment polarity as the input (positive / negative / mixed). Never flip sentiment. Improve grammar and clarity only; do not invent new facts. Keep each suggestion to 1 sentence. Return only the 3 suggestions separated by '|', with no numbering or extra text." },
                        new { role = "user", content = $"User review draft: {inputText}" }
                    },
                    temperature = 0.35,
                    max_tokens = 150
                };

                var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

                var response = await _httpClient.PostAsync("https://api.mistral.ai/v1/chat/completions", content);

                if (response.IsSuccessStatusCode)
                {
                    var responseString = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(responseString);
                    var root = doc.RootElement;
                    var choices = root.GetProperty("choices");
                    if (choices.GetArrayLength() > 0)
                    {
                        var message = choices[0].GetProperty("message").GetProperty("content").GetString();
                        if (!string.IsNullOrWhiteSpace(message))
                        {
                            var parts = message.Split('|', StringSplitOptions.RemoveEmptyEntries);
                            foreach (var part in parts)
                            {
                                suggestions.Add(part.Trim());
                            }
                        }
                    }
                }
            }
            catch (Exception)
            {
                // Ignore external API errors and use local fallback
            }

            suggestions = suggestions
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Select(s => s.Trim())
                .Where(s => IsRelevantAndSentimentMatched(s, anchorWords, inputSentiment))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Take(3)
                .ToList();

            if (suggestions.Count < 3)
                return BuildLocalSuggestions(inputText);

            return suggestions;
        }

        private static List<string> BuildLocalSuggestions(string inputText)
        {
            var cleaned = inputText.Trim();
            if (string.IsNullOrWhiteSpace(cleaned))
                return new List<string>();

            if (!cleaned.EndsWith(".") && !cleaned.EndsWith("!") && !cleaned.EndsWith("?"))
                cleaned += ".";

            var normalized = cleaned.TrimEnd('.', '!', '?');
            var variant2 = normalized.Replace(" but ", " while ", StringComparison.OrdinalIgnoreCase);
            var variant3 = normalized.Replace(" and ", ", and ", StringComparison.OrdinalIgnoreCase);

            return new List<string>
            {
                cleaned,
                $"{variant2}.",
                $"{variant3}."
            };
        }

        private static List<string> GetAnchorWords(string input)
        {
            var stopWords = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "the", "a", "an", "is", "are", "was", "were", "to", "of", "for", "and", "or", "but", "this", "that",
                "with", "it", "in", "on", "at", "my", "our", "their", "very", "really", "quite", "just", "here"
            };

            return input
                .Split(new[] { ' ', ',', '.', '!', '?', ';', ':', '\t', '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(w => w.Trim().ToLowerInvariant())
                .Where(w => w.Length >= 4 && !stopWords.Contains(w))
                .Distinct()
                .ToList();
        }

        private static string DetectSentiment(string text)
        {
            var lower = text.ToLowerInvariant();
            var positiveWords = new[] { "good", "great", "excellent", "amazing", "friendly", "quick", "clean", "tasty", "love", "nice", "best" };
            var negativeWords = new[] { "bad", "poor", "slow", "rude", "dirty", "worst", "hate", "awful", "not good", "not great", "disappoint" };

            var pos = positiveWords.Count(w => lower.Contains(w));
            var neg = negativeWords.Count(w => lower.Contains(w));

            if (pos > 0 && neg > 0) return "mixed";
            if (pos > 0) return "positive";
            if (neg > 0) return "negative";
            return "neutral";
        }

        private static bool IsRelevantAndSentimentMatched(string suggestion, List<string> anchorWords, string inputSentiment)
        {
            var lower = suggestion.ToLowerInvariant();

            var hasAnchor = anchorWords.Count == 0 || anchorWords.Any(w => lower.Contains(w));
            if (!hasAnchor)
                return false;

            var suggestionSentiment = DetectSentiment(suggestion);
            if (inputSentiment == "neutral")
                return true;

            if (inputSentiment == "mixed")
                return suggestionSentiment == "mixed" || suggestionSentiment == "neutral";

            return suggestionSentiment == inputSentiment || suggestionSentiment == "neutral";
        }
    }
}