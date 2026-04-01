using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace localink_be.Models.Entities
{
    [Table("addresses")]
    public class Address
    {
        [Key]
        [Column("address_id")]
        public long AddressId { get; set; }

        [Required]
        [Column("user_id")]
        public long UserId { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("country")]
        public string Country { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [Column("state")]
        public string State { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [Column("city")]
        public string City { get; set; } = string.Empty;

        [MaxLength(200)]
        [Column("street_address")]
        public string StreetAddress { get; set; } = string.Empty;

        [MaxLength(10)]
        [Column("pincode")]
        public string Pincode { get; set; } = string.Empty;
    }
}