public interface IBusinessService
{

    Task<List<object>> GetAllBusinessesAsync();
    Task<object?> GetBusinessByIdAsync(long id);
    Task<Business?> UpdateBusinessAsync(long id, Business updated);
    Task<bool> DeleteBusinessAsync(long id);
    Task<Business> CreateBusinessAsync(Business dto);
    Task<long> RegisterBusinessAsync(RegisterBusinessDto dto);
    Task<object?> GetBusinessPreviewAsync(long businessId);

    Task<List<BusinessDto>> GetBusinessesByUserAsync(long userId);
    Task<List<BusinessDto>> GetBySubcategoryAsync(int subcategoryId);
    Task<BusinessDto?> GetByIdAsync(long id);
}