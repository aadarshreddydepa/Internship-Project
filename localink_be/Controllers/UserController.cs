
using Microsoft.AspNetCore.Mvc;


[ApiController]
[Route("api/v1/user")]
public class UserController : ControllerBase
{
    private readonly IUserService _service;
    private readonly IAuthService _authService;
    public UserController(IUserService service, IAuthService authService)
    {
        _service = service;
        _authService = authService;
    }
    [HttpPost]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, errors = ModelState });

        var result = await _authService.RegisterAsync(request);

        return Ok(new { success = true, message = result });
    }

    [HttpGet("email")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string value)
    {
        var result = await _authService.VerifyEmailAsync(value);
        return Ok(new { success = true, message = result });
    }

    [HttpPut("password")]
    public async Task<IActionResult> ResetPassword(ForgotPasswordRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, errors = ModelState });

        var result = await _authService.ResetPasswordAsync(request);

        return Ok(new { success = true, message = result });
    }

    [HttpGet("profile/{userId}")]
    public async Task<IActionResult> GetProfile(long userId)
    {
        var result = await _service.GetUserProfileAsync(userId);

        if (result == null)
            return NotFound("User not found");

        return Ok(result);
    }
}