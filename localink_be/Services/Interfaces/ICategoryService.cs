public interface ICategoryService
{
    Task<List<CategoryDto>> GetCategoriesAsync();
}