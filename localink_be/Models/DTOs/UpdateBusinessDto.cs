public class UpdateBusinessDto
{
    public string BusinessName { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int CategoryId { get; set; }
    public int SubcategoryId { get; set; }
    public string PhoneNumber { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string City { get; set; } = null!;
}