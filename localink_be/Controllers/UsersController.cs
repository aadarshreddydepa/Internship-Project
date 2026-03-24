using Microsoft.AspNetCore.Mvc;
   // VERY IMPORTANT
    [ApiController]
    [Route("api/v1/users")]
    public class UsersController : ControllerBase
    {
        private readonly IAuthService _authService;

        public UsersController(IAuthService authService)
        {
            _authService = authService;
        }

        // POST: /api/v1/users
        [HttpPost]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(request);
            return Ok(new { message = result });
        }

        // GET: /api/v1/users/email?value=test@gmail.com
        [HttpGet("email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string value)
        {
            var result = await _authService.VerifyEmailAsync(value);
            return Ok(new { message = result });
        }

        // PUT: /api/v1/users/password
        [HttpPut("password")]
        public async Task<IActionResult> ResetPassword(ForgotPasswordRequest request)
        {
            var result = await _authService.ResetPasswordAsync(request);
            return Ok(new { message = result });
        }
    }