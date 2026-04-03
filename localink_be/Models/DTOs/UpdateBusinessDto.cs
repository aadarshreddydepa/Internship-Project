public class UpdateBusinessDto
{
    public string BusinessName { get; set; }
    public string Description { get; set; }
    public int CategoryId { get; set; }
    public int SubcategoryId { get; set; }

    public string PhoneCode { get; set; }
    public string PhoneNumber { get; set; }
    public string Email { get; set; }

    public string City { get; set; }
    public string StreetAddress { get; set; }
    public string State { get; set; }
    public string Country { get; set; }
    public string Pincode { get; set; }
}