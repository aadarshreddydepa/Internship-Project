using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FeedbackController : ControllerBase
{
    private readonly AppDbContext _context;

    public FeedbackController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> SaveFeedback([FromBody] FeedbackDto dto)
    {
        var userIdClaim = User.Claims.FirstOrDefault(c =>
    c.Type == ClaimTypes.NameIdentifier || c.Type == "sub"
);

        int? userId = userIdClaim != null ? int.Parse(userIdClaim.Value) : null;

        var feedback = new Feedback
        {
            Message = dto.Feedback,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Feedbacks.Add(feedback);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Feedback saved successfully" });
    }
}