using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
public class BusinessPhoto
{
    [Key]
    public long PhotoId { get; set; }
    public long BusinessId { get; set; }

    public string ImageUrl { get; set; } = null!;
    public bool IsPrimary { get; set; }

    public Business Business { get; set; } = null!;
}