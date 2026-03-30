using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/v1/admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _service;

    public AdminController(IAdminService service)
    {
        _service = service;
    }

    [HttpGet("businesses")]
    public async Task<IActionResult> GetAll()
    {
        var data = await _service.GetAllAsync();
        return Ok(data);
    }

    [HttpPut("business/{id}/status")]
    public async Task<IActionResult> UpdateStatus(long id, UpdateStatusDto dto)
    {
        await _service.UpdateStatusAsync(id, dto, 1); // temp admin id
        return Ok(new { message = "Status updated" });
    }

    [HttpGet("export")]
    public async Task<IActionResult> Export([FromQuery] string status)
    {
        var file = await _service.ExportAsync(status);
        return File(file, 
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"{status}-businesses.xlsx");
    }
}