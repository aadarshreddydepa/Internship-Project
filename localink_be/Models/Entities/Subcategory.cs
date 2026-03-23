using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
public class Subcategory
{

    [Key]
    public int SubcategoryId { get; set; }
    public string SubcategoryName { get; set; } = null!;
    public string? IconUrl { get; set; } = null!;

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}