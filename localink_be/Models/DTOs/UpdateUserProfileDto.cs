using System.ComponentModel.DataAnnotations;

public class UpdateUserProfileDto
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = "";

    [Phone]
    [MaxLength(15)]
    public string? Phone { get; set; }

    [Required]
    public AddressDto Address { get; set; } = new();
}