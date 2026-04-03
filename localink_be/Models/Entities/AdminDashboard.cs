using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace localink_be.Models.Entities
{
    [Table("admin_dashboard")]
    public class AdminDashboard
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("business_id")]
        public long BusinessId { get; set; }

    [Required]
    public BusinessStatus Status { get; set; } = BusinessStatus.Pending;

        [Column("rejection_reason")]
        public string? RejectionReason { get; set; }

    [Column("action_by")]
    public long? ActionBy { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [ForeignKey("BusinessId")]
        public Business Business { get; set; } = null!;
    }
}