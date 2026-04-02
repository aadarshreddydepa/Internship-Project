using Microsoft.Extensions.Caching.Memory;
using System.Net.Http;

public class LocationService : ILocationService
{
    private readonly HttpClient _http;
    private readonly IMemoryCache _cache;
    private readonly string apiKey;

    // CACHE
    private static Dictionary<string, string> cache = new();

    public LocationService(HttpClient http, IConfiguration config, IMemoryCache cache)
    {
        _http = http;
        _cache = cache;

        apiKey = config["CSC:ApiKey"] ?? throw new Exception("API Key missing");
        _http.DefaultRequestHeaders.Add("X-CSCAPI-KEY", apiKey);
    }

    private async Task<string> GetCached(string url)
    {
        if (_cache.TryGetValue(url, out string? cached) && cached != null)
            return cached;

        try{
            var res = await _http.GetStringAsync(url);
            _cache.Set(url, res, TimeSpan.FromHours(24)); // cache 24 hrs
            return res;
        }
        catch (Exception ex)
        {
            throw new Exception("Location API failed", ex);
        }
    }

    public async Task<string> GetCountries()
    {
        return await GetCached("https://api.countrystatecity.in/v1/countries");
    }

    public async Task<string> GetStates(string countryCode)
    {
        return await GetCached($"https://api.countrystatecity.in/v1/countries/{countryCode}/states");
    }

    public async Task<string> GetCities(string countryCode, string stateCode)
    {
        return await GetCached($"https://api.countrystatecity.in/v1/countries/{countryCode}/states/{stateCode}/cities");
    }
}