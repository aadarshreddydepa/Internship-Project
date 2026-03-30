using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    // LOGIN
    [HttpPost("sessions")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, errors = ModelState });

        var result = await _authService.LoginAsync(request);

        return Ok(new
        {
            success = true,
            data = result
        });
    }

    // REGISTER
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, errors = ModelState });

        var result = await _authService.RegisterAsync(request);

        return Ok(new
        {
            success = true,
            message = result
        });
    }

    // SEND OTP
    [HttpPost("forgot-password")]
public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request)
{
    if (!ModelState.IsValid)
        return BadRequest(new { success = false, errors = ModelState });

    var result = await _authService.SendResetOtpAsync(request.Email);

    return Ok(new
    {
        success = true,
        message = result
    });
}

    // RESET PASSWORD
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordWithOtpRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, errors = ModelState });

        var result = await _authService.VerifyOtpAndResetPasswordAsync(
            request.Email,
            request.Otp,
            request.NewPassword
        );

        return Ok(new
        {
            success = true,
            message = result
        });
    }
}