public interface ISubcategoryService
{
    Task<List<SubcategoryDto>> GetByCategoryIdAsync(int categoryId);
}