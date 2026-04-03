using Microsoft.Extensions.Caching.Memory;

public class PostalService : IPostalService
{
    private readonly IMemoryCache _cache;
    private readonly HttpClient _http;
    private readonly string _apiKey;

    public PostalService(IMemoryCache cache, HttpClient http, IConfiguration config)
    {
        _cache = cache;
        _http = http;
        _apiKey = config["Geoapify:ApiKey"] 
                  ?? throw new Exception("Geoapify API Key missing");
    }

    public async Task<string> GetPostalData(string postcode, string country)
    {
        var cacheKey = $"{postcode}_{country}";

        // CACHE HIT
        if (_cache.TryGetValue(cacheKey, out string cached))
        {
            return cached;
        }

        try
        {
            // GEOAPIFY API CALL
            var url = $"https://api.geoapify.com/v1/geocode/search" +
                    $"?postcode={Uri.EscapeDataString(postcode)}" +
                    $"&country={Uri.EscapeDataString(country)}" +
                    $"&apiKey={_apiKey}";

            var response = await _http.GetAsync(url);

            if (!response.IsSuccessStatusCode)
                throw new Exception("Geoapify API failed");

            var result = await response.Content.ReadAsStringAsync();

            // CACHE RESULT (1 hour)
            _cache.Set(cacheKey, result, TimeSpan.FromHours(1));

            return result;
        }
        catch (Exception ex)
        {
            throw new Exception("Postal API failed", ex);
        }
    }
}