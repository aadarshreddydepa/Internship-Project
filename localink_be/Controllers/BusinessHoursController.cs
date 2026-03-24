using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/v1/business/{businessId}/hours")]
public class BusinessHoursController : ControllerBase
{
    private readonly IHoursService _hoursService;

    public BusinessHoursController(IHoursService hoursService)
    {
        _hoursService = hoursService;
    }

    // POST: api/business/{businessId}/hours
    [HttpPost]
    public async Task<IActionResult> CreateOrReplaceBusinessHours(long businessId, [FromBody] BusinessHoursDto dto)
    {
        var result = await _hoursService.CreateOrReplaceBusinessHoursAsync(businessId, dto);
        return Ok(result);
    }

    // GET: api/business/{businessId}/hours
    [HttpGet]
    public async Task<IActionResult> GetBusinessHours(long businessId)
    {
        var hours = await _hoursService.GetBusinessHoursAsync(businessId);
        if (hours == null)
            return NotFound();

        return Ok(hours);
    }
}
