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

    [HttpGet("subcategories/{subcategoryId}/businesses")]
    public async Task<IActionResult> GetBySubcategory(int subcategoryId)
    {
        var result = await _service.GetBySubcategoryAsync(subcategoryId);
        return Ok(result);
    }

    [HttpGet("businesses/{id}")]
    public async Task<IActionResult> GetById(long id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(result);
    }
}