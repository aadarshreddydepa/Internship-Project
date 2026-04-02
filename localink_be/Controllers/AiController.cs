using System.Threading.Tasks;
using localink_be.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace localink_be.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AiController : ControllerBase
    {
        private readonly IAiService _aiService;

        public AiController(IAiService aiService)
        {
            _aiService = aiService;
        }

        [HttpGet("suggestions")]
        public async Task<IActionResult> GetSuggestions([FromQuery] string keywords)
        {
            if (string.IsNullOrWhiteSpace(keywords))
                return BadRequest("Keywords cannot be empty.");

            var suggestions = await _aiService.GetReviewSuggestionsAsync(keywords);
            return Ok(suggestions);
        }
    }
}