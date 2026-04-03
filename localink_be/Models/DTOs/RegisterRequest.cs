using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
public class RegisterRequest
{
    [Required]
    public string UserType { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [Phone]
    public string Phone { get; set; } = string.Empty;

    [Required]
    public string CountryCode { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    [RegularExpression(@"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$",
    ErrorMessage = "Password must contain uppercase, lowercase and number")]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string Country { get; set; } = string.Empty;

    [Required]
    public string State { get; set; } = string.Empty;

    [Required]
    public string City { get; set; } = string.Empty;

    public string Street { get; set; } = string.Empty;

    public string Pincode { get; set; } = string.Empty;
}