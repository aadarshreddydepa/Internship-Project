using System;
using System.Collections.Generic;
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

            if (string.IsNullOrWhiteSpace(keywords))
                return suggestions;

            if (string.IsNullOrWhiteSpace(_apiKey))
            {
                // Fallback for development if no Mistral API key is provided
                suggestions.Add($"[AI Hint] Based on your keywords '{keywords}', you might say the service was wonderful.");
                suggestions.Add($"[AI Hint] Based on your keywords '{keywords}', you could mention the quick turnaround.");
                suggestions.Add($"[AI Hint] Based on your keywords '{keywords}', you could highlight the friendly staff.");
                return suggestions;
            }

            try
            {
                var requestBody = new
                {
                    model = "mistral-tiny", // or mistral-7b-instruct based on actual endpoint, using default tiny or small
                    messages = new[]
                    {
                        new { role = "system", content = "You are a helpful assistant that generates exactly 3 short, positive review suggestions based on the user's keywords. Provide the suggestions separated by the pipe character '|' without any other text or formatting." },
                        new { role = "user", content = $"Keywords: {keywords}" }
                    },
                    temperature = 0.7,
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
                // Ignore errors and return empty suggestions
            }

            return suggestions;
        }
    }
}