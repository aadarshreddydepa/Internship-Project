public class RegisterBusinessDto
{
    // BUSINESS
    public string BusinessName { get; set; }
    public string Description { get; set; }
    public int CategoryId { get; set; }
    public int SubcategoryId { get; set; }

    // CONTACT
    public string PhoneCode { get; set; }
    public string PhoneNumber { get; set; }
    public string Email { get; set; }
    public string Website { get; set; }
    public string Address { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string Country { get; set; }
    public string Pincode { get; set; }
    public int UserId {get; set;}

    // HOURS
    public List<DayHoursDto> Hours { get; set; }

    // PHOTO (base64)
    public string? Photo { get; set; }
}

public class DayDto
{
    public string Day { get; set; }
    public string Mode { get; set; }
    public List<SlotDto> Slots { get; set; }
}

public class SlotDto
{
    public string Open { get; set; }
    public string Close { get; set; }
}