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

    // GET /api/v1/categories/{categoryId}/subcategories
    [HttpGet]
    public async Task<IActionResult> GetByCategory(int categoryId)
    {
        try
        {
            var result = await _service.GetByCategoryIdAsync(categoryId);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }
}