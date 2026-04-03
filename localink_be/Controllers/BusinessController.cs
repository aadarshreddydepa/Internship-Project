using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

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
        return Ok(await _service.GetAllBusinessesAsync());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBusinessById(long id)
    {
        var business = await _service.GetBusinessByIdAsync(id);
        if (business == null) return NotFound();
        return Ok(business);
    }

    [Authorize(Roles = "client")]
    [HttpPost("register")]
    public async Task<IActionResult> RegisterBusiness([FromBody] RegisterBusinessDto dto)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        var businessId = await _service.RegisterBusinessAsync(dto, long.Parse(userId));

        return Ok(new
        {
            success = true,
            businessId
        });
    }

    [Authorize(Roles = "client")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBusiness(long id, [FromBody] UpdateBusinessDto dto)
    {
        var result = await _service.UpdateBusinessFullAsync(id, dto);
        return result == null ? NotFound() : Ok(result);
    }

    [Authorize(Roles = "client")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBusiness(long id)
    {
        var deleted = await _service.DeleteBusinessAsync(id);
        return deleted ? NoContent() : NotFound();
    }

    [Authorize]
    [HttpGet("my-businesses")]
    public async Task<IActionResult> GetMyBusinesses()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        var data = await _service.GetBusinessesByUserAsync(long.Parse(userId));
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
        return Ok(await _service.SearchBusinessesAsync(query));
    }
    [HttpGet("validate-pincode/{pincode}")]
public async Task<IActionResult> ValidatePincode(string pincode)
{
    using var client = new HttpClient();

    var url = $"https://api.geoapify.com/v1/geocode/search?text={pincode}&format=json&apiKey=b5574329b50a49f49fe3b9ebbaf7a837";

    var response = await client.GetAsync(url);

    if (!response.IsSuccessStatusCode)
        return BadRequest("Geoapify failed");

    var content = await response.Content.ReadAsStringAsync();

    return Content(content, "application/json");
}
}