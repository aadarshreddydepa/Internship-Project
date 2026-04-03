using System.Net.Http.Headers;

public class BusinessLocationService : IBusinessLocationService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;

    public BusinessLocationService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _config = config;
    }

    private void SetHeaders()
    {
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add(
            "X-CSCAPI-KEY",
            _config["CountryApi:ApiKey"]
        );
    }

    public async Task<string> GetCountries()
    {
        SetHeaders();
        var url = $"{_config["CountryApi:BaseUrl"]}/countries";
        return await _httpClient.GetStringAsync(url);
    }

    public async Task<string> GetStates(string countryCode)
    {
        SetHeaders();
        var url = $"{_config["CountryApi:BaseUrl"]}/countries/{countryCode}/states";
        return await _httpClient.GetStringAsync(url);
    }

    public async Task<string> GetCities(string countryCode, string stateCode)
    {
        SetHeaders();
        var url = $"{_config["CountryApi:BaseUrl"]}/countries/{countryCode}/states/{stateCode}/cities";
        return await _httpClient.GetStringAsync(url);
    }
}
