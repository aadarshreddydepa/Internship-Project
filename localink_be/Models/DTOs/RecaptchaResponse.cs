using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations;

public class RecaptchaResponse
{
    [JsonPropertyName("success")]
    [Required]
    public bool Success { get; set; }

    [JsonPropertyName("challenge_ts")]
    public string ChallengeTs { get; set; }

    [JsonPropertyName("hostname")]
    public string Hostname { get; set; }

    [JsonPropertyName("error-codes")]
    public List<string> ErrorCodes { get; set; }
}