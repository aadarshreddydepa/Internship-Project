public class BusinessDto
{
    public long Id { get; set; }   
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string CategoryName { get; set; } = null!;
    public string SubcategoryName { get; set; } = null!;

    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }

    public string? City { get; set; }
    public string? State { get; set; }

    public string? PrimaryImage { get; set; }
    public int SubcategoryId { get; set; }
}