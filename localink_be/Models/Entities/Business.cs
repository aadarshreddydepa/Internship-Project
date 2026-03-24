using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Business
{
    [Key]
    public long BusinessId { get; set; }
    public long UserId { get; set; } 
    public AdminDashboard? AdminDashboard { get; set; }

    public User User { get; set; } = null!; 
    public string BusinessName { get; set; } = null!;
    public string Description { get; set; } = null!;

    public int CategoryId { get; set; }
    public int SubcategoryId { get; set; }

    public Category Category { get; set; } = null!;
    public Subcategory Subcategory { get; set; } = null!;
}