using Microsoft.AspNetCore.Mvc;
using localink_be.Services.Interfaces;
using localink_be.Models.DTOs;
using localink_be.Models.Entities;
using System.Threading.Tasks;

namespace localink_be.Controllers
{
   // VERY IMPORTANT
    [ApiController]
    [Route("api/v1/users")]
    public class UsersController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ICaptchaService _captchaService;

        public UsersController(IAuthService authService, ICaptchaService captchaService)
        {
            _authService = authService;
            _captchaService = captchaService;
        }

        // POST: /api/v1/users
        [HttpPost]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            if (!await _captchaService.VerifyTokenAsync(request.CaptchaToken))
                return BadRequest(new { message = "Invalid reCAPTCHA verification" });

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
            if (!await _captchaService.VerifyTokenAsync(request.CaptchaToken))
                return BadRequest(new { message = "Invalid reCAPTCHA verification" });

            var result = await _authService.ResetPasswordAsync(request);
            return Ok(new { message = result });
        }
    }
}