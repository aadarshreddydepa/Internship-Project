using System.ComponentModel.DataAnnotations;

namespace localink_be.Models.DTOs
{
    public class VerifyEmailRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}
