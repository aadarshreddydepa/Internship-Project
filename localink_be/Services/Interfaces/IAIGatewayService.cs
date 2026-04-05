using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Caching.Memory;

namespace localink_be.Services.Interfaces
{
    /// <summary>
    /// Unified AI Gateway Service - Single entry point for ALL AI operations
    /// Handles: Speech-to-Text, Translation, Intent Parsing
    /// Implements caching, retries, and fallback mechanisms
    /// </summary>
    public interface IAIGatewayService
    {
        /// <summary>
        /// Transcribe audio to text using Groq Whisper API
        /// </summary>
        Task<TranscriptionResult> TranscribeAudioAsync(byte[] audioData, string? language = null);
        
        /// <summary>
        /// Translate text to target language using Groq LLM
        /// </summary>
        Task<TranslationResult> TranslateTextAsync(string text, string targetLang, string? sourceLang = null);
        
        /// <summary>
        /// Parse user intent from natural language text
        /// </summary>
        Task<IntentResult> ParseIntentAsync(string text);
        
        /// <summary>
        /// Check if AI services are available
        /// </summary>
        Task<bool> HealthCheckAsync();

        /// <summary>
        /// Translate JSON content to target language while preserving structure
        /// Translates only string values, not keys
        /// </summary>
        Task<JsonTranslationResult> TranslateJsonAsync(string json, string targetLang);
    }

    public class TranscriptionResult
    {
        public bool Success { get; set; }
        public string? Transcript { get; set; }
        public string? Language { get; set; }
        public string? Error { get; set; }
        public bool UsedFallback { get; set; }
    }

    public class TranslationResult
    {
        public bool Success { get; set; }
        public string? TranslatedText { get; set; }
        public string SourceLang { get; set; } = "en";
        public string TargetLang { get; set; } = "en";
        public string? Error { get; set; }
        public bool UsedFallback { get; set; }
    }

    public class IntentResult
    {
        public bool Success { get; set; }
        public string Intent { get; set; } = "unknown";
        public string? Category { get; set; }
        public string? Query { get; set; }
        public bool OpenNow { get; set; }
        public int? RadiusKm { get; set; }
        public Dictionary<string, object>? Metadata { get; set; }
        public string? Error { get; set; }
    }

    public class JsonTranslationResult
    {
        public bool Success { get; set; }
        public string? TranslatedJson { get; set; }
        public string TargetLang { get; set; } = "en";
        public string? Error { get; set; }
        public bool UsedFallback { get; set; }
    }
}
