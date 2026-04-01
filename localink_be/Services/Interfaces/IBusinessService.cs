public interface IBusinessService
{

    Task<List<object>> GetAllBusinessesAsync();
    Task<object?> GetBusinessByIdAsync(long id);
    Task<bool> DeleteBusinessAsync(long id);
    Task<Business> CreateBusinessAsync(Business dto);
    Task<long> RegisterBusinessAsync(RegisterBusinessDto dto, long userId);
    Task<object?> GetBusinessPreviewAsync(long businessId);
    Task<List<BusinessDto>> SearchBusinessesAsync(string query);
    Task<List<BusinessDto>> GetBusinessesByUserAsync(long userId);
    Task<List<BusinessDto>> GetBySubcategoryAsync(int subcategoryId);
    Task<BusinessDto?> GetByIdAsync(long id);
    Task<bool> UpdateBusinessFullAsync(long id, UpdateBusinessDto dto);
}