using Microsoft.AspNetCore.Mvc;
using localink_be.Services.Interfaces;
using localink_be.Models.DTOs;
using localink_be.Models.Entities;
using System.Threading.Tasks;

namespace localink_be.Controllers
{
    [ApiController]
    [Route("api/v1/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ICaptchaService _captchaService;

        public AuthController(IAuthService authService, ICaptchaService captchaService)
        {
            _authService = authService;
            _captchaService = captchaService;
        }

        // LOGIN
        [HttpPost("sessions")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!await _captchaService.VerifyTokenAsync(request.CaptchaToken))
                return BadRequest(new { message = "Invalid reCAPTCHA verification" });

            var result = await _authService.LoginAsync(request);
            return Ok(result);
        }

        // REGISTER
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!await _captchaService.VerifyTokenAsync(request.CaptchaToken))
                return BadRequest(new { message = "Invalid reCAPTCHA verification" });

            var result = await _authService.RegisterAsync(request);
            return Ok(new { message = result });
        }
    }
}