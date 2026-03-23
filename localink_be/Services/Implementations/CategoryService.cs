using Microsoft.EntityFrameworkCore;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<List<CategoryDto>> GetCategoriesAsync()
    {
        try
        {
            var categories = await _context.Categories
                .Select(c => new CategoryDto
                {
                    Id = c.CategoryId,
                    Name = c.CategoryName,
                    IconUrl = c.IconUrl
                })
                .ToListAsync();

            if (categories == null || categories.Count == 0)
                throw new KeyNotFoundException("No categories found");

            return categories;
        }
        catch (Exception ex)
        {
            throw new Exception("Error fetching categories", ex);
        }
    }
}