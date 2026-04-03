public interface ILocationService
{
    Task<string> GetCountries();
    Task<string> GetStates(string countryCode);
    Task<string> GetCities(string countryCode, string stateCode);
}