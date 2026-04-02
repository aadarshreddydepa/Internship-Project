using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/v1/categories")]
public class CategoryController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICategoryService _service;

    public CategoryController(AppDbContext db, ICategoryService service)
    {
        _db = db;
        _service = service;
    }

    [HttpGet("{categoryId}/subcategories-db")]
    
    public async Task<IActionResult> GetSubcategories(int categoryId)
    {
        var subcategories = await _db.Subcategories
            .Where(s => s.CategoryId == categoryId)
            .ToListAsync();

        if (!subcategories.Any())
            return NotFound();

        return Ok(subcategories);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetCategoriesAsync();
        return Ok(result);
    }
}