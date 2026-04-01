using System.ComponentModel.DataAnnotations;

namespace localink_be.Models.DTOs
{
    public class ForgotPasswordRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;

        public string? CaptchaToken { get; set; }
    }
}