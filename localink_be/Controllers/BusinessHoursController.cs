using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using localink_be.Models.DTOs;
using localink_be.Services.Interfaces;
using System.Threading.Tasks;

namespace localink_be.Controllers
{
    [ApiController]
    [Route("api/v1/business/{businessId}/hours")]
    public class BusinessHoursController : ControllerBase
    {
        private readonly IHoursService _hoursService;
        public BusinessHoursController(IHoursService hoursService)
        {
            _hoursService = hoursService;
        }
    
        [Authorize(Roles = "client")]
        [HttpPost]
        public async Task<IActionResult> CreateOrReplaceBusinessHours(long businessId, [FromBody] System.Collections.Generic.List<DayHoursDto> dto)
        {
            var hoursDto = new BusinessHoursDto { Days = dto };
            var result = await _hoursService.CreateOrReplaceBusinessHoursAsync(businessId, hoursDto);
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetBusinessHours(long businessId)
        {
            var hours = await _hoursService.GetBusinessHoursAsync(businessId);
            if (hours == null)
                return NotFound();

            return Ok(hours);
        }
    }
}
