using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
 
[Table("business_hours")]
public class BusinessHour
{
    [Key]
    [Column("business_hour_id")]
    public long BusinessHourId { get; set; }
 
    [Required]
    [Column("business_id")]
    public long BusinessId { get; set; }
 
    [Required]
    [Column("day_of_week")]
    public string DayOfWeek { get; set; }
 
    [Required]
    [RegularExpression("^(custom|24h|closed)$", ErrorMessage = "Invalid mode")]
    [Column("mode")]
    public string Mode { get; set; }
 
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
 
    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
 
    public List<BusinessHourSlot> Slots { get; set; } = new();
}
