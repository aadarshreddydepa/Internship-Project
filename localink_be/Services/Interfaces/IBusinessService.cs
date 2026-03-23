public interface IBusinessService
{
    Task<List<BusinessDto>> GetBySubcategoryAsync(int subcategoryId);
    Task<BusinessDto?> GetByIdAsync(long id);
}