using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/v1/categories/{categoryId}/subcategories")]
public class SubcategoryController : ControllerBase
{
    private readonly ISubcategoryService _service;

    public SubcategoryController(ISubcategoryService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetByCategory(int categoryId)
    {
        var result = await _service.GetByCategoryIdAsync(categoryId);
        return Ok(result);
    }
}