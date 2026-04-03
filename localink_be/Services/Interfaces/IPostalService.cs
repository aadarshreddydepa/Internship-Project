public interface IPostalService
{
    Task<string> GetPostalData(string postcode, string country);
}