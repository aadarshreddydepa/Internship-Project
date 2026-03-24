using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("business_contact")]
public class BusinessContact
{
    [Key]
    [Column("contact_id")]
    public long ContactId { get; set; }

    [Column("business_id")]
    [Required(ErrorMessage = "BusinessId is required")]
    public long BusinessId { get; set; }

    [Column("phone_code")]
    [Required(ErrorMessage = "Phone code is required")]
    public string PhoneCode { get; set; }

    [Column("phone_number")]
    [Required(ErrorMessage = "Phone number is required")]
    [RegularExpression(@"^[3-9][0-9]{9}$", ErrorMessage = "Phone number must be 10 digits starting with 3–9")]
    public string PhoneNumber { get; set; }

    [Column("email")]
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [RegularExpression(@"^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", ErrorMessage = "Invalid email format")]
    public string Email { get; set; }

    [Column("website")]
    [RegularExpression(@"^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$", ErrorMessage = "Invalid website format")]
    public string Website { get; set; }

    [Column("street_address")]
    [Required(ErrorMessage = "Street address is required")]
    [StringLength(200, ErrorMessage = "Street address cannot exceed 200 characters")]
    public string StreetAddress { get; set; }

    [Column("city")]
    [Required(ErrorMessage = "City is required")]
    public string City { get; set; }

    [Column("state")]
    [Required(ErrorMessage = "State is required")]
    public string State { get; set; }

    [Column("country")]
    [Required(ErrorMessage = "Country is required")]
    public string Country { get; set; }

    [Column("pincode")]
    [RegularExpression(@"^[1-9][0-9]{5}$", ErrorMessage = "Pincode must be a 6-digit number not starting with 0")]
    public string Pincode { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    public Business Business { get; set; } = null!;
}