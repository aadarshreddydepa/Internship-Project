namespace localink_be.Models.DTOs
{
    public class SubcategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? IconUrl { get; set; } = null!;
        public int Count { get; set; }
    }
}