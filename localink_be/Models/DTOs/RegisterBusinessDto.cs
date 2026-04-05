using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace localink_be.Models.DTOs
{
    public class RegisterBusinessDto
    {
        // BUSINESS
        [Required(ErrorMessage = "Business name is required")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Business name must be between 2 and 200 characters")]
        public string BusinessName { get; set; } = string.Empty;

        [StringLength(2000, ErrorMessage = "Description cannot exceed 2000 characters")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Category is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Please select a valid category")]
        public int CategoryId { get; set; }

        [Required(ErrorMessage = "Subcategory is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Please select a valid subcategory")]
        public int SubcategoryId { get; set; }

        // CONTACT
        [Required(ErrorMessage = "Phone code is required")]
        public string PhoneCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phone number is required")]
        [RegularExpression(@"^[3-9][0-9]{9}$", ErrorMessage = "Phone number must be 10 digits starting with 3-9")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [RegularExpression(@"^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = string.Empty;

        [RegularExpression(@"^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$", ErrorMessage = "Invalid website format")]
        public string Website { get; set; } = string.Empty;

        [Required(ErrorMessage = "Address is required")]
        [StringLength(200, ErrorMessage = "Address cannot exceed 200 characters")]
        public string Address { get; set; } = string.Empty;

        [Required(ErrorMessage = "City is required")]
        [StringLength(100, ErrorMessage = "City cannot exceed 100 characters")]
        public string City { get; set; } = string.Empty;

        [Required(ErrorMessage = "State is required")]
        [StringLength(100, ErrorMessage = "State cannot exceed 100 characters")]
        public string State { get; set; } = string.Empty;

        [Required(ErrorMessage = "Country is required")]
        [StringLength(100, ErrorMessage = "Country cannot exceed 100 characters")]
        public string Country { get; set; } = string.Empty;

        [RegularExpression(@"^[1-9][0-9]{5}$", ErrorMessage = "Pincode must be a 6-digit number not starting with 0")]
        public string Pincode { get; set; } = string.Empty;

        public int UserId { get; set; }

        [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90")]
        public double? Latitude { get; set; }

        [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180")]
        public double? Longitude { get; set; }

        // HOURS
        public List<DayHoursDto> Hours { get; set; } = new List<DayHoursDto>();

        // PHOTO (base64)
        public string? Photo { get; set; }
    }

    public class DayDto
    {
        [Required]
        public string Day { get; set; } = string.Empty;

        [Required]
        public string Mode { get; set; } = string.Empty;

        public List<SlotDto> Slots { get; set; } = new List<SlotDto>();
    }

    public class SlotDto
    {
        [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Invalid time format")]
        public string Open { get; set; } = string.Empty;

        [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Invalid time format")]
        public string Close { get; set; } = string.Empty;
    }
}