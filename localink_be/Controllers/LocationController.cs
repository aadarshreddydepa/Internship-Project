using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

[ApiController]
[Route("api/location")]
public class LocationController : ControllerBase
{
    private readonly ILocationService _service;

    public LocationController(ILocationService service)
    {
        _service = service;
    }

    [HttpGet("countries")]
    public async Task<IActionResult> GetCountries()
    {
        var data = await _service.GetCountries();

        var result = JsonSerializer.Deserialize<object>(data);

        return Ok(result);
    }

    [HttpGet("states/{countryCode}")]
    public async Task<IActionResult> GetStates(string countryCode)
    {
        var data = await _service.GetStates(countryCode);

        var result = JsonSerializer.Deserialize<object>(data);

        return Ok(result);
    }

    [HttpGet("cities/{countryCode}/{stateCode}")]
    public async Task<IActionResult> GetCities(string countryCode, string stateCode)
    {
        var data = await _service.GetCities(countryCode, stateCode);

        var result = JsonSerializer.Deserialize<object>(data);

        return Ok(result);
    }
}