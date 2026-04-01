using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace localink_be.Models.Entities
{
    [Table("business_photos")]
    public class BusinessPhoto
    {
        [Key]
        [Column("photo_id")]
        public long PhotoId { get; set; }

        [Column("business_id")]
        public long BusinessId { get; set; }

        [Column("image_url")]
        public string ImageUrl { get; set; } = default!;

        [Column("is_primary")]
        public bool IsPrimary { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        
        public Business Business { get; set; } = null!;
    }
}