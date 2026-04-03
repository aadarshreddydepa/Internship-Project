using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace localink_be.Models.Entities
{
    [Table("business_hour_slots")]
    public class BusinessHourSlot
    {
        [Key]
        [Column("slot_id")]
        public long SlotId { get; set; }

        [Column("business_hour_id")]
        public long BusinessHourId { get; set; }

        [Column("open_time")]
        public TimeSpan OpenTime { get; set; }

        [Column("close_time")]
        public TimeSpan CloseTime { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
    }
}
