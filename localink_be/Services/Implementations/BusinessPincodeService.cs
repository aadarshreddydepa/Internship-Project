using localink_be.Services.Implementations;
using Microsoft.Extensions.Logging;

public class BusinessPincodeService : IBusinessPincodeService
{
    private readonly ICacheService _cache;
    private readonly HttpClient _http;
    private readonly ILogger<BusinessPincodeService> _logger;
    private readonly string _apiKey;

    // Cache expiration: 6 hours for pincodes
    private static readonly TimeSpan PincodeCacheExpiration = TimeSpan.FromHours(6);
    private const string PincodeCacheKeyPrefix = "pincode";

    public BusinessPincodeService(
        ICacheService cache, 
        HttpClient http, 
        IConfiguration config,
        ILogger<BusinessPincodeService> logger)
    {
        _cache = cache;
        _http = http;
        _logger = logger;
        _apiKey = config["Geoapify:ApiKey"]
                  ?? throw new Exception("Geoapify API Key missing");
    }

    /// <summary>
    /// Gets pincode data with caching.
    /// Cache key: pincode_{postcode}
    /// Cache duration: 6 hours
    /// Falls back to cached data if API fails.
    /// </summary>
    public async Task<string> GetPincodeData(string postcode)
    {
        if (string.IsNullOrWhiteSpace(postcode))
            throw new ArgumentException("Postcode is required", nameof(postcode));

        var cacheKey = $"{PincodeCacheKeyPrefix}_{postcode.ToLowerInvariant().Replace(" ", "")}";

        try
        {
            // Try to get from cache or create new entry
            return await _cache.GetOrCreateAsync(
                cacheKey,
                async () => await FetchFromApiAsync(postcode),
                PincodeCacheExpiration
            ) ?? "{}"; // Return empty JSON object if null
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch pincode data for {Postcode}. Attempting to return cached data.", postcode);

            // Fallback: Try to return cached data even if expired
            var cached = await _cache.GetAsync<string>(cacheKey);
            if (!string.IsNullOrEmpty(cached))
            {
                _logger.LogWarning("Returning stale cached data for pincode {Postcode}", postcode);
                return cached;
            }

            // No cached data available, re-throw exception
            throw new Exception($"Pincode API failed and no cached data available for {postcode}", ex);
        }
    }

    /// <summary>
    /// Fetches pincode data from external Geoapify API.
    /// </summary>
    private async Task<string> FetchFromApiAsync(string postcode)
    {
        var url = $"https://api.geoapify.com/v1/geocode/search" +
                  $"?postcode={Uri.EscapeDataString(postcode)}" +
                  $"&apiKey={_apiKey}";

        _logger.LogInformation("Fetching pincode {Postcode} from Geoapify API", postcode);

        var response = await _http.GetAsync(url);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            _logger.LogError("Geoapify API failed for pincode {Postcode}. Status: {StatusCode}, Response: {Response}",
                postcode, response.StatusCode, errorContent);
            throw new Exception($"Geoapify API failed with status {response.StatusCode}");
        }

        var result = await response.Content.ReadAsStringAsync();
        _logger.LogInformation("Successfully fetched pincode {Postcode} from Geoapify API", postcode);

        return result;
    }
}