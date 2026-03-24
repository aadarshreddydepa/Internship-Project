using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
public class BusinessContact
{
    [Key]
    public long ContactId { get; set; }

    public long BusinessId { get; set; }
     [Column("phone_code")]
    public string? PhoneCode { get; set; }
    public string PhoneNumber { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Website { get; set; }

    public string StreetAddress { get; set; } = null!;
    public string City { get; set; } = null!;
    public string State { get; set; } = null!;
    public string Country { get; set; } = null!;
    public string Pincode { get; set; } = null!;

    public Business Business { get; set; } = null!;
}