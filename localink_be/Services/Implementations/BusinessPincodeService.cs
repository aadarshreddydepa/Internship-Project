using Microsoft.Extensions.Caching.Memory;

public class BusinessPincodeService : IBusinessPincodeService
{
    private readonly IMemoryCache _cache;
    private readonly HttpClient _http;
    private readonly string _apiKey;

    public BusinessPincodeService(IMemoryCache cache, HttpClient http, IConfiguration config)
    {
        _cache = cache;
        _http = http;
        _apiKey = config["Geoapify:ApiKey"]
                  ?? throw new Exception("Geoapify API Key missing");
    }

    public async Task<string> GetPincodeData(string postcode)
    {
        var cacheKey = $"{postcode}";

        // ✅ CACHE HIT
        if (_cache.TryGetValue(cacheKey, out string cached))
        {
            return cached;
        }

        try
        {
            var url = $"https://api.geoapify.com/v1/geocode/search" +
                      $"?postcode={Uri.EscapeDataString(postcode)}" +
                      $"&apiKey={_apiKey}";

            var response = await _http.GetAsync(url);

            if (!response.IsSuccessStatusCode)
                throw new Exception("Geoapify API failed");

            var result = await response.Content.ReadAsStringAsync();

            // ✅ CACHE FOR 1 HOUR
            _cache.Set(cacheKey, result, TimeSpan.FromHours(1));

            return result;
        }
        catch (Exception ex)
        {
            throw new Exception("Business Pincode API failed", ex);
        }
    }
}