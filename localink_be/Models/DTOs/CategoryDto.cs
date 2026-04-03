namespace localink_be.Models.DTOs
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string IconUrl { get; set; } = null!;
    }
}