using Microsoft.EntityFrameworkCore;

public class SubcategoryService : ISubcategoryService
{
    private readonly AppDbContext _context;

    public SubcategoryService(AppDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<List<SubcategoryDto>> GetByCategoryIdAsync(int categoryId)
    {
        if (categoryId <= 0)
            throw new ArgumentException("CategoryId must be greater than 0");

        try
        {
            var subcategories = await _context.Subcategories
                .Where(s => s.CategoryId == categoryId)
                .Select(s => new SubcategoryDto
                {
                    Id = s.SubcategoryId,
                    Name = s.SubcategoryName,
                    IconUrl = s.IconUrl,
                    Count = _context.Businesses.Count(b => b.SubcategoryId == s.SubcategoryId)
                })
                .ToListAsync();

            if (subcategories == null || subcategories.Count == 0)
                throw new Exception($"No subcategories found for categoryId {categoryId}");

            return subcategories;
        }
        catch (Exception ex)
        {
            throw new Exception($"Error fetching subcategories for categoryId {categoryId}", ex);
        }
    }
}