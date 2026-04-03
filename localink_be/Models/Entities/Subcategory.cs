using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace localink_be.Models.Entities
{
    public class Subcategory
    {

        [Key]
        [Column("subcategory_id")]
        public int SubcategoryId { get; set; }
        
        [Column("subcategory_name")]
        public string SubcategoryName { get; set; } = null!;

        [Column("icon_url")]
        public string? IconUrl { get; set; } = null!;

        [Column("category_id")]
        public int CategoryId { get; set; }
        
        public Category Category { get; set; } = null!;
    }
}