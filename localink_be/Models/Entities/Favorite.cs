using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace localink_be.Models.Entities
{
    [Table("Favorites")]
    public class Favorite
    {
        [Key]
        [Column("favorite_id")]
        public long Id { get; set; }

        [Column("user_id")]
        public long UserId { get; set; }

        [Column("business_id")]
        public long BusinessId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        public User User { get; set; } = null!;
        public Business Business { get; set; } = null!;
    }
}
