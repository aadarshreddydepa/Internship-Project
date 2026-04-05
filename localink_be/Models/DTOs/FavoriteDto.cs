using System.ComponentModel.DataAnnotations;

namespace localink_be.Models.DTOs
{
    public class FavoriteDto
    {
        [Required(ErrorMessage = "User ID is required")]
        [Range(1, long.MaxValue, ErrorMessage = "Invalid User ID")]
        public long UserId { get; set; }

        [Required(ErrorMessage = "Business ID is required")]
        [Range(1, long.MaxValue, ErrorMessage = "Invalid Business ID")]
        public long BusinessId { get; set; }
    }
}
