using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class PostalController : ControllerBase
{
    private readonly IPostalService _postalService;

    public PostalController(IPostalService postalService)
    {
        _postalService = postalService;
    }

    [HttpGet("validate")]
    public async Task<IActionResult> Validate(string postcode, string country)
    {
        if (string.IsNullOrWhiteSpace(postcode) || string.IsNullOrWhiteSpace(country))
            return BadRequest("Invalid input");

        try
        {
            var result = await _postalService.GetPostalData(postcode, country);

            // Convert string → JSON object
            var json = JsonSerializer.Deserialize<object>(result);

            return Ok(json);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Postal validation failed", error = ex.Message });
        }
    }
}