using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/v1")]
public class BusinessController : ControllerBase
{
    private readonly IBusinessService _service;

    public BusinessController(IBusinessService service)
    {
        _service = service;
    }

    // GET /api/v1/subcategories/{id}/businesses
    [HttpGet("subcategories/{subcategoryId}/businesses")]
    public async Task<IActionResult> GetBySubcategory(int subcategoryId)
    {
        try
        {
            var result = await _service.GetBySubcategoryAsync(subcategoryId);
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

    // GET /api/v1/businesses/{id}
    [HttpGet("businesses/{id}")]
    public async Task<IActionResult> GetById(long id)
    {
        try
        {
            var result = await _service.GetByIdAsync(id);
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