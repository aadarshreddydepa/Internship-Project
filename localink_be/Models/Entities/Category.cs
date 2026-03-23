using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
public class Category
{
    [Key]
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = null!;
    public string IconUrl { get; set; } = null!;
}