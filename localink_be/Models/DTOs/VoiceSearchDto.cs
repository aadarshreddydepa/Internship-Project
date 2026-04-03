namespace localink_be.Models.DTOs
{
    public class VoiceSearchRequest
    {
        public string Query { get; set; } = string.Empty;
        public bool OpenNow { get; set; }
        public int Radius { get; set; } = 5;
        public string? Category { get; set; }
        public string? Language { get; set; } = "en";
    }

    public class VoiceSearchResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<BusinessDto> Results { get; set; } = new();
        public int TotalCount { get; set; }
        public VoiceSearchFilters? AppliedFilters { get; set; }
    }

    public class VoiceSearchFilters
    {
        public string? Query { get; set; }
        public bool OpenNow { get; set; }
        public int RadiusKm { get; set; }
        public string? Category { get; set; }
    }
}
