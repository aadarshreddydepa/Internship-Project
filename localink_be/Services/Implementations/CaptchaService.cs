using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using localink_be.Services.Interfaces;

namespace localink_be.Services.Implementations
{
    public class CaptchaService : ICaptchaService
    {
        private readonly HttpClient _httpClient;
        private readonly string _secretKey;

        public CaptchaService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _secretKey = configuration["Captcha:SecretKey"];
        }

        public async Task<bool> VerifyTokenAsync(string token)
        {
            if (string.IsNullOrEmpty(token)) return false;

            var response = await _httpClient.PostAsync(
                $"https://www.google.com/recaptcha/api/siteverify?secret={_secretKey}&response={token}",
                null
            );

            if (!response.IsSuccessStatusCode) return false;

            var result = await response.Content.ReadFromJsonAsync<CaptchaResponse>();
            return result?.Success ?? false;
        }
    }

    public class CaptchaResponse
    {
        public bool Success { get; set; }
    }
}
