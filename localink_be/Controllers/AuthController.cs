using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

[AllowAnonymous]
[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;

    public AuthController(
        IAuthService authService,
        IHttpClientFactory httpClientFactory,
        IConfiguration config)
    {
        _authService = authService;
        _httpClientFactory = httpClientFactory;
        _config = config;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }
    private IActionResult ValidateRequest()
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .Select(x => new
                {
                    field = x.Key,
                    errors = x.Value!.Errors.Select(e => e.ErrorMessage)
                });

            return BadRequest(new
            {
                success = false,
                message = "Validation failed",
                errors
            });
        }

        return null!;
    }

    // LOGIN
    [HttpPost("sessions")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.LoginAsync(request);
        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // MODEL VALIDATION
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // CAPTCHA TOKEN VALIDATION
        if (string.IsNullOrWhiteSpace(request.CaptchaToken))
            return BadRequest(new { message = "Captcha token is required" });

        // GET SECRET KEY
        var secret = _config["Recaptcha:SecretKey"];
        if (string.IsNullOrWhiteSpace(secret))
            throw new Exception("Recaptcha secret key not configured");

        // VERIFY CAPTCHA
        var client = _httpClientFactory.CreateClient();
        var response = await client.PostAsync(
            $"https://www.google.com/recaptcha/api/siteverify?secret={secret}&response={request.CaptchaToken}",
            null
        );
        if (!response.IsSuccessStatusCode)
            throw new Exception("Captcha verification request failed");

        var captchaResult = await response.Content.ReadFromJsonAsync<RecaptchaResponse>();
        if (captchaResult == null)
            throw new Exception("Captcha response deserialization failed");
        if (!captchaResult.Success)
            return BadRequest(new
            {
                message = "Invalid CAPTCHA. Please try again.",
                errors = captchaResult.ErrorCodes
            });

        // BUSINESS LOGIC
        var result = await _authService.RegisterAsync(request);
        return Ok(new { message = result });
    }

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

    var result = await _authService.SendResetOtpAsync(request.Email,request.CaptchaToken);

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