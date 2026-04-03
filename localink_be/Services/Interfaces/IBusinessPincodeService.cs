public interface IBusinessPincodeService
{
    Task<string> GetPincodeData(string postcode);
}