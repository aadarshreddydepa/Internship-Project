using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/v1/business")]
public class BusinessController : ControllerBase
{
    private readonly IBusinessService _service;

    public BusinessController(IBusinessService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllBusinesses()
    {
        var businesses = await _service.GetAllBusinessesAsync();
        return Ok(businesses);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBusinessById(long id)
    {
        var business = await _service.GetBusinessByIdAsync(id);
        if (business == null)
            return NotFound();

        return Ok(business);
    }

    [HttpPost("register")]
    public async Task<IActionResult> RegisterBusiness([FromBody] RegisterBusinessDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var businessId = await _service.RegisterBusinessAsync(dto);

            return Ok(new
            {
                success = true,
                message = "Business registered successfully",
                businessId
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                success = false,
                message = ex.Message
            });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBusiness(long id, [FromBody] Business updated)
    {
        var result = await _service.UpdateBusinessAsync(id, updated);
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBusiness(long id)
    {
        var deleted = await _service.DeleteBusinessAsync(id);
        if (!deleted)
            return NotFound();

        return NoContent();
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetBusinessesByUser(long userId)
    {
        var data = await _service.GetBusinessesByUserAsync(userId);
        return Ok(data);
    }

    [HttpGet("subcategories/{subcategoryId}/businesses")]
    public async Task<IActionResult> GetBySubcategory(int subcategoryId)
    {
        var result = await _service.GetBySubcategoryAsync(subcategoryId);
        return Ok(result);
    }

    [HttpGet("v1/businesses/{id}")]
    public async Task<IActionResult> GetById(long id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(result);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchBusinesses([FromQuery] string query)
    {
          var results = await _service.SearchBusinessesAsync(query);
            return Ok(results);
       
    }
}